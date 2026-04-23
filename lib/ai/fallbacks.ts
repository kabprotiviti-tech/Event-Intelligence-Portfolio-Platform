/**
 * Deterministic fallbacks used when ANTHROPIC_API_KEY is missing or Claude errors out.
 * Every AI endpoint returns a usable payload — the UI never breaks because of AI infra.
 */

import type {
  AiConceptPayload, AiExplanationPayload, AiSummaryPayload, AiTrendsPayload,
} from './types'
import type {
  EnrichedGapSlot, PortfolioEvent, EventDecision, TrendReport,
} from '@/types'

const MONTHS = [
  '', 'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

export function fallbackConcept(gap: EnrichedGapSlot): AiConceptPayload {
  const month = MONTHS[gap.month]
  const format = gap.category === 'Sports' ? 'Tournament' : gap.category === 'Family' ? 'Festival' : 'Concert'
  return {
    title: `${gap.city} ${month} ${gap.category} Showcase`,
    format,
    audience_estimate: gap.category === 'Family' ? 25000 : gap.category === 'Sports' ? 15000 : 12000,
    reason: `${gap.city} shows a ${gap.severity.toLowerCase()} ${gap.category} gap in ${month}. ${gap.competitor_context}`,
    risks: [gap.severity === 'Critical' ? 'Time-to-market pressure' : 'Standard execution risk'],
  }
}

export function fallbackExplanation(event: PortfolioEvent, decision: EventDecision['kind']): AiExplanationPayload {
  const verb = decision === 'fund' ? 'Fund' : decision === 'scale' ? 'Scale' : 'Drop'
  const reasons: string[] = []
  if (decision === 'fund') {
    if (event.strategic_fit_score >= 8) reasons.push(`Strategic fit score ${event.strategic_fit_score.toFixed(1)} — top quartile.`)
    if (event.roi_score >= 8) reasons.push(`ROI score ${event.roi_score.toFixed(1)} is among portfolio leaders.`)
    if (event.impact_weight >= 4) reasons.push(`Impact weight ${event.impact_weight}/5 indicates marquee reach.`)
  } else if (decision === 'scale') {
    reasons.push(`Portfolio score ${event.portfolio_score.toFixed(1)} with ${event.estimated_attendance.toLocaleString()} expected guests.`)
    reasons.push('Audience footprint exceeds current per-guest investment.')
  } else {
    if (event.roi_score < 6)  reasons.push(`ROI score ${event.roi_score.toFixed(1)} is below cutoff.`)
    if (event.tourism_impact_score < 5) reasons.push(`Tourism impact only ${event.tourism_impact_score.toFixed(1)}/10.`)
    if (event.verification_level === 'Tier 3') reasons.push('Source verification is Tier 3 — low confidence in upside.')
  }
  return {
    explanation: `${verb} ${event.name} — score ${event.portfolio_score.toFixed(1)} reflects the current evidence.`,
    bullet_reasons: reasons.slice(0, 3),
    caveats: event.verification_level === 'Tier 3' ? ['Verification tier is Tier 3 — verify before commitment.'] : [],
  }
}

export function fallbackSummary(gaps: EnrichedGapSlot[], portfolio: PortfolioEvent[]): AiSummaryPayload {
  const criticalGaps = gaps.filter(g => g.severity === 'Critical').slice(0, 3)
  const lowScorers = [...portfolio].sort((a, b) => a.portfolio_score - b.portfolio_score).slice(0, 3)
  const avg = portfolio.length
    ? portfolio.reduce((s, e) => s + e.portfolio_score, 0) / portfolio.length
    : 0

  return {
    headline: `Portfolio averages ${avg.toFixed(1)}/10 with ${criticalGaps.length} critical calendar gaps.`,
    key_gaps: criticalGaps.map(g => `${MONTHS[g.month]} ${g.category} — ${g.competitor_context}`),
    portfolio_weaknesses: lowScorers.map(e => `${e.name} · score ${e.portfolio_score.toFixed(1)}`),
    recommended_focus_areas: [
      criticalGaps.length ? `Close ${criticalGaps[0].category} gap in ${MONTHS[criticalGaps[0].month]}` : 'Defend current category balance',
      'Prioritise Tier 1 verified events for budget allocation',
      'Monitor competitor cadence monthly',
    ],
  }
}

export function fallbackTrends(trends: TrendReport): AiTrendsPayload {
  return {
    trending_categories: trends.signals
      .filter(s => s.direction === 'rising')
      .map(s => ({
        category: s.category,
        reason: `+${Math.round(s.momentum * 100)}% over the last 6 months vs prior period.`,
      })),
    emerging_formats: trends.emerging_formats.map(f => ({
      format: f.format,
      reason: `+${Math.round(f.growth * 100)}% growth across tracked sources.`,
    })),
    market_signals: trends.recommended_focus.map(r => r.reason),
  }
}
