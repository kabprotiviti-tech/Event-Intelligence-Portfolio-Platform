/**
 * Chairman Brief orchestrator — composes the full intelligence bundle.
 * Calls every analysis layer once, computes portfolio health, and returns
 * a single structure the UI renders as a one-page executive briefing.
 */

import type {
  City, ChairmanBrief, PortfolioHealth, PortfolioHealthLabel, HealthTrajectory,
  DecisionPanel, TrendReport, StrategicOutlook, ScenarioComparison,
} from '@/types'
import { getEvents } from './data-provider'
import { detectGaps } from './gap-detector'
import { enrichGapReport } from './gap-enricher'
import { buildPortfolio, simulateBudget } from './scorer'
import { generateDecisions } from './decision-engine'
import { getTrendSignals } from './trend-intelligence'
import { getStrategicOutlook } from './strategic-outlook'
import { getFutureOpportunities } from './future-opportunities'
import { simulateScenario, compareScenarios, PRESET_SCENARIOS } from './scenario-engine'
import { getBudget } from './store/portfolio-store'

interface BriefOptions {
  targetCity?: City
  comparisonCity?: City
  horizonYears?: number
  year?: number
}

export async function getChairmanBrief(opts: BriefOptions = {}): Promise<ChairmanBrief> {
  const targetCity     = opts.targetCity ?? 'Abu Dhabi'
  const comparisonCity = opts.comparisonCity ?? (targetCity === 'Abu Dhabi' ? 'Dubai' : 'Abu Dhabi')
  const horizon        = opts.horizonYears ?? 2
  const year           = opts.year ?? new Date().getFullYear()

  // Base data
  const allEvents = await getEvents({ year })
  const scopedEvents = allEvents.filter(e => e.city === targetCity)

  // Gaps
  const rawReport = detectGaps(allEvents, targetCity, year)
  const enriched  = enrichGapReport(rawReport, allEvents, [comparisonCity])

  // Portfolio + decisions
  const budget    = getBudget()
  const scored    = buildPortfolio(scopedEvents)
  const withBudget = simulateBudget(scored, budget)
  const decisions = generateDecisions({
    events: withBudget,
    allEvents,
    gaps: enriched.slots,
    budget,
    targetCity,
    comparisonCity,
  })

  // Intelligence layers
  const trends   = getTrendSignals(allEvents)
  const outlook  = getStrategicOutlook(allEvents, targetCity, comparisonCity, horizon)
  const opportunities = getFutureOpportunities(allEvents, enriched.slots, trends, outlook, comparisonCity)

  // Auto-run 3 preset scenarios for the comparison panel
  const scenarios: ScenarioComparison = compareScenarios(
    PRESET_SCENARIOS.map(cfg => simulateScenario(cfg, allEvents, enriched.slots))
  )

  // Portfolio health synthesis
  const portfolio_health = computePortfolioHealth(withBudget, decisions, trends, outlook)

  const key_gaps = enriched.slots
    .filter(s => s.severity !== 'Low')
    .sort((a, b) => b.gap_score - a.gap_score)
    .slice(0, 5)

  return {
    generated_at: new Date().toISOString(),
    target_city: targetCity,
    portfolio_health,
    key_gaps,
    recommended_actions: decisions,
    strategic_outlook: outlook,
    trends,
    future_opportunities: opportunities,
    scenarios,
  }
}

// ─── Portfolio health ───────────────────────────────────────

function computePortfolioHealth(
  events: ReturnType<typeof buildPortfolio>,
  decisions: DecisionPanel,
  trends: TrendReport,
  outlook: StrategicOutlook,
): PortfolioHealth {
  if (events.length === 0) {
    return {
      score: 0,
      label: 'Weak',
      trajectory: 'stable',
      factors: [{ label: 'No events in scope', signal: 'negative' }],
    }
  }

  const avgScore = events.reduce((s, e) => s + e.portfolio_score, 0) / events.length
  const risingCount     = trends.signals.filter(s => s.direction === 'rising').length
  const decliningCount  = trends.signals.filter(s => s.direction === 'declining').length
  const underdevCount   = outlook.underdeveloped_categories.length
  const laggingYears    = outlook.yearly.filter(y => y.competitive_position === 'lagging').length
  const dropCount       = decisions.drop.length
  const fundCount       = decisions.fund.length

  // Composite: start from avg score, adjust
  let score = avgScore
  score += risingCount    * 0.4
  score -= decliningCount * 0.4
  score -= underdevCount  * 0.5
  score -= laggingYears   * 0.4
  score += fundCount      * 0.2
  score -= dropCount      * 0.2
  score = Math.max(0, Math.min(10, Math.round(score * 10) / 10))

  const label: PortfolioHealthLabel =
    score >= 8   ? 'Strong'
  : score >= 6.5 ? 'Solid'
  : score >= 4   ? 'At risk'
  :                'Weak'

  const trajectory: HealthTrajectory =
    risingCount >= 2 && decliningCount === 0                    ? 'improving'
  : decliningCount >= 2 || (laggingYears === outlook.yearly.length) ? 'declining'
  :                                                               'stable'

  const factors: PortfolioHealth['factors'] = [
    { label: `Avg score ${avgScore.toFixed(1)}`, signal: avgScore >= 7 ? 'positive' : avgScore >= 5 ? 'neutral' : 'negative' },
    { label: `${fundCount} fund-ready · ${dropCount} drop-candidates`, signal: fundCount > dropCount ? 'positive' : 'negative' },
    { label: risingCount > 0 ? `${risingCount} rising categories` : 'No rising categories', signal: risingCount > 0 ? 'positive' : 'neutral' },
    { label: underdevCount > 0 ? `${underdevCount} underdeveloped categories` : 'Category balance healthy', signal: underdevCount > 0 ? 'negative' : 'positive' },
    { label: laggingYears > 0 ? `Lagging in ${laggingYears}/${outlook.yearly.length} horizon years` : 'Competitive across horizon', signal: laggingYears > 0 ? 'negative' : 'positive' },
  ]

  return { score, label, trajectory, factors }
}
