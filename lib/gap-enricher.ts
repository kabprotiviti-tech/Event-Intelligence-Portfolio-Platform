import type {
  Category, City, Event, EnrichedGapReport, EnrichedGapSlot,
  GapReport, GapSeverity,
} from '@/types'

const MONTH_NAMES = [
  '', 'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

function severityOf(gapScore: number): GapSeverity {
  if (gapScore > 0.8) return 'Critical'
  if (gapScore >= 0.5) return 'Medium'
  return 'Low'
}

function hintFor(cat: Category, severity: GapSeverity): string {
  if (severity === 'Low') return `${cat} demand is already well-served.`
  const base: Record<Category, string> = {
    Family:        'High opportunity for Family segment — GCC-origin spillover likely.',
    Entertainment: 'Strong window for Entertainment — targets Europe / mixed tourism origins.',
    Sports:        'Clear opening for Sports — aligns with marquee-event tourism strategy.',
  }
  return severity === 'Critical' ? `Urgent: ${base[cat]}` : base[cat]
}

function competitorContext(
  slot: { month: number; category: Category; city: City },
  allEvents: Event[],
  comparisonCities: City[],
): string {
  const matching = allEvents.filter(e => {
    const d = new Date(e.start_date)
    return (
      comparisonCities.includes(e.city) &&
      e.category === slot.category &&
      d.getMonth() + 1 === slot.month
    )
  })

  if (matching.length === 0) {
    return `No ${slot.category.toLowerCase()} events detected in comparable cities during ${MONTH_NAMES[slot.month]}.`
  }

  // Aggregate by city
  const byCity = new Map<string, number>()
  matching.forEach(e => byCity.set(e.city, (byCity.get(e.city) ?? 0) + 1))

  const phrase = Array.from(byCity.entries())
    .map(([city, n]) => `${city} has ${n} event${n === 1 ? '' : 's'}`)
    .join('; ')

  return `${phrase} in ${MONTH_NAMES[slot.month]}.`
}

export function enrichGapReport(
  report: GapReport,
  allEvents: Event[],
  comparisonCities: City[] = ['Dubai', 'Riyadh', 'Doha'],
): EnrichedGapReport {
  const enriched: EnrichedGapSlot[] = report.slots.map(s => {
    const severity = severityOf(s.gap_score)
    return {
      ...s,
      severity,
      competitor_context: competitorContext(s, allEvents, comparisonCities),
      recommendation_hint: hintFor(s.category, severity),
    }
  })

  return { ...report, slots: enriched }
}
