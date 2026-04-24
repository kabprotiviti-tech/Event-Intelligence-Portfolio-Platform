/**
 * Methodology layer — every score in the platform can be explained.
 *
 * Call getMethodology(kind, context) to get the formula, the specific
 * computation for that context, the modifiers, the thresholds, the
 * assumptions, and a pointer back to the source file. No magic numbers
 * the Chairman can't defend in a meeting.
 */

import type { PortfolioEvent, EnrichedGapSlot, GapSeverity } from '@/types'

export type MethodologyKind =
  | 'portfolio-score'
  | 'gap-score'
  | 'gap-severity'
  | 'decision-fund'
  | 'decision-scale'
  | 'decision-drop'
  | 'decision-create'
  | 'confidence-event'
  | 'confidence-concept'
  | 'avg-portfolio-score'
  | 'portfolio-health'

export interface MethodFactor {
  label: string
  value: string
  weight?: string
  contribution?: string
  tone?: 'positive' | 'negative' | 'neutral'
}

export interface MethodThreshold {
  label: string
  rule: string
  applies: boolean
  tone: 'positive' | 'caution' | 'negative' | 'neutral'
}

export interface MethodologyEntry {
  title: string              // "Portfolio Score · Abu Dhabi Grand Prix"
  subject: string            // "Portfolio Score"
  formula: string            // one-line equation
  /** Factor-by-factor inputs when a context is available. */
  inputs: MethodFactor[]
  /** Adjustments applied after the base computation (tier, impact, etc). */
  modifiers?: MethodFactor[]
  /** The final number + how it was derived. */
  result?: string
  /** Decision thresholds when applicable (FUND/SCALE/DROP/CREATE). */
  thresholds?: MethodThreshold[]
  /** Plain-English notes on what's assumed. */
  assumptions: string[]
  /** Where the logic lives. */
  source: string
}

interface MethodologyContext {
  event?: PortfolioEvent
  gap?: EnrichedGapSlot
  severity?: GapSeverity
  avgScore?: number
  eventCount?: number
}

// ═══════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════

export function getMethodology(
  kind: MethodologyKind,
  ctx: MethodologyContext = {},
): MethodologyEntry {
  switch (kind) {
    case 'portfolio-score':      return portfolioScore(ctx.event)
    case 'avg-portfolio-score':  return avgPortfolioScore(ctx.avgScore, ctx.eventCount)
    case 'gap-score':            return gapScore(ctx.gap)
    case 'gap-severity':         return gapSeverity(ctx.gap, ctx.severity)
    case 'decision-fund':        return decisionFund(ctx.event)
    case 'decision-scale':       return decisionScale(ctx.event)
    case 'decision-drop':        return decisionDrop(ctx.event)
    case 'decision-create':      return decisionCreate()
    case 'confidence-event':     return confidenceEvent(ctx.event)
    case 'confidence-concept':   return confidenceConcept()
    case 'portfolio-health':     return portfolioHealth()
  }
}

// ═══════════════════════════════════════════════════════════
// Portfolio Score
// ═══════════════════════════════════════════════════════════

const WEIGHTS = {
  roi:            { value: 0.30, label: 'ROI' },
  strategic_fit:  { value: 0.25, label: 'Strategic fit' },
  seasonality:    { value: 0.20, label: 'Seasonality' },
  tourism_impact: { value: 0.15, label: 'Tourism impact' },
  private_sector: { value: 0.10, label: 'Private sector' },
}

const TIER_MODIFIER: Record<string, number> = { 'Tier 1': 1.0, 'Tier 2': 0.9, 'Tier 3': 0.8 }

function portfolioScore(event?: PortfolioEvent): MethodologyEntry {
  const base: MethodologyEntry = {
    title: event ? `Portfolio Score · ${event.name}` : 'Portfolio Score',
    subject: 'Portfolio Score',
    formula: 'score = Σ(factor × weight) × tier_modifier × impact_modifier',
    inputs: [],
    assumptions: [
      'Factor scores are 0–10 inputs. In MVP they come from mock data; real deployment plugs in Tier 1 survey + outcome data.',
      'Weights are fixed in lib/scorer.ts. Changing them ripples through every decision bucket.',
      'Tier modifier penalises unverified sources: Tier 1 × 1.0, Tier 2 × 0.9, Tier 3 × 0.8.',
      'Impact modifier scales ±5% around weight 3 — gives marquee events a small boost and low-impact events a small penalty.',
      'Final score is rounded to 1 decimal and clamped to [0, 10].',
    ],
    source: 'lib/scorer.ts · scoreEvent()',
  }

  if (!event) return base

  const factorEntries = [
    { key: 'roi',            val: event.roi_score },
    { key: 'strategic_fit',  val: event.strategic_fit_score },
    { key: 'seasonality',    val: event.seasonality_score },
    { key: 'tourism_impact', val: event.tourism_impact_score },
    { key: 'private_sector', val: event.private_sector_score },
  ] as const

  let weightedSum = 0
  const inputs: MethodFactor[] = factorEntries.map(({ key, val }) => {
    const { value: weight, label } = WEIGHTS[key]
    const contribution = val * weight
    weightedSum += contribution
    return {
      label,
      value: val.toFixed(1),
      weight: `× ${weight.toFixed(2)}`,
      contribution: contribution.toFixed(2),
      tone: val >= 8 ? 'positive' : val <= 4 ? 'negative' : 'neutral',
    }
  })

  const tierMod = TIER_MODIFIER[event.verification_level] ?? 1.0
  const impactMod = 1 + (event.impact_weight - 3) * 0.025
  const raw = weightedSum * tierMod * impactMod
  const final = Math.round(raw * 10) / 10

  const modifiers: MethodFactor[] = [
    {
      label: 'Weighted sum',
      value: weightedSum.toFixed(2),
      tone: 'neutral',
    },
    {
      label: `Tier modifier (${event.verification_level})`,
      value: tierMod.toFixed(2),
      tone: tierMod >= 1 ? 'positive' : 'negative',
    },
    {
      label: `Impact modifier (weight ${event.impact_weight}/5)`,
      value: impactMod.toFixed(3),
      tone: impactMod >= 1 ? 'positive' : 'negative',
    },
  ]

  return {
    ...base,
    inputs,
    modifiers,
    result: `${weightedSum.toFixed(2)} × ${tierMod} × ${impactMod.toFixed(3)} = ${raw.toFixed(2)} → ${final.toFixed(1)} / 10`,
  }
}

function avgPortfolioScore(avg?: number, count?: number): MethodologyEntry {
  return {
    title: 'Average Portfolio Score',
    subject: 'Average across the portfolio',
    formula: 'avg = Σ(portfolio_score) / count',
    inputs: [
      { label: 'Events in scope', value: count?.toString() ?? '—' },
      { label: 'Sum of scores',   value: avg !== undefined && count !== undefined ? (avg * count).toFixed(1) : '—' },
      { label: 'Arithmetic mean', value: avg !== undefined ? `${avg.toFixed(1)} / 10` : '—', tone: 'neutral' },
    ],
    assumptions: [
      'Simple arithmetic mean — no weighting by attendance, budget, or impact.',
      'Scope respects the current city + category filter. Change the tab, the average recomputes.',
      'Each contributing score is itself a weighted formula — see Portfolio Score methodology for the per-event breakdown.',
    ],
    source: 'app/api/portfolio/route.ts · summary.avg_portfolio_score',
  }
}

// ═══════════════════════════════════════════════════════════
// Gap Score
// ═══════════════════════════════════════════════════════════

function gapScore(gap?: EnrichedGapSlot): MethodologyEntry {
  const base: MethodologyEntry = {
    title: gap ? `Gap Score · ${monthName(gap.month)} ${gap.category}` : 'Gap Score',
    subject: 'Gap Score',
    formula: 'gap_score = f(density) where density = Σ(impact_weight) in the cell',
    inputs: [],
    thresholds: [
      { label: 'Empty',    rule: 'weighted_density = 0',       applies: !!gap && gap.density === 'empty',    tone: 'negative' },
      { label: 'Light',    rule: 'weighted_density ≤ 3',       applies: !!gap && gap.density === 'light',    tone: 'caution' },
      { label: 'Moderate', rule: '3 < weighted_density ≤ 8',   applies: !!gap && gap.density === 'moderate', tone: 'neutral' },
      { label: 'Heavy',    rule: 'weighted_density > 8',       applies: !!gap && gap.density === 'heavy',    tone: 'positive' },
    ],
    assumptions: [
      'Density is weighted by impact_weight, not raw count — one marquee event (weight 5) beats three small events (weight 1 each).',
      'Thresholds (3 / 8 / 15) live in lib/gap-detector.ts and are tunable.',
      'Gap score is the inverse: empty=1.0, light=0.7, moderate=0.3, heavy=0.0. Higher = more opportunity.',
    ],
    source: 'lib/gap-detector.ts · detectGaps()',
  }

  if (!gap) return base

  const inputs: MethodFactor[] = [
    { label: 'Event count in cell',    value: gap.event_count.toString() },
    { label: 'Weighted density',       value: gap.weighted_density.toString(), tone: 'neutral' },
    { label: 'Density classification', value: gap.density, tone: gap.density === 'empty' || gap.density === 'light' ? 'negative' : 'neutral' },
    { label: 'Gap score',              value: `${Math.round(gap.gap_score * 100)}%`, tone: gap.gap_score > 0.6 ? 'negative' : 'positive' },
  ]

  return {
    ...base,
    inputs,
    result: `Cell is ${gap.density} → gap_score ${gap.gap_score.toFixed(2)} (${Math.round(gap.gap_score * 100)}%)`,
  }
}

function gapSeverity(gap?: EnrichedGapSlot, sev?: GapSeverity): MethodologyEntry {
  const severity = sev ?? gap?.severity
  return {
    title: severity ? `Gap Severity · ${severity}` : 'Gap Severity',
    subject: 'Gap Severity',
    formula: 'severity = f(gap_score)',
    inputs: gap ? [
      { label: 'Gap score', value: `${Math.round(gap.gap_score * 100)}%`, tone: 'neutral' },
      { label: 'Resulting severity', value: gap.severity, tone: gap.severity === 'Critical' ? 'negative' : gap.severity === 'Medium' ? 'negative' : 'neutral' },
    ] : [],
    thresholds: [
      { label: 'Critical', rule: 'gap_score > 0.80',              applies: severity === 'Critical', tone: 'negative' },
      { label: 'Medium',   rule: '0.50 ≤ gap_score ≤ 0.80',       applies: severity === 'Medium',   tone: 'caution'  },
      { label: 'Low',      rule: 'gap_score < 0.50',              applies: severity === 'Low',      tone: 'neutral'  },
    ],
    assumptions: [
      'Severity is a categorical derivation from gap_score — makes the list sortable and visually legible.',
      'Critical threshold (>0.8) corresponds to essentially empty cells with no mitigating events nearby.',
      'Severity drives concept-generation prioritization in the decision engine.',
    ],
    source: 'lib/gap-enricher.ts · severityOf()',
  }
}

// ═══════════════════════════════════════════════════════════
// Decision thresholds
// ═══════════════════════════════════════════════════════════

function decisionFund(event?: PortfolioEvent): MethodologyEntry {
  const score = event?.portfolio_score
  const fit = event?.strategic_fit_score
  return {
    title: event ? `Fund Rule · ${event.name}` : 'Fund Rule',
    subject: 'Fund Decision Rule',
    formula: 'portfolio_score > 7.0 AND strategic_fit ≥ 7.5',
    inputs: event ? [
      { label: 'Portfolio score',  value: score!.toFixed(1), tone: (score ?? 0) > 7 ? 'positive' : 'negative' },
      { label: 'Strategic fit',    value: fit!.toFixed(1),   tone: (fit ?? 0)  >= 7.5 ? 'positive' : 'negative' },
    ] : [],
    thresholds: [
      { label: 'Portfolio score gate', rule: '> 7.0',  applies: (score ?? 0) > 7,   tone: 'neutral' },
      { label: 'Strategic fit gate',   rule: '≥ 7.5',  applies: (fit   ?? 0) >= 7.5, tone: 'neutral' },
    ],
    assumptions: [
      'Both gates must pass for Fund classification — strategic fit alone isn\'t enough without backing score.',
      'Ranked within bucket by portfolio_score descending.',
      'Reasoning surfaces additional factors (tourism impact, marquee weight) when relevant.',
    ],
    source: 'lib/decision-engine.ts · T.FUND_* + buildFund()',
  }
}

function decisionScale(event?: PortfolioEvent): MethodologyEntry {
  const score = event?.portfolio_score
  return {
    title: event ? `Scale Rule · ${event.name}` : 'Scale Rule',
    subject: 'Scale Decision Rule',
    formula: '5.0 ≤ portfolio_score ≤ 7.0 · ranked by per-guest spend vs median',
    inputs: event ? [
      { label: 'Portfolio score',   value: score!.toFixed(1), tone: (score ?? 0) >= 5 && (score ?? 0) <= 7 ? 'positive' : 'negative' },
      { label: 'Estimated audience', value: event.estimated_attendance.toLocaleString() },
      { label: 'Budget allocated',  value: event.budget_allocated ? `AED ${(event.budget_allocated / 1_000_000).toFixed(1)}M` : '—' },
    ] : [],
    thresholds: [
      { label: 'Band lower bound', rule: 'score ≥ 5.0',  applies: (score ?? 0) >= 5, tone: 'neutral' },
      { label: 'Band upper bound', rule: 'score ≤ 7.0',  applies: (score ?? 0) <= 7, tone: 'neutral' },
    ],
    assumptions: [
      'Scale bucket is the middle tier — decent performers that need more investment, not more strategy.',
      'Ranking signal: events with below-median per-guest spend go first (they\'re underfunded).',
      'If budget or audience unknown, falls back to impact_weight for ordering.',
    ],
    source: 'lib/decision-engine.ts · buildScale()',
  }
}

function decisionDrop(event?: PortfolioEvent): MethodologyEntry {
  const score = event?.portfolio_score
  const weaknesses: string[] = []
  if (event && event.roi_score < 6)            weaknesses.push('Weak ROI')
  if (event && event.tourism_impact_score < 5) weaknesses.push('Low tourism draw')
  if (event && event.strategic_fit_score < 6)  weaknesses.push('Limited strategic fit')
  if (event && event.verification_level === 'Tier 3') weaknesses.push('Unverified source (Tier 3)')

  return {
    title: event ? `Drop Rule · ${event.name}` : 'Drop Rule',
    subject: 'Drop Decision Rule',
    formula: 'portfolio_score < 4.0 · reasons cite top 2 specific weaknesses',
    inputs: event ? [
      { label: 'Portfolio score', value: score!.toFixed(1), tone: (score ?? 0) < 4 ? 'negative' : 'positive' },
      { label: 'Key weaknesses',  value: weaknesses.length ? weaknesses.join(', ') : 'None flagged', tone: 'negative' },
    ] : [],
    thresholds: [
      { label: 'Score ceiling', rule: 'score < 4.0', applies: (score ?? 0) < 4, tone: 'negative' },
    ],
    assumptions: [
      'Drop bucket is bottom-3 by portfolio_score — deliberate to keep the director\'s scope to decisions, not noise.',
      'Reasons cite specific failing factors so the Chairman can defend each line in budget reviews.',
      'Proposed events are excluded from Drop — they haven\'t run yet.',
    ],
    source: 'lib/decision-engine.ts · buildDrop()',
  }
}

function decisionCreate(): MethodologyEntry {
  return {
    title: 'Create Rule',
    subject: 'Create Decision Rule',
    formula: 'gap_score > 0.7 · concept generated via lib/recommender.ts · ranked by gap × trend',
    inputs: [],
    thresholds: [
      { label: 'Gap score gate', rule: 'gap_score > 0.70', applies: false, tone: 'neutral' },
    ],
    assumptions: [
      'Concept templates are curated in lib/recommender.ts — deterministic, no LLM dependency.',
      'Category trend signals (news + marketplace momentum) act as tiebreakers within equal-gap slots.',
      'Reference events from comparable cities are attached to prove demand.',
      'Confidence is derived from gap strength + reference count — see Confidence methodology.',
    ],
    source: 'lib/decision-engine.ts · buildCreate() + lib/recommender.ts',
  }
}

// ═══════════════════════════════════════════════════════════
// Confidence
// ═══════════════════════════════════════════════════════════

function confidenceEvent(event?: PortfolioEvent): MethodologyEntry {
  const base: MethodologyEntry = {
    title: event ? `Confidence · ${event.name}` : 'Event Decision Confidence',
    subject: 'Event Decision Confidence',
    formula: 'confidence = f(verification_tier, sub_score_variance)',
    inputs: [],
    thresholds: [
      { label: 'High',   rule: 'Tier 1 AND stddev(sub_scores) < 1.5', applies: false, tone: 'positive' },
      { label: 'Medium', rule: 'Tier 1 · OR · Tier 2 + stddev < 2.0', applies: false, tone: 'caution' },
      { label: 'Low',    rule: 'Tier 3 OR unstable sub-scores',       applies: false, tone: 'negative' },
    ],
    assumptions: [
      'Confidence travels with the decision — Chairman sees both the rec and how much we trust the inputs.',
      'Variance across 5 factor scores catches "looks fine on average but hides a big weakness" cases.',
      'Tier gates trump variance — Tier 3 caps at Low regardless of coherence.',
    ],
    source: 'lib/decision-engine.ts · confidenceForEvent()',
  }

  if (!event) return base

  const subs = [
    event.roi_score, event.strategic_fit_score, event.seasonality_score,
    event.tourism_impact_score, event.private_sector_score,
  ]
  const mean = subs.reduce((a, b) => a + b, 0) / subs.length
  const variance = subs.reduce((a, b) => a + (b - mean) ** 2, 0) / subs.length
  const stddev = Math.sqrt(variance)

  const inputs: MethodFactor[] = [
    { label: 'Verification tier', value: event.verification_level, tone: event.verification_level === 'Tier 1' ? 'positive' : event.verification_level === 'Tier 2' ? 'neutral' : 'negative' },
    { label: 'Sub-score mean',    value: mean.toFixed(2) },
    { label: 'Sub-score stddev',  value: stddev.toFixed(2), tone: stddev < 1.5 ? 'positive' : stddev < 2 ? 'neutral' : 'negative' },
  ]

  return { ...base, inputs }
}

function portfolioHealth(): MethodologyEntry {
  return {
    title: 'Portfolio Health Score',
    subject: 'Portfolio Health (/10)',
    formula: 'avg_score ± adjustments (rising trends / underdeveloped cats / lagging years / drop-count)',
    inputs: [
      { label: 'Base',                    value: 'avg(portfolio_score)',            tone: 'neutral' },
      { label: 'Rising categories',       value: '+0.4 each',                       tone: 'positive' },
      { label: 'Declining categories',    value: '−0.4 each',                       tone: 'negative' },
      { label: 'Underdeveloped cats',     value: '−0.5 each',                       tone: 'negative' },
      { label: 'Lagging horizon years',   value: '−0.4 each',                       tone: 'negative' },
      { label: 'Fund-ready count',        value: '+0.2 each',                       tone: 'positive' },
      { label: 'Drop candidates',         value: '−0.2 each',                       tone: 'negative' },
    ],
    thresholds: [
      { label: 'Strong',   rule: 'score ≥ 8.0',                applies: false, tone: 'positive' },
      { label: 'Solid',    rule: '6.5 ≤ score < 8.0',          applies: false, tone: 'neutral' },
      { label: 'At risk',  rule: '4.0 ≤ score < 6.5',          applies: false, tone: 'caution' },
      { label: 'Weak',     rule: 'score < 4.0',                applies: false, tone: 'negative' },
    ],
    assumptions: [
      'Starts from the raw average portfolio score and adjusts for structural signals from the Chairman brief.',
      'Trajectory (improving/stable/declining) is a separate calculation — primarily reads rising-count minus declining-count.',
      'Capped at [0, 10]. Adjustments are bounded so one factor can\'t swing the score by more than ~2 points.',
    ],
    source: 'lib/chairman-brief.ts · computePortfolioHealth()',
  }
}

function confidenceConcept(): MethodologyEntry {
  return {
    title: 'Concept Confidence',
    subject: 'New-Opportunity Confidence',
    formula: 'confidence = f(gap_score, reference_event_count)',
    inputs: [],
    thresholds: [
      { label: 'High',   rule: 'gap_score ≥ 0.85 AND ≥ 2 regional references', applies: false, tone: 'positive' },
      { label: 'Medium', rule: 'gap_score ≥ 0.65 · OR · ≥ 1 reference',        applies: false, tone: 'caution' },
      { label: 'Low',    rule: 'weaker evidence',                              applies: false, tone: 'negative' },
    ],
    assumptions: [
      'Reference events come from comparable cities in the same month/category — proven demand signal.',
      'High confidence means we\'re confident a concept exists; execution risk is separate.',
      'Trend momentum adjusts ordering but doesn\'t override confidence tier.',
    ],
    source: 'lib/decision-engine.ts · confidenceForCreate()',
  }
}

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

function monthName(m: number): string {
  return [
    '', 'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ][m] ?? ''
}
