/**
 * Scenario engine — deterministic, rule-based "what if" simulation.
 *
 * Input:  ScenarioConfig (budget / category focus / audience / risk)
 * Output: a projected portfolio + impact metrics
 *
 * No Monte Carlo, no optimizer. A Chairman can trace any scenario result
 * to a specific filter + ranker + greedy budget allocator.
 */

import type {
  Event, Category, PortfolioEvent, ScenarioConfig, ScenarioResult,
  ScenarioComparison, EnrichedGapSlot, RiskLevel,
} from '@/types'
import { buildPortfolio } from './scorer'

// ─── Risk rules ─────────────────────────────────────────────

const RISK_RULES: Record<RiskLevel, {
  min_portfolio_score: number
  allowed_tiers: string[]
  score_multiplier: number    // bias when ranking picks
}> = {
  conservative: { min_portfolio_score: 7.0, allowed_tiers: ['Tier 1', 'Tier 2'], score_multiplier: 1.0 },
  balanced:     { min_portfolio_score: 5.0, allowed_tiers: ['Tier 1', 'Tier 2', 'Tier 3'], score_multiplier: 1.0 },
  aggressive:   { min_portfolio_score: 3.0, allowed_tiers: ['Tier 1', 'Tier 2', 'Tier 3'], score_multiplier: 1.1 },
}

// ─── Public API ─────────────────────────────────────────────

export function simulateScenario(
  config: ScenarioConfig,
  allEvents: Event[],
  gaps: EnrichedGapSlot[] = [],
): ScenarioResult {
  const rule = RISK_RULES[config.risk_level]

  // 1. Scope by category / audience filters
  let pool = allEvents.filter(e => {
    if (config.category_focus && config.category_focus !== 'All' && e.category !== config.category_focus) return false
    if (config.target_audience && config.target_audience !== 'All' && e.tourism_origin !== config.target_audience) return false
    return true
  })

  // 2. Score + filter by risk threshold
  const scored = buildPortfolio(pool)
  const eligible = scored.filter(e =>
    e.portfolio_score >= rule.min_portfolio_score &&
    rule.allowed_tiers.includes(e.verification_level)
  )

  // 3. Rank with risk-adjusted score (aggressive overweights high scorers)
  const ranked = [...eligible].sort((a, b) =>
    (b.portfolio_score * rule.score_multiplier) - (a.portfolio_score * rule.score_multiplier)
  )

  // 4. Greedy budget allocation — pick events whose min_budget_required fits
  const portfolio: PortfolioEvent[] = []
  let remaining = config.total_budget
  for (const e of ranked) {
    const cost = e.min_budget_required || 5_000_000
    if (cost <= remaining) {
      portfolio.push({ ...e, budget_allocated: cost, status: 'Active' })
      remaining -= cost
    }
  }

  // 5. Projections
  const spent = config.total_budget - remaining
  const gapsFilled = countGapsFilled(portfolio, gaps)

  const projections = {
    total_roi_score:       portfolio.reduce((s, e) => s + e.roi_score, 0),
    total_attendance:      portfolio.reduce((s, e) => s + e.estimated_attendance, 0),
    avg_portfolio_score:   portfolio.length
      ? Math.round((portfolio.reduce((s, e) => s + e.portfolio_score, 0) / portfolio.length) * 10) / 10
      : 0,
    category_distribution: categoryBreakdown(portfolio),
    gaps_filled:           gapsFilled,
    budget_utilization_pct: config.total_budget > 0
      ? Math.round((spent / config.total_budget) * 100)
      : 0,
    events_count:          portfolio.length,
  }

  return { config, portfolio, projections }
}

/**
 * Compare 2–3 scenarios and surface the leader by each metric.
 * The recommendation is a plain-English sentence suitable for a Chairman brief.
 */
export function compareScenarios(results: ScenarioResult[]): ScenarioComparison {
  if (results.length === 0) {
    return {
      scenarios: [],
      leader_by_metric: { roi: '', attendance: '', balance: '', seasonality: '' },
      recommendation: 'No scenarios to compare.',
    }
  }

  const leader = (fn: (r: ScenarioResult) => number) =>
    results.reduce((best, r) => fn(r) > fn(best) ? r : best, results[0]).config.id

  const leader_by_metric = {
    roi:         leader(r => r.projections.total_roi_score),
    attendance:  leader(r => r.projections.total_attendance),
    balance:     leader(r => balanceScore(r.projections.category_distribution)),
    seasonality: leader(r => seasonalityScore(r.portfolio)),
  }

  // Recommendation: the scenario that wins the most metrics
  const wins = new Map<string, number>()
  Object.values(leader_by_metric).forEach(id => wins.set(id, (wins.get(id) ?? 0) + 1))
  const topId = [...wins.entries()].sort((a, b) => b[1] - a[1])[0][0]
  const top = results.find(r => r.config.id === topId)!

  const recommendation = buildRecommendationLine(top, results)

  return { scenarios: results, leader_by_metric, recommendation }
}

// ─── Helpers ────────────────────────────────────────────────

function categoryBreakdown(events: PortfolioEvent[]): Record<Category, number> {
  const d = { Family: 0, Entertainment: 0, Sports: 0 } as Record<Category, number>
  for (const e of events) d[e.category]++
  return d
}

function countGapsFilled(portfolio: PortfolioEvent[], gaps: EnrichedGapSlot[]): number {
  if (gaps.length === 0) return 0
  let count = 0
  for (const g of gaps) {
    if (g.severity === 'Low') continue
    const match = portfolio.some(e =>
      e.category === g.category && new Date(e.start_date).getMonth() + 1 === g.month
    )
    if (match) count++
  }
  return count
}

/** Higher = more evenly distributed across categories (1.0 = perfect 1/3 split) */
function balanceScore(dist: Record<Category, number>): number {
  const total = dist.Family + dist.Entertainment + dist.Sports
  if (total === 0) return 0
  const shares = [dist.Family, dist.Entertainment, dist.Sports].map(n => n / total)
  // Entropy-style: uniform has max entropy, single category has 0
  const entropy = -shares.reduce((s, p) => p > 0 ? s + p * Math.log(p) : s, 0)
  return entropy / Math.log(3)  // normalize to [0, 1]
}

/** Higher = events spread across more months */
function seasonalityScore(events: PortfolioEvent[]): number {
  if (events.length === 0) return 0
  const months = new Set(events.map(e => new Date(e.start_date).getMonth() + 1))
  return months.size / 12
}

function buildRecommendationLine(top: ScenarioResult, all: ScenarioResult[]): string {
  const others = all.filter(r => r.config.id !== top.config.id)
  const topRoi = top.projections.total_roi_score
  const othersRoi = others.reduce((s, r) => s + r.projections.total_roi_score, 0) / Math.max(1, others.length)
  const roiDelta = othersRoi > 0 ? Math.round(((topRoi - othersRoi) / othersRoi) * 100) : 0

  const bits: string[] = [`"${top.config.name}" leads`]
  if (roiDelta > 0) bits.push(`${roiDelta}% above average ROI`)
  bits.push(`${top.projections.events_count} events`)
  bits.push(`${top.projections.gaps_filled} gaps filled`)
  return bits.join(' · ') + '.'
}

// ─── Preset scenarios ───────────────────────────────────────

export const PRESET_SCENARIOS: ScenarioConfig[] = [
  {
    id: 'conservative-500',
    name: 'Conservative · Proven Wins',
    total_budget: 500_000_000,
    risk_level: 'conservative',
    category_focus: 'All',
  },
  {
    id: 'balanced-500',
    name: 'Balanced · Mixed Bets',
    total_budget: 500_000_000,
    risk_level: 'balanced',
    category_focus: 'All',
  },
  {
    id: 'aggressive-500',
    name: 'Aggressive · Maximum Reach',
    total_budget: 500_000_000,
    risk_level: 'aggressive',
    category_focus: 'All',
  },
]
