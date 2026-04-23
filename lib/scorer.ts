import type { Event, PortfolioEvent } from '@/types'

const WEIGHTS = {
  roi:             0.30,
  strategic_fit:   0.25,
  seasonality:     0.20,
  tourism_impact:  0.15,
  private_sector:  0.10,
}

const TIER_MODIFIER: Record<string, number> = {
  'Tier 1': 1.0,
  'Tier 2': 0.9,
  'Tier 3': 0.8,
}

export function scoreEvent(event: Event): number {
  const raw =
    event.roi_score            * WEIGHTS.roi +
    event.strategic_fit_score  * WEIGHTS.strategic_fit +
    event.seasonality_score    * WEIGHTS.seasonality +
    event.tourism_impact_score * WEIGHTS.tourism_impact +
    event.private_sector_score * WEIGHTS.private_sector

  const modifier = TIER_MODIFIER[event.verification_level] ?? 1.0
  return Math.round(raw * modifier * 10) / 10
}

export function buildPortfolio(events: Event[]): PortfolioEvent[] {
  return events.map(e => ({
    ...e,
    portfolio_score: scoreEvent(e),
    status: 'Active' as const,
  })).sort((a, b) => b.portfolio_score - a.portfolio_score)
}

export function simulateBudget(
  events: PortfolioEvent[],
  totalBudget: number
): PortfolioEvent[] {
  const sorted = [...events].sort((a, b) => b.portfolio_score - a.portfolio_score)
  const totalScore = sorted.reduce((sum, e) => sum + e.portfolio_score, 0)

  return sorted.map(e => ({
    ...e,
    budget_allocated: Math.round((e.portfolio_score / totalScore) * totalBudget),
    status: 'Active' as const,
  }))
}
