import type { Event, City } from '@/types'
import type { DataProvider, EventFilters } from '@/lib/data/types'
import { fetchJson } from '@/lib/data/fetch-wrapper'
import { memoize } from '@/lib/data/cache'
import { normalizeEvent } from '@/lib/data/normalize'

/**
 * Ticketmaster Discovery API — structured, authoritative ticketing data.
 * Requires TICKETMASTER_API_KEY.
 * Tier 2 (marketplace — known organizer data, real ticket listings).
 */

const ENDPOINT = 'https://app.ticketmaster.com/discovery/v2/events.json'
const TTL_MS = 15 * 60 * 1000

// Ticketmaster uses ISO 2 country codes
const COUNTRIES: Array<{ code: string; cities: City[] }> = [
  { code: 'AE', cities: ['Abu Dhabi', 'Dubai'] },
  { code: 'SA', cities: ['Riyadh'] },
  { code: 'QA', cities: ['Doha'] },
]

interface TmResponse {
  _embedded?: {
    events?: Array<{
      name: string
      id: string
      dates?: { start?: { localDate?: string; dateTime?: string }; end?: { localDate?: string } }
      info?: string
      description?: string
      url?: string
      classifications?: Array<{
        segment?: { name?: string }
        genre?: { name?: string }
        family?: boolean
      }>
      _embedded?: {
        venues?: Array<{
          name?: string
          city?: { name?: string }
        }>
      }
      priceRanges?: Array<{ min?: number; max?: number; currency?: string }>
    }>
  }
}

export const ticketmasterProvider: DataProvider = {
  meta: {
    id: 'ticketmaster',
    kind: 'marketplace',
    label: 'Ticketmaster',
    default_tier: 'Tier 2',
    enabled: Boolean(process.env.TICKETMASTER_API_KEY) && process.env.EIPP_DATA_MODE === 'live',
  },

  async getEvents(filters?: EventFilters): Promise<Event[]> {
    if (!this.meta.enabled) return []
    const apiKey = process.env.TICKETMASTER_API_KEY as string

    const countriesToHit = scopeCountries(filters?.city)
    const results: Event[] = []

    await Promise.all(
      countriesToHit.map(async country => {
        const url = buildUrl(apiKey, country.code, filters)
        const cacheKey = `ticketmaster:${country.code}:${filters?.category ?? 'all'}`

        try {
          const json = await memoize(cacheKey, TTL_MS, () =>
            fetchJson<TmResponse>(url, { timeout_ms: 8000 }),
          )

          const events = json._embedded?.events ?? []
          for (const e of events) {
            const normalized = toEvent(e)
            if (normalized) results.push(normalized)
          }
        } catch (err) {
          console.error(`[ticketmaster:${country.code}]`, err instanceof Error ? err.message : err)
        }
      }),
    )

    return results
  },

  async healthCheck() {
    if (!this.meta.enabled) return false
    try {
      const url = `${ENDPOINT}?apikey=${process.env.TICKETMASTER_API_KEY}&countryCode=AE&size=1`
      await fetchJson<TmResponse>(url, { timeout_ms: 3000, retries: 0 })
      return true
    } catch {
      return false
    }
  },
}

function buildUrl(apiKey: string, countryCode: string, filters?: EventFilters): string {
  const params = new URLSearchParams({
    apikey: apiKey,
    countryCode,
    size: '50',
    sort: 'date,asc',
  })
  if (filters?.category) params.set('classificationName', mapCategoryToSegment(filters.category))
  return `${ENDPOINT}?${params.toString()}`
}

function scopeCountries(city?: EventFilters['city']): typeof COUNTRIES {
  if (!city) return COUNTRIES
  const cities = Array.isArray(city) ? city : [city]
  return COUNTRIES.filter(c => c.cities.some(cc => cities.includes(cc)))
}

function mapCategoryToSegment(cat: string): string {
  // Ticketmaster's classification vocabulary
  switch (cat) {
    case 'Sports':        return 'Sports'
    case 'Family':        return 'Family'
    case 'Entertainment': return 'Music'   // broadest entertainment bucket; we re-classify in normalize
    default:              return ''
  }
}

/* ── Per-event transform ─────────────────────────────────────── */

function toEvent(raw: NonNullable<NonNullable<TmResponse['_embedded']>['events']>[number]): Event | null {
  const startDate = raw.dates?.start?.localDate ?? raw.dates?.start?.dateTime ?? null
  if (!raw.name || !startDate) return null

  const venue = raw._embedded?.venues?.[0]
  const classification = raw.classifications?.[0]
  const segmentName = classification?.segment?.name ?? ''
  const isFamily = classification?.family === true

  const price = raw.priceRanges?.[0]

  return normalizeEvent(
    {
      name: raw.name,
      description: raw.info ?? raw.description ?? '',
      start_date: startDate,
      end_date: raw.dates?.end?.localDate,
      venue: venue?.name ?? 'TBA',
      city: venue?.city?.name,
      url: raw.url,
      ticket_price_min: price?.min,
      ticket_price_max: price?.max,
      external_category_hint: isFamily ? 'Family' : segmentName,
    },
    { sourceId: 'ticketmaster', sourceType: 'marketplace', defaultTier: 'Tier 2' },
  )
}
