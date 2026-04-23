/**
 * Decision Engine v2 — rule-based, explainable, 4-bucket output.
 *
 * Rules intentionally simple so a Director can trace any decision to a
 * specific numeric threshold and factor. No ML. No black box.
 *
 *   FUND   — portfolio_score > 7 AND strategic_fit ≥ 7.5
 *   SCALE  — 5 ≤ portfolio_score ≤ 7
 *   DROP   — portfolio_score < 4
 *   CREATE — gap_score > 0.7 with no existing category+month coverage
 *
 * Constraints layer adds category balance, seasonality, budget utilization,
 * and geographic-competition context to the returned bundle.
 */

import type {
  City, Category, Event, EnrichedGapSlot, PortfolioEvent,
  EventDecision, CreateDecision, DecisionConfidence, DecisionConstraints,
  DecisionPanel, KeyFactor, EventConcept, FactorSignal,
} from '@/types'
import { generateRecommendations } from './recommender'
import { computeCategoryTrends, trendBoost } from './trend-analyzer'

// ── Thresholds (explicit, tunable) ──────────────────────────

const T = {
  FUND_SCORE_MIN:         7.0,
  FUND_STRATEGIC_MIN:     7.5,
  SCALE_SCORE_MIN:        5.0,
  SCALE_SCORE_MAX:        7.0,
  DROP_SCORE_MAX:         4.0,
  CREATE_GAP_MIN:         0.7,
  CATEGORY_MIN_COUNT:     2,
  SEASONALITY_PEAK:       5,    // events per month to count as peak
  SEASONALITY_LOW:        1,
  BUDGET_OVERRUN_BUFFER:  0.03, // 3% slack before flagging
  BUCKET_LIMIT_DEFAULT:   3,
  BUCKET_LIMIT_CREATE:    4,
} as const

// ── Inputs ──────────────────────────────────────────────────

export interface DecisionEngineInput {
  events: PortfolioEvent[]     // scored portfolio (filtered to focus scope)
  allEvents: Event[]           // full dataset — needed for competition signal
  gaps?: EnrichedGapSlot[]     // enriched gap slots for the target city
  budget: number
  targetCity: City
  comparisonCity?: City        // for geographic competition; defaults to Dubai
  perBucketLimit?: number
  perCreateLimit?: number
}

// ── Entry point ─────────────────────────────────────────────

export function generateDecisions(input: DecisionEngineInput): DecisionPanel {
  const comparisonCity = input.comparisonCity ?? (input.targetCity === 'Dubai' ? 'Abu Dhabi' : 'Dubai')
  const bucketLimit = input.perBucketLimit ?? T.BUCKET_LIMIT_DEFAULT
  const createLimit = input.perCreateLimit ?? T.BUCKET_LIMIT_CREATE

  const fund   = buildFund(input.events, input.gaps, input.allEvents, input.targetCity, comparisonCity, bucketLimit)
  const scale  = buildScale(input.events, bucketLimit)
  const drop   = buildDrop(input.events, bucketLimit)
  const create = buildCreate(input.gaps, input.allEvents, input.events, input.targetCity, createLimit)

  const constraints = summarizeConstraints({
    events: input.events,
    budget: input.budget,
    allEvents: input.allEvents,
    targetCity: input.targetCity,
    comparisonCity,
  })

  return { fund, scale, drop, create, constraints }
}

// ═════ FUND ══════════════════════════════════════════════════

function buildFund(
  events: PortfolioEvent[],
  gaps: EnrichedGapSlot[] | undefined,
  allEvents: Event[],
  targetCity: City,
  comparisonCity: City,
  limit: number,
): EventDecision[] {
  return events
    .filter(e => e.status !== 'Dropped' && e.status !== 'Proposed')
    .filter(e => e.portfolio_score > T.FUND_SCORE_MIN)
    .filter(e => e.strategic_fit_score >= T.FUND_STRATEGIC_MIN)
    .sort((a, b) => b.portfolio_score - a.portfolio_score)
    .slice(0, limit)
    .map(event => {
      const factors: KeyFactor[] = [
        kf('Score',         event.portfolio_score.toFixed(1),          'positive'),
        kf('Strategic fit', `${event.strategic_fit_score.toFixed(1)}/10`, 'positive'),
      ]

      // Does this event fill a critical gap in its own category/month?
      const eventMonth = new Date(event.start_date).getMonth() + 1
      const criticalFill = gaps?.find(g =>
        g.severity === 'Critical' && g.category === event.category && g.month === eventMonth,
      )
      if (criticalFill) factors.push(kf('Fills critical gap', eventMonth.toString(), 'positive'))

      // Competitive response?
      const competitive = comparisonCityAdvantage(event, allEvents, comparisonCity)
      if (competitive.deficit) {
        factors.push(kf(`${comparisonCity} presence`, `${competitive.other_count} vs ${competitive.own_count}`, 'negative'))
      }

      if (event.tourism_impact_score >= 8.5) factors.push(kf('Tourism impact', event.tourism_impact_score.toFixed(1), 'positive'))
      if (event.impact_weight === 5)          factors.push(kf('Marquee impact', '5/5', 'positive'))

      return {
        kind: 'fund' as const,
        event,
        reason: reasonFund(event, !!criticalFill, competitive.deficit, comparisonCity),
        key_factors: factors,
        confidence: confidenceForEvent(event),
      }
    })
}

// ═════ SCALE ═════════════════════════════════════════════════

function buildScale(events: PortfolioEvent[], limit: number): EventDecision[] {
  // Reference: median per-guest spend across events with real budget + attendance
  const allocated = events.filter(e => (e.budget_allocated ?? 0) > 0 && e.estimated_attendance > 0)
  const perGuestVals = allocated.map(e => (e.budget_allocated as number) / e.estimated_attendance)
  const medianPerGuest = median(perGuestVals) || 0

  return events
    .filter(e => e.status !== 'Dropped' && e.status !== 'Proposed')
    .filter(e => e.portfolio_score >= T.SCALE_SCORE_MIN && e.portfolio_score <= T.SCALE_SCORE_MAX)
    .map(event => {
      const perGuest = event.estimated_attendance > 0 && (event.budget_allocated ?? 0) > 0
        ? (event.budget_allocated as number) / event.estimated_attendance
        : 0
      const underfundRatio = medianPerGuest > 0 ? perGuest / medianPerGuest : 1
      return { event, perGuest, underfundRatio }
    })
    // Rank: most underfunded first (lowest ratio)
    .sort((a, b) => a.underfundRatio - b.underfundRatio)
    .slice(0, limit)
    .map(({ event, perGuest, underfundRatio }) => {
      const factors: KeyFactor[] = [
        kf('Score', event.portfolio_score.toFixed(1), 'neutral'),
        kf('Audience', event.estimated_attendance.toLocaleString(), 'neutral'),
      ]
      if (underfundRatio < 0.8 && perGuest > 0) {
        factors.push(kf('Per-guest spend', `AED ${Math.round(perGuest)}`, 'negative'))
        factors.push(kf('vs median', `${Math.round((1 - underfundRatio) * 100)}% below`, 'positive'))
      }
      if (event.impact_weight >= 4) factors.push(kf('Impact weight', `${event.impact_weight}/5`, 'positive'))

      return {
        kind: 'scale' as const,
        event,
        reason: reasonScale(event, underfundRatio, perGuest),
        key_factors: factors,
        confidence: confidenceForEvent(event),
      }
    })
}

// ═════ DROP ══════════════════════════════════════════════════

function buildDrop(events: PortfolioEvent[], limit: number): EventDecision[] {
  return events
    .filter(e => e.status !== 'Proposed')
    .filter(e => e.portfolio_score < T.DROP_SCORE_MAX)
    .sort((a, b) => a.portfolio_score - b.portfolio_score)
    .slice(0, limit)
    .map(event => {
      const weaknesses: KeyFactor[] = []
      if (event.roi_score < 6)             weaknesses.push(kf('ROI', event.roi_score.toFixed(1), 'negative'))
      if (event.tourism_impact_score < 5)  weaknesses.push(kf('Tourism impact', event.tourism_impact_score.toFixed(1), 'negative'))
      if (event.strategic_fit_score < 6)   weaknesses.push(kf('Strategic fit', event.strategic_fit_score.toFixed(1), 'negative'))
      if (event.verification_level === 'Tier 3') weaknesses.push(kf('Source', 'Tier 3', 'negative'))
      if (event.seasonality_score < 5)     weaknesses.push(kf('Seasonality', event.seasonality_score.toFixed(1), 'negative'))

      return {
        kind: 'drop' as const,
        event,
        reason: reasonDrop(event),
        key_factors: [
          kf('Score', event.portfolio_score.toFixed(1), 'negative'),
          ...weaknesses.slice(0, 2),
        ],
        confidence: confidenceForEvent(event),
      }
    })
}

// ═════ CREATE ════════════════════════════════════════════════

function buildCreate(
  gaps: EnrichedGapSlot[] | undefined,
  allEvents: Event[],
  portfolioEvents: PortfolioEvent[],
  targetCity: City,
  limit: number,
): CreateDecision[] {
  if (!gaps) return []

  // 1. Build a synthetic GapReport from the high-severity slots
  const criticalGaps = gaps.filter(s => s.gap_score >= T.CREATE_GAP_MIN)
  if (criticalGaps.length === 0) return []

  const syntheticReport = {
    city: targetCity,
    year: criticalGaps[0].year || 2025,
    slots: criticalGaps,  // EnrichedGapSlot extends GapSlot — structural compat
    summary: {
      emptiest_month: criticalGaps[0].month,
      emptiest_category: criticalGaps[0].category,
      total_gaps: criticalGaps.length,
    },
  }

  // 2. Use trend signal to bias ordering
  const trends = computeCategoryTrends(allEvents)
  const concepts = generateRecommendations(syntheticReport, allEvents, { limit: limit * 2, trends })

  // 3. Score each concept for this bucket — confidence reflects gap strength + refs + trend
  return concepts
    .slice(0, limit)
    .map(concept => {
      const trendShare = trends.total > 0 ? trends[concept.category] / trends.total : 0.33
      const factors: KeyFactor[] = [
        kf('Gap score',    `${Math.round(concept.gap_score * 100)}%`, 'positive'),
        kf('Est. audience', concept.estimated_audience.toLocaleString(), 'neutral'),
        kf('Budget',       `AED ${(concept.estimated_budget / 1_000_000).toFixed(1)}M`, 'neutral'),
      ]
      if (concept.reference_events.length >= 2) {
        factors.push(kf('Regional precedent', `${concept.reference_events.length} events`, 'positive'))
      }
      if (trendShare >= 0.45) factors.push(kf('External signal', 'Hot', 'positive'))
      else if (trendShare <= 0.20) factors.push(kf('External signal', 'Quiet (first-mover)', 'neutral'))

      return {
        kind: 'create' as const,
        concept,
        reason: reasonCreate(concept, trendShare),
        key_factors: factors,
        confidence: confidenceForCreate(concept, trendShare),
      }
    })
}

// ═════ CONSTRAINTS ═══════════════════════════════════════════

interface ConstraintsInput {
  events: PortfolioEvent[]
  budget: number
  allEvents: Event[]
  targetCity: City
  comparisonCity: City
}

function summarizeConstraints(input: ConstraintsInput): DecisionConstraints {
  const { events, budget, allEvents, targetCity, comparisonCity } = input

  // Category balance
  const categoryCount = (cat: Category) => events.filter(e => e.category === cat).length
  const cats: Category[] = ['Family', 'Entertainment', 'Sports']
  const category_balance = cats.reduce((acc, cat) => {
    const count = categoryCount(cat)
    acc[cat] = { count, below_min: count < T.CATEGORY_MIN_COUNT }
    return acc
  }, {} as Record<Category, { count: number; below_min: boolean }>)

  // Seasonality — bucket events by start month
  const monthCounts: number[] = new Array(13).fill(0)
  for (const e of events) {
    const m = new Date(e.start_date).getMonth() + 1
    monthCounts[m]++
  }
  const peak_months: number[] = []
  const low_months:  number[] = []
  for (let m = 1; m <= 12; m++) {
    if (monthCounts[m] >= T.SEASONALITY_PEAK) peak_months.push(m)
    if (monthCounts[m] <= T.SEASONALITY_LOW)  low_months.push(m)
  }

  // Budget
  const allocated = events.reduce((s, e) => s + (e.budget_allocated ?? 0), 0)
  const utilization_pct = budget > 0 ? Math.round((allocated / budget) * 100) : 0
  const within_limit = allocated <= budget * (1 + T.BUDGET_OVERRUN_BUFFER)

  // Competition — how many month/category slots does targetCity lag comparisonCity by?
  let ad_deficit_slots = 0
  for (let m = 1; m <= 12; m++) {
    for (const cat of cats) {
      const own = allEvents.filter(e =>
        e.city === targetCity && e.category === cat &&
        new Date(e.start_date).getMonth() + 1 === m,
      ).length
      const other = allEvents.filter(e =>
        e.city === comparisonCity && e.category === cat &&
        new Date(e.start_date).getMonth() + 1 === m,
      ).length
      if (other > own) ad_deficit_slots++
    }
  }

  return {
    category_balance,
    seasonality: { peak_months, low_months },
    budget: { total: budget, allocated, within_limit, utilization_pct },
    competition: { target_city: targetCity, comparison_city: comparisonCity, ad_deficit_slots },
  }
}

// ═════ Confidence ════════════════════════════════════════════

function confidenceForEvent(event: PortfolioEvent): DecisionConfidence {
  const tier = event.verification_level
  const subs = [
    event.roi_score, event.strategic_fit_score, event.seasonality_score,
    event.tourism_impact_score, event.private_sector_score,
  ]
  const variance = stddev(subs)

  if (tier === 'Tier 1' && variance < 1.5) return 'High'
  if (tier === 'Tier 1')                   return 'Medium'
  if (tier === 'Tier 2' && variance < 2.0) return 'Medium'
  return 'Low'
}

function confidenceForCreate(
  concept: EventConcept,
  trendShare: number,
): DecisionConfidence {
  const refCount = concept.reference_events.length
  if (concept.gap_score >= 0.85 && refCount >= 2) return 'High'
  if (concept.gap_score >= 0.65 || refCount >= 1) return 'Medium'
  return 'Low'
}

// ═════ Reasons ═══════════════════════════════════════════════

function reasonFund(e: PortfolioEvent, criticalFill: boolean, competitive: boolean, compCity: City): string {
  const bits: string[] = []
  if (e.strategic_fit_score >= 9)   bits.push('exceptional strategic fit')
  else if (e.strategic_fit_score >= 8) bits.push('strong strategic fit')
  if (e.tourism_impact_score >= 9)  bits.push('high tourism draw')
  if (e.roi_score >= 9)             bits.push('top-tier ROI')
  if (e.impact_weight === 5)        bits.push('marquee impact')

  const core = bits.length ? bits.join(', ') : 'consistently high factor scores'
  let reason = `Recommend FUND: ${e.name} — score ${e.portfolio_score.toFixed(1)}, ${core}`

  const month = new Date(e.start_date).toLocaleString('en-GB', { month: 'long' })
  if (criticalFill) reason += `. Fills a critical ${e.category} gap in ${month}`
  if (competitive)  reason += `. Closes visibility gap vs ${compCity}`
  return reason + '.'
}

function reasonScale(e: PortfolioEvent, underfundRatio: number, perGuest: number): string {
  const base = `Recommend SCALE: ${e.name} — score ${e.portfolio_score.toFixed(1)} with ${e.estimated_attendance.toLocaleString()} expected guests`
  if (underfundRatio < 0.8 && perGuest > 0) {
    const pct = Math.round((1 - underfundRatio) * 100)
    return `${base}, ${pct}% below median per-guest spend. Increased investment has documented upside.`
  }
  if (e.impact_weight >= 4) {
    return `${base}. Impact ${e.impact_weight}/5 — programming depth has room to grow.`
  }
  return `${base}. Solid mid-tier, bigger budget likely compounds returns.`
}

function reasonDrop(e: PortfolioEvent): string {
  const weaknesses: string[] = []
  if (e.roi_score < 6)             weaknesses.push('weak ROI')
  if (e.tourism_impact_score < 5)  weaknesses.push('low tourism draw')
  if (e.strategic_fit_score < 6)   weaknesses.push('limited strategic fit')
  if (e.verification_level === 'Tier 3') weaknesses.push('unverified source')
  const body = weaknesses.length ? weaknesses.slice(0, 2).join(' and ') : 'low composite score'
  return `Recommend DROP: ${e.name} — score ${e.portfolio_score.toFixed(1)} with ${body}. Budget reclaim candidate.`
}

function reasonCreate(concept: EventConcept, trendShare: number): string {
  const month = ['', 'January','February','March','April','May','June','July','August','September','October','November','December'][concept.suggested_month]
  const refLine = concept.reference_events.length
    ? ` Regional precedent: ${concept.reference_events.slice(0, 2).join(', ')}.`
    : ''
  const trendLine =
    trendShare >= 0.45 ? ' External signal is hot — ride the demand.' :
    trendShare <= 0.20 ? ' Quiet category — early-mover timing.' : ''
  return `Recommend CREATE: ${concept.title} for ${month} in ${concept.suggested_city} — ${Math.round(concept.gap_score * 100)}% gap in ${concept.category}.${refLine}${trendLine}`
}

// ═════ Comparison helpers ════════════════════════════════════

function comparisonCityAdvantage(
  event: PortfolioEvent, allEvents: Event[], comparisonCity: City,
): { deficit: boolean; own_count: number; other_count: number } {
  const month = new Date(event.start_date).getMonth() + 1
  const own_count = allEvents.filter(e =>
    e.city === event.city && e.category === event.category &&
    new Date(e.start_date).getMonth() + 1 === month,
  ).length
  const other_count = allEvents.filter(e =>
    e.city === comparisonCity && e.category === event.category &&
    new Date(e.start_date).getMonth() + 1 === month,
  ).length
  return { deficit: other_count > own_count, own_count, other_count }
}

// ═════ Primitives ════════════════════════════════════════════

function kf(label: string, value: string, signal: FactorSignal): KeyFactor {
  return { label, value, signal }
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0
  const s = [...nums].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

function stddev(nums: number[]): number {
  if (nums.length === 0) return 0
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length
  const variance = nums.reduce((acc, x) => acc + (x - mean) ** 2, 0) / nums.length
  return Math.sqrt(variance)
}

// ═════ Legacy shim ═══════════════════════════════════════════

/**
 * @deprecated Use `generateDecisions(input)`. Kept for backwards compat with
 * any caller still invoking the old `computeDecisions(events)` signature.
 */
export function computeDecisions(events: PortfolioEvent[]): DecisionPanel {
  return generateDecisions({
    events,
    allEvents: events,       // no comparison set → deficit signal will be zero
    budget: 250_000_000,
    targetCity: 'Abu Dhabi',
  })
}
