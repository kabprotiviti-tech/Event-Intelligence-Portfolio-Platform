/**
 * Future Opportunities — predictive recommendations from gaps × trends × outlook.
 *
 * Rule-based pattern-match. Each pattern is a Chairman-readable sentence
 * tied to specific evidence in the current dataset.
 */

import type {
  EnrichedGapSlot, FutureOpportunity, StrategicOutlook, TrendReport,
  Event, Category, OpportunityHorizon, DecisionConfidence,
} from '@/types'

export function getFutureOpportunities(
  events: Event[],
  gaps: EnrichedGapSlot[],
  trends: TrendReport,
  outlook: StrategicOutlook,
  comparisonCity = 'Dubai',
): FutureOpportunity[] {
  const opportunities: FutureOpportunity[] = []

  // Pattern 1 — rising trend × underdeveloped category (highest priority)
  for (const signal of trends.signals.filter(s => s.direction === 'rising')) {
    const underdev = outlook.underdeveloped_categories.find(u => u.category === signal.category)
    if (!underdev) continue
    opportunities.push({
      id: `fo-trend-underdev-${signal.category}`,
      title: `Expand ${signal.category} programming to capture rising demand`,
      category: signal.category,
      horizon: 'Next year',
      reasoning:
        `${signal.category} momentum is +${Math.round(signal.momentum * 100)}% across the last 6 months, ` +
        `yet it represents only ${underdev.avg_share_pct}% of the target portfolio.`,
      evidence: [...signal.evidence, underdev.reason],
      confidence: 'High',
      investment_range: { min: 10_000_000, max: 30_000_000 },
    })
  }

  // Pattern 2 — summer gaps (June–August) → indoor entertainment
  const summerGaps = gaps.filter(g =>
    g.month >= 6 && g.month <= 8 && (g.severity === 'Critical' || g.severity === 'Medium')
  )
  if (summerGaps.length >= 2) {
    opportunities.push({
      id: 'fo-indoor-summer',
      title: 'Invest in indoor summer entertainment',
      category: 'Entertainment',
      horizon: 'Q3',
      reasoning:
        `${summerGaps.length} mid-to-high severity gaps concentrated in Jun–Aug point to ` +
        `unmet demand during the high-temperature window. Indoor formats (conferences, arena concerts, ` +
        `mall-based festivals) absorb tourism spend without outdoor constraints.`,
      evidence: summerGaps.slice(0, 4).map(g => `${g.category} · Month ${g.month} · ${g.severity}`),
      confidence: 'High',
      investment_range: { min: 8_000_000, max: 20_000_000 },
    })
  }

  // Pattern 3 — Q1 Sports competition with Dubai / regional
  const q1SportsGaps = outlook.competitive_gaps.filter(g => g.category === 'Sports' && g.month <= 3)
  const totalQ1Deficit = q1SportsGaps.reduce((s, g) => s + g.their_lead, 0)
  if (totalQ1Deficit >= 2) {
    opportunities.push({
      id: 'fo-q1-sports',
      title: `Expand Q1 Sports events to compete with ${comparisonCity}`,
      category: 'Sports',
      horizon: 'Q1',
      reasoning:
        `${comparisonCity} leads by ${totalQ1Deficit} Sports events across Q1 — Abu Dhabi's share ` +
        `of regional Q1 Sports tourism is structurally at risk unless countered.`,
      evidence: q1SportsGaps.slice(0, 3).map(g => `${comparisonCity} +${g.their_lead} in month ${g.month}`),
      confidence: 'High',
      investment_range: { min: 15_000_000, max: 40_000_000 },
    })
  }

  // Pattern 4 — emerging format × any gap
  for (const format of trends.emerging_formats.slice(0, 2)) {
    opportunities.push({
      id: `fo-format-${format.format}`,
      title: `Pilot a ${format.format.toLowerCase()} format — growing +${Math.round(format.growth * 100)}%`,
      category: inferFormatCategory(format.format),
      horizon: 'Q4',
      reasoning:
        `${format.format} format shows ${Math.round(format.growth * 100)}% growth in recent 6 months ` +
        `across tracked sources. Seen in: ${format.sample_events.slice(0, 2).join(', ')}.`,
      evidence: format.sample_events,
      confidence: 'Medium',
      investment_range: { min: 3_000_000, max: 12_000_000 },
    })
  }

  // Pattern 5 — structural lag position ⇒ long-term recovery plan
  const lagging = outlook.yearly.filter(y => y.competitive_position === 'lagging').length
  if (lagging >= outlook.yearly.length) {
    opportunities.push({
      id: 'fo-lag-recovery',
      title: `Multi-year competitive recovery vs ${comparisonCity}`,
      category: 'Entertainment',
      horizon: 'Multi-year',
      reasoning:
        `Target city lags ${comparisonCity} across every horizon year. Requires sustained ` +
        `signature-event investment over 24–36 months, not one-off fixes.`,
      evidence: outlook.long_term_recommendations.slice(0, 2),
      confidence: 'Medium',
      investment_range: { min: 50_000_000, max: 150_000_000 },
    })
  }

  return opportunities.slice(0, 6)
}

function inferFormatCategory(format: string): Category {
  switch (format) {
    case 'Tournament': return 'Sports'
    case 'Concert':
    case 'Exhibition':
    case 'Conference': return 'Entertainment'
    case 'Festival':   return 'Family'
    default:           return 'Entertainment'
  }
}
