import type { Event } from '@/types'
import type { DataProvider, EventFilters } from './types'
import { mockFallback } from './fallback'

import { googleNewsProvider }  from './connectors/news/google-news-provider'
import { newsapiProvider }     from './connectors/news/newsapi-provider'
import { ticketmasterProvider } from './connectors/marketplace/ticketmaster-provider'

/**
 * Registered in priority order — higher tiers first.
 * When duplicates appear (same name + city + date), the highest-tier wins.
 */
const CONNECTORS: DataProvider[] = [
  ticketmasterProvider,   // Tier 2 (marketplace, structured)
  googleNewsProvider,     // Tier 3 (news RSS)
  newsapiProvider,        // Tier 3 (news JSON)
]

export async function getEventsFromAllSources(filters?: EventFilters): Promise<Event[]> {
  const active = CONNECTORS.filter(c => c.meta.enabled)

  // No connectors enabled → straight to mock. No log noise, no failure.
  if (active.length === 0) return mockFallback(filters)

  const results = await Promise.allSettled(
    active.map(c => c.getEvents(filters))
  )

  const collected: Event[] = []
  const failures: string[] = []

  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      if (r.value.length === 0) {
        // Empty result isn't a failure — it's just quiet from that source
        return
      }
      collected.push(...r.value)
    } else {
      failures.push(active[i].meta.id)
      console.error(`[data] connector "${active[i].meta.id}" failed:`, r.reason)
    }
  })

  // If everything failed or nothing useful came back, degrade to mock.
  // Don't leave the UI blank when infra misbehaves.
  if (collected.length === 0) {
    if (failures.length) {
      console.warn(`[data] ${failures.length} connector(s) failed; falling back to mock`)
    }
    return mockFallback(filters)
  }

  // Include mock data too — real sources don't cover the full 2025 calendar,
  // so we blend the editorial mock dataset with live signals for completeness.
  const mock = await mockFallback(filters)
  const merged = dedupe([...collected, ...mock])
  return applyFilters(merged, filters)
}

/* ── Dedupe: same name + city + start_date (to within 2 days) ───────── */

function dedupe(events: Event[]): Event[] {
  const seen = new Map<string, Event>()
  const TWO_DAYS = 2 * 24 * 3600 * 1000

  for (const e of events) {
    // Exact key on normalized name + city + ISO date
    const key = `${normalizeName(e.name)}|${e.city}|${e.start_date}`
    const existing = seen.get(key)
    if (!existing) {
      // Also look for near-date matches
      let nearMatch: Event | null = null
      for (const [k, v] of seen) {
        const [name, city] = k.split('|')
        if (name === normalizeName(e.name) && city === e.city) {
          const dt = Math.abs(new Date(v.start_date).getTime() - new Date(e.start_date).getTime())
          if (dt <= TWO_DAYS) { nearMatch = v; break }
        }
      }
      if (nearMatch && tierRank(e) <= tierRank(nearMatch)) continue
      seen.set(key, e)
    } else if (tierRank(e) > tierRank(existing)) {
      seen.set(key, e)  // higher tier wins
    }
  }

  return Array.from(seen.values())
}

function normalizeName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '').trim()
}

function tierRank(e: Event): number {
  return ({ 'Tier 1': 3, 'Tier 2': 2, 'Tier 3': 1 } as const)[e.verification_level] ?? 0
}

function applyFilters(events: Event[], filters?: EventFilters): Event[] {
  let out = events
  if (filters?.city) {
    const cities = Array.isArray(filters.city) ? filters.city : [filters.city]
    out = out.filter(e => cities.includes(e.city))
  }
  if (filters?.category) out = out.filter(e => e.category === filters.category)
  if (filters?.year)     out = out.filter(e => new Date(e.start_date).getFullYear() === filters.year)
  if (filters?.month)    out = out.filter(e => new Date(e.start_date).getMonth() + 1 === filters.month)
  return out.sort((a,b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
}
