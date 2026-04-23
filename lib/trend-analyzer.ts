import type { Category, Event } from '@/types'

/**
 * Compute a "trend heat" score per category from the merged event stream.
 * Higher score = more current signal from external sources (news coverage +
 * marketplace listings). Recent / upcoming events weigh more.
 *
 * Output scale is arbitrary; only ratios between categories matter.
 * The recommender uses this to bias concept ordering — a strong Sports
 * trend nudges Sports gap-concepts above others of equal gap score.
 */
export interface CategoryTrends {
  Family: number
  Entertainment: number
  Sports: number
  /** Total for normalization */
  total: number
}

const SOURCE_WEIGHTS = {
  government:  0.5,   // gov data is noise for trend — stable baseline, not signal
  marketplace: 2.0,   // real tickets selling = real demand
  news:        1.2,   // chatter is a leading indicator
} as const

const HORIZON_DAYS = 90

export function computeCategoryTrends(events: Event[], now: Date = new Date()): CategoryTrends {
  const scores: CategoryTrends = { Family: 0, Entertainment: 0, Sports: 0, total: 0 }
  const nowMs = now.getTime()
  const horizonMs = HORIZON_DAYS * 24 * 3600 * 1000

  for (const e of events) {
    const ageMs = Math.abs(nowMs - new Date(e.start_date).getTime())
    // Linear decay over 90 days; older than that → no weight
    const recency = Math.max(0, 1 - ageMs / horizonMs)
    if (recency === 0) continue

    const weight = SOURCE_WEIGHTS[e.source_type] ?? 1
    scores[e.category] += recency * weight
  }

  scores.total = scores.Family + scores.Entertainment + scores.Sports
  return scores
}

/**
 * Normalize a category trend into a 0–1 boost factor for a recommendation.
 * Returns ~1.0 when the category is at the portfolio average,
 * ~1.2–1.3 when it dominates, and ~0.8 when it's underrepresented.
 */
export function trendBoost(trends: CategoryTrends, category: Category): number {
  if (trends.total === 0) return 1
  const share = trends[category] / trends.total
  const expected = 1 / 3
  // 1 ± up to 30% based on relative over/underweight
  return 1 + Math.max(-0.3, Math.min(0.3, (share - expected) * 1.5))
}
