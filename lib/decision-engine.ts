import type { DecisionEntry, DecisionPanel, PortfolioEvent } from '@/types'

const MONTHS = [
  '', 'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

/**
 * Rank-based director decisions. Pure; no side effects.
 * The point is defensibility — every reason ties to a measured score.
 */
export function computeDecisions(events: PortfolioEvent[]): DecisionPanel {
  if (events.length === 0) {
    return { fund: [], scale: [], drop: [] }
  }

  // 1) Fund: top scores with strong strategic_fit. "Fund confidently."
  const fund: DecisionEntry[] = [...events]
    .filter(e => e.status !== 'Dropped' && e.status !== 'Proposed')
    .sort((a, b) => b.portfolio_score - a.portfolio_score)
    .slice(0, 3)
    .map(e => ({
      event: e,
      reason: reasonFund(e),
    }))

  // 2) Scale: decent score + underfunded relative to audience / impact
  //    We treat events with score 6–8.5 and budget-per-guest below
  //    the portfolio median as scaling candidates.
  const allocatedEvents = events.filter(e => (e.budget_allocated ?? 0) > 0 && e.estimated_attendance > 0)
  const perGuestValues = allocatedEvents.map(e => (e.budget_allocated ?? 0) / e.estimated_attendance)
  const medianPerGuest = median(perGuestValues) || 0

  const scaleCandidates = events
    .filter(e => e.status !== 'Dropped' && e.status !== 'Proposed')
    .filter(e => e.portfolio_score >= 6 && e.portfolio_score < 8.5)
    .map(e => {
      const perGuest = e.estimated_attendance > 0 && (e.budget_allocated ?? 0) > 0
        ? (e.budget_allocated as number) / e.estimated_attendance
        : 0
      const underfund_ratio = medianPerGuest > 0 ? perGuest / medianPerGuest : 1
      return { e, underfund_ratio, perGuest }
    })
    // underfund_ratio < 1 means this event gets less per guest than the median
    .sort((a, b) => a.underfund_ratio - b.underfund_ratio)
    .slice(0, 3)

  const scale: DecisionEntry[] = scaleCandidates.map(({ e, underfund_ratio, perGuest }) => ({
    event: e,
    reason: reasonScale(e, underfund_ratio, perGuest, medianPerGuest),
  }))

  // 3) Drop: lowest portfolio score. Reason cites the specific weakness.
  const drop: DecisionEntry[] = [...events]
    .filter(e => e.status !== 'Proposed')
    .sort((a, b) => a.portfolio_score - b.portfolio_score)
    .slice(0, 3)
    .map(e => ({
      event: e,
      reason: reasonDrop(e),
    }))

  return { fund, scale, drop }
}

// ── Reason builders ─────────────────────────────────────────

function reasonFund(e: PortfolioEvent): string {
  const fragments: string[] = []
  if (e.strategic_fit_score >= 9) fragments.push('exceptional strategic fit')
  else if (e.strategic_fit_score >= 8) fragments.push('strong strategic fit')

  if (e.tourism_impact_score >= 9) fragments.push('high tourism draw')
  if (e.private_sector_score >= 9) fragments.push('private-sector leverage')
  if (e.roi_score >= 9) fragments.push('top-tier ROI')
  if (e.impact_weight === 5) fragments.push('marquee impact')

  const body = fragments.length ? fragments.join(', ') : 'consistently high scores'
  return `Portfolio score ${e.portfolio_score.toFixed(1)} — ${body}.`
}

function reasonScale(
  e: PortfolioEvent,
  underfund_ratio: number,
  perGuest: number,
  median: number,
): string {
  const under = underfund_ratio < 0.8
  const pct = Math.round((1 - underfund_ratio) * 100)
  const base = `Score ${e.portfolio_score.toFixed(1)} with ${e.estimated_attendance.toLocaleString()} expected guests`
  if (under && perGuest > 0) {
    return `${base}, ${pct}% under median per-guest spend — upside from increased investment.`
  }
  if (e.impact_weight >= 4) {
    return `${base}. Impact weight ${e.impact_weight}/5 suggests room to grow programming depth.`
  }
  return `${base}. Solid tier, bigger budget likely compounds returns.`
}

function reasonDrop(e: PortfolioEvent): string {
  const weaknesses: string[] = []
  if (e.roi_score < 6)            weaknesses.push('weak ROI')
  if (e.tourism_impact_score < 5) weaknesses.push('low tourism draw')
  if (e.strategic_fit_score < 6)  weaknesses.push('limited strategic fit')
  if (e.verification_level === 'Tier 3') weaknesses.push('unverified source')
  if (e.seasonality_score < 5)    weaknesses.push(`${MONTHS[new Date(e.start_date).getMonth() + 1]} placement underperforms`)

  const body = weaknesses.length ? weaknesses.slice(0, 2).join(', ') : 'low composite score'
  return `Score ${e.portfolio_score.toFixed(1)} — ${body}.`
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
