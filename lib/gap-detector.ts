import type { Event, Category, City, GapSlot, GapReport } from '@/types'

const CATEGORIES: Category[] = ['Family', 'Entertainment', 'Sports']

// Thresholds on WEIGHTED density (sum of impact_weight in that slot)
const WEIGHTED_THRESHOLDS = { light: 3, moderate: 8, heavy: 15 }

function classifyDensity(weighted: number): GapSlot['density'] {
  if (weighted === 0) return 'empty'
  if (weighted <= WEIGHTED_THRESHOLDS.light) return 'light'
  if (weighted <= WEIGHTED_THRESHOLDS.moderate) return 'moderate'
  return 'heavy'
}

function gapScoreFor(density: GapSlot['density']): number {
  switch (density) {
    case 'empty':    return 1.0
    case 'light':    return 0.7
    case 'moderate': return 0.3
    case 'heavy':    return 0.0
  }
}

export function detectGaps(events: Event[], city: City, year: number): GapReport {
  const slots: GapSlot[] = []

  for (let month = 1; month <= 12; month++) {
    for (const category of CATEGORIES) {
      const slotEvents = events.filter(e => {
        const d = new Date(e.start_date)
        return (
          e.city === city &&
          e.category === category &&
          d.getFullYear() === year &&
          d.getMonth() + 1 === month
        )
      })

      const count = slotEvents.length
      const weighted = slotEvents.reduce((sum, e) => sum + e.impact_weight, 0)
      const density = classifyDensity(weighted)

      slots.push({
        month, year, category, city,
        event_count: count,
        weighted_density: weighted,
        density,
        gap_score: gapScoreFor(density),
      })
    }
  }

  const emptySlots = slots.filter(s => s.density === 'empty' || s.density === 'light')

  const monthTotals = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    total: slots
      .filter(s => s.month === i + 1)
      .reduce((sum, s) => sum + s.weighted_density, 0),
  }))
  const emptiestMonth = monthTotals.sort((a, b) => a.total - b.total)[0].month

  const categoryCounts = CATEGORIES.map(cat => ({
    category: cat,
    empty: slots.filter(s => s.category === cat && s.density === 'empty').length,
  }))
  const emptiestCategory = categoryCounts.sort((a, b) => b.empty - a.empty)[0].category

  return {
    city, year, slots,
    summary: {
      emptiest_month: emptiestMonth,
      emptiest_category: emptiestCategory,
      total_gaps: emptySlots.length,
    },
  }
}

export function compareGaps(adReport: GapReport, otherReport: GapReport) {
  return adReport.slots.map(adSlot => {
    const otherSlot = otherReport.slots.find(
      s => s.month === adSlot.month && s.category === adSlot.category
    )
    return {
      month: adSlot.month,
      category: adSlot.category,
      ad_count: adSlot.event_count,
      other_count: otherSlot?.event_count ?? 0,
      ad_gap: adSlot.gap_score,
      opportunity: adSlot.gap_score > 0.5 && (otherSlot?.event_count ?? 0) > 0,
    }
  })
}
