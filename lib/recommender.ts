import type {
  Category, City, EventConcept, Event, EventFormat, GapReport,
} from '@/types'
import { computeCategoryTrends, trendBoost, type CategoryTrends } from './trend-analyzer'

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface ConceptTemplate {
  title: string
  category: Category
  event_format: EventFormat
  base_audience: number
  base_budget: number
}

const TEMPLATES: ConceptTemplate[] = [
  { title: 'Yas Island Family Summer Splash',     category: 'Family',        event_format: 'Festival',   base_audience: 40000, base_budget: 6_000_000 },
  { title: 'Abu Dhabi Night Run Festival',        category: 'Sports',        event_format: 'Tournament', base_audience: 15000, base_budget: 4_000_000 },
  { title: 'Heritage & Culture Weekend',          category: 'Family',        event_format: 'Festival',   base_audience: 35000, base_budget: 5_000_000 },
  { title: 'UAE Esports Championship',            category: 'Entertainment', event_format: 'Tournament', base_audience: 25000, base_budget: 9_000_000 },
  { title: 'Corniche Open Water Swimming Series', category: 'Sports',        event_format: 'Tournament', base_audience: 8000,  base_budget: 2_500_000 },
  { title: 'AD Family Camping Festival',          category: 'Family',        event_format: 'Festival',   base_audience: 20000, base_budget: 3_500_000 },
  { title: 'Desert Drone Racing Cup',             category: 'Sports',        event_format: 'Tournament', base_audience: 12000, base_budget: 5_000_000 },
  { title: 'AD Comedy & Culture Night',           category: 'Entertainment', event_format: 'Concert',    base_audience: 10000, base_budget: 3_000_000 },
  { title: 'Kids Creative Arts Festival',         category: 'Family',        event_format: 'Festival',   base_audience: 30000, base_budget: 4_000_000 },
  { title: 'Indoor Padel Championship AD',        category: 'Sports',        event_format: 'Tournament', base_audience: 8000,  base_budget: 2_000_000 },
  { title: 'Abu Dhabi Food & Music Street Fair',  category: 'Entertainment', event_format: 'Festival',   base_audience: 50000, base_budget: 7_000_000 },
  { title: 'Family Beach Olympics',               category: 'Family',        event_format: 'Tournament', base_audience: 25000, base_budget: 3_500_000 },
  { title: 'AD Indie Film & Music Expo',          category: 'Entertainment', event_format: 'Exhibition', base_audience: 18000, base_budget: 5_500_000 },
  { title: 'Saadiyat Tennis Open',                category: 'Sports',        event_format: 'Tournament', base_audience: 22000, base_budget: 12_000_000 },
]

function confidenceFor(gap: number): EventConcept['confidence'] {
  if (gap >= 0.9) return 'High'
  if (gap >= 0.6) return 'Medium'
  return 'Low'
}

let idCounter = 0

interface ScoredSlot {
  month: number
  category: Category
  city: City
  gap_score: number
  composite: number   // gap_score * trendBoost
}

export interface RecommenderOptions {
  limit?: number
  comparableCities?: City[]
  /** Supply trend data to bias recommendations toward what external sources are signalling. */
  trends?: CategoryTrends
}

export function generateRecommendations(
  adReport: GapReport,
  allEvents: Event[],
  limitOrOpts: number | RecommenderOptions = 6,
  legacyComparable?: City[],
): EventConcept[] {
  // Backwards-compatible signature — callers pass `limit` + optional `comparableCities`
  const opts: RecommenderOptions =
    typeof limitOrOpts === 'number'
      ? { limit: limitOrOpts, comparableCities: legacyComparable }
      : limitOrOpts

  const limit = opts.limit ?? 6
  const comparableCities = opts.comparableCities ?? ['Dubai', 'Riyadh', 'Doha']
  const trends = opts.trends ?? computeCategoryTrends(allEvents)

  // Score each high-gap slot by (gap_score × category trend boost).
  // Gap still dominates — trends are a tiebreaker, not an override.
  const scoredSlots: ScoredSlot[] = adReport.slots
    .filter(s => s.gap_score >= 0.6)
    .map(s => ({
      month: s.month,
      category: s.category,
      city: s.city,
      gap_score: s.gap_score,
      composite: s.gap_score * trendBoost(trends, s.category),
    }))
    .sort((a, b) => b.composite - a.composite)

  const usedTitles = new Set<string>()
  const concepts: EventConcept[] = []

  for (const slot of scoredSlots) {
    if (concepts.length >= limit) break

    const template = TEMPLATES.find(
      t => t.category === slot.category && !usedTitles.has(t.title)
    )
    if (!template) continue
    usedTitles.add(template.title)

    const referenceEvents = allEvents.filter(e => {
      const d = new Date(e.start_date)
      return (
        comparableCities.includes(e.city) &&
        e.category === slot.category &&
        d.getMonth() + 1 === slot.month
      )
    }).slice(0, 3)

    concepts.push({
      id: `rec-${++idCounter}`,
      title: template.title,
      category: slot.category,
      event_format: template.event_format,
      suggested_month: slot.month,
      suggested_city: slot.city,
      estimated_audience: Math.round(template.base_audience * (1 + slot.gap_score * 0.3)),
      estimated_budget: template.base_budget,
      reason: buildReason(slot.city, slot.month, slot.category, referenceEvents, slot, trends),
      reference_events: referenceEvents.map(e => e.id),
      gap_score: slot.gap_score,
      confidence: confidenceFor(slot.gap_score),
    })
  }

  return concepts
}

/**
 * Reason citations now include a trend note when the external-source signal
 * for this category is strongly above or below average — director sees WHY
 * the rec is ordered the way it is.
 */
function buildReason(
  city: City,
  month: number,
  category: Category,
  refs: Event[],
  slot: ScoredSlot,
  trends: CategoryTrends,
): string {
  const m = MONTH_NAMES[month]
  const base = refs.length
    ? `${city} has no ${category} events in ${m}. Regional precedent: ${refs.slice(0, 2).map(r => r.name).join(', ')}.`
    : `${city} has no ${category} events in ${m}. Low-competition window.`

  const trendNote = trendNoteFor(category, trends)
  return trendNote ? `${base} ${trendNote}` : `${base} High-impact gap with proven demand signal.`
}

function trendNoteFor(category: Category, trends: CategoryTrends): string | null {
  if (trends.total === 0) return null
  const share = trends[category] / trends.total
  if (share >= 0.45) {
    return `External signal is hot: ${Math.round(share * 100)}% of recent news + ticket chatter.`
  }
  if (share <= 0.20) {
    return `External signal is quiet here — early-mover timing.`
  }
  return null
}
