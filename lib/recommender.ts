import type { Category, City, EventConcept, GapReport } from '@/types'

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface ConceptTemplate {
  title: string
  category: Category
  base_audience: number
}

const TEMPLATES: ConceptTemplate[] = [
  { title: 'Yas Island Family Summer Splash',     category: 'Family',        base_audience: 40000 },
  { title: 'Abu Dhabi Night Run Festival',        category: 'Sports',        base_audience: 15000 },
  { title: 'Heritage & Culture Weekend',          category: 'Family',        base_audience: 35000 },
  { title: 'UAE Esports Championship',            category: 'Entertainment', base_audience: 25000 },
  { title: 'Corniche Open Water Swimming Series', category: 'Sports',        base_audience: 8000  },
  { title: 'AD Family Camping Festival',          category: 'Family',        base_audience: 20000 },
  { title: 'Desert Drone Racing Cup',             category: 'Sports',        base_audience: 12000 },
  { title: 'AD Comedy & Culture Night',           category: 'Entertainment', base_audience: 10000 },
  { title: 'Kids Creative Arts Festival',         category: 'Family',        base_audience: 30000 },
  { title: 'Indoor Padel Championship AD',        category: 'Sports',        base_audience: 8000  },
  { title: 'Abu Dhabi Food & Music Street Fair',  category: 'Entertainment', base_audience: 50000 },
  { title: 'Family Beach Olympics',               category: 'Family',        base_audience: 25000 },
]

function buildReason(city: City, month: number, category: Category, dubaiCount: number): string {
  const m = MONTH_NAMES[month]
  if (dubaiCount > 0) {
    return `${city} has no ${category} events in ${m} while Dubai runs ${dubaiCount}. High-impact gap with proven regional demand.`
  }
  return `${city} has no ${category} events in ${m}. Low competition window — strong first-mover opportunity.`
}

function getConfidence(gapScore: number): EventConcept['confidence'] {
  if (gapScore >= 0.9) return 'High'
  if (gapScore >= 0.6) return 'Medium'
  return 'Low'
}

let idCounter = 0

export function generateRecommendations(
  adReport: GapReport,
  dubaiReport: GapReport | null,
  limit = 6
): EventConcept[] {
  const highGapSlots = adReport.slots
    .filter(s => s.gap_score >= 0.6)
    .sort((a, b) => b.gap_score - a.gap_score)

  const used = new Set<string>()
  const concepts: EventConcept[] = []

  for (const slot of highGapSlots) {
    if (concepts.length >= limit) break

    const template = TEMPLATES.find(
      t => t.category === slot.category && !used.has(t.title)
    )
    if (!template) continue

    used.add(template.title)

    const dubaiCount = dubaiReport
      ? dubaiReport.slots.find(
          d => d.month === slot.month && d.category === slot.category
        )?.event_count ?? 0
      : 0

    concepts.push({
      id: `rec-${++idCounter}`,
      title: template.title,
      category: slot.category,
      suggested_month: slot.month,
      suggested_city: slot.city,
      estimated_audience: Math.round(template.base_audience * (1 + slot.gap_score * 0.3)),
      reason: buildReason(slot.city, slot.month, slot.category, dubaiCount),
      gap_score: slot.gap_score,
      confidence: getConfidence(slot.gap_score),
    })
  }

  return concepts
}
