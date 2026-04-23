import type { Event, Category, City, GapSlot, GapReport } from '@/types'

const CATEGORIES: Category[] = ['Family', 'Entertainment', 'Sports']

const DENSITY_THRESHOLDS = { light: 1, moderate: 3, heavy: 6 }

function getDensity(count: number): GapSlot['density'] {
  if (count === 0) return 'empty'
  if (count <= DENSITY_THRESHOLDS.light) return 'light'
  if (count <= DENSITY_THRESHOLDS.moderate) return 'moderate'
  return 'heavy'
}

function getGapScore(density: GapSlot['density']): number {
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
      const count = events.filter(e => {
        const d = new Date(e.date)
        return (
          e.city === city &&
          e.category === category &&
          d.getFullYear() === year &&
          d.getMonth() + 1 === month
        )
      }).length

      const density = getDensity(count)
      slots.push({
        month,
        year,
        category,
        city,
        event_count: count,
        density,
        gap_score: getGapScore(density),
      })
    }
  }

  const emptySlots = slots.filter(s => s.density === 'empty' || s.density === 'light')

  // Find the month with the lowest total event count
  const monthTotals = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    total: slots.filter(s => s.month === i + 1).reduce((sum, s) => sum + s.event_count, 0),
  }))
  const emptiestMonth = monthTotals.sort((a, b) => a.total - b.total)[0].month

  // Find the category with the most empty slots
  const categoryCounts = CATEGORIES.map(cat => ({
    category: cat,
    empty: slots.filter(s => s.category === cat && s.density === 'empty').length,
  }))
  const emptiestCategory = categoryCounts.sort((a, b) => b.empty - a.empty)[0].category

  return {
    city,
    year,
    slots,
    summary: {
      emptiest_month: emptiestMonth,
      emptiest_category: emptiestCategory,
      total_gaps: emptySlots.length,
    },
  }
}

export function compareGaps(adReport: GapReport, dubaiReport: GapReport) {
  return adReport.slots.map(adSlot => {
    const dubaiSlot = dubaiReport.slots.find(
      d => d.month === adSlot.month && d.category === adSlot.category
    )
    return {
      month: adSlot.month,
      category: adSlot.category,
      ad_count: adSlot.event_count,
      dubai_count: dubaiSlot?.event_count ?? 0,
      ad_gap: adSlot.gap_score,
      opportunity: adSlot.gap_score > 0.5 && (dubaiSlot?.event_count ?? 0) > 0,
    }
  })
}
