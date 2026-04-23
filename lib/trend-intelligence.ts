/**
 * Trend intelligence — rising / declining / emerging.
 * Consumes the merged event stream (mock + live news + marketplace)
 * and surfaces directional signals for the Chairman brief.
 *
 * Horizon: next 6 months vs prior 6 months. External-source weights
 * from lib/trend-analyzer.ts flow through because we use source_type here too.
 */

import type {
  Category, Event, EventFormat, TrendReport, TrendSignal, EmergingFormat, TrendDirection,
} from '@/types'

const CATEGORIES: Category[] = ['Family', 'Entertainment', 'Sports']
const SIX_MONTHS_MS = 6 * 30 * 24 * 3600 * 1000

// Source weights — marketplace (real tickets) is the strongest demand signal
const SOURCE_WEIGHT: Record<string, number> = {
  marketplace: 2.0,
  news:        1.2,
  government:  0.6,
}

export function getTrendSignals(events: Event[], now: Date = new Date()): TrendReport {
  const nowMs = now.getTime()

  const recent = events.filter(e => {
    const t = new Date(e.start_date).getTime()
    return t >= nowMs && t < nowMs + SIX_MONTHS_MS
  })
  const historical = events.filter(e => {
    const t = new Date(e.start_date).getTime()
    return t >= nowMs - SIX_MONTHS_MS && t < nowMs
  })

  const signals = CATEGORIES.map(cat => buildCategorySignal(cat, recent, historical))

  const emerging_formats = buildEmergingFormats(recent, historical)

  const recommended_focus = signals
    .filter(s => s.direction === 'rising')
    .map(s => ({
      category: s.category,
      reason: `${s.category} momentum is +${Math.round(s.momentum * 100)}% vs prior 6 months.`,
    }))

  return { signals, emerging_formats, recommended_focus }
}

// ─── Per-category signal ────────────────────────────────────

function buildCategorySignal(cat: Category, recent: Event[], historical: Event[]): TrendSignal {
  const recentWeight = weightedCount(recent.filter(e => e.category === cat))
  const historicalWeight = weightedCount(historical.filter(e => e.category === cat))

  const momentum = normalizedChange(recentWeight, historicalWeight)
  const direction: TrendDirection =
    momentum >  0.15 ? 'rising'
  : momentum < -0.15 ? 'declining'
  :                   'stable'

  const evidence = buildEvidence(cat, recent, historical)

  return { category: cat, direction, momentum: clamp(momentum, -1, 1), evidence }
}

function weightedCount(events: Event[]): number {
  return events.reduce((sum, e) => sum + (SOURCE_WEIGHT[e.source_type] ?? 1), 0)
}

function normalizedChange(recent: number, historical: number): number {
  if (historical === 0) return recent > 0 ? 1 : 0
  return (recent - historical) / historical
}

function buildEvidence(cat: Category, recent: Event[], historical: Event[]): string[] {
  const r = recent.filter(e => e.category === cat)
  const h = historical.filter(e => e.category === cat)
  const marketRecent = r.filter(e => e.source_type === 'marketplace').length
  const newsRecent = r.filter(e => e.source_type === 'news').length
  const out: string[] = [`${r.length} upcoming vs ${h.length} past`]
  if (marketRecent) out.push(`${marketRecent} on ticketing platforms`)
  if (newsRecent)   out.push(`${newsRecent} in news coverage`)
  return out
}

// ─── Emerging formats ───────────────────────────────────────

function buildEmergingFormats(recent: Event[], historical: Event[]): EmergingFormat[] {
  const tally = new Map<EventFormat, { r: number; h: number; samples: string[] }>()

  const bump = (format: EventFormat, which: 'r' | 'h', name?: string) => {
    const e = tally.get(format) ?? { r: 0, h: 0, samples: [] }
    e[which]++
    if (which === 'r' && name && e.samples.length < 3 && !e.samples.includes(name)) {
      e.samples.push(name)
    }
    tally.set(format, e)
  }

  for (const e of recent)     bump(e.event_format, 'r', e.name)
  for (const e of historical) bump(e.event_format, 'h')

  return Array.from(tally.entries())
    .map(([format, { r, h, samples }]) => ({
      format,
      growth: clamp(normalizedChange(r, h), -1, 1),
      sample_events: samples,
    }))
    .filter(f => f.growth > 0.2 && f.sample_events.length > 0)
    .sort((a, b) => b.growth - a.growth)
    .slice(0, 4)
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n))
}
