import type {
  Category, City, EventConcept, Event, EventFormat, GapReport,
} from '@/types'

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface ConceptTemplate {
  title: string
  category: Category
  event_format: EventFormat
  base_audience: number
  base_budget: number
}

const TEMPLATES: ConceptTemplate[] = [
  { title: 'Yas Island Family Summer Splash',     category: 'Family',        event_format: 'Festival',   base_audience: 40000, base_budget: 6_000_000 },
  { title: 'Abu Dhabi Night Run Festival',        category: 'Sports',        event_format: 'Tournament', base_audience: 15000, base_budget: 4_000_000 },
  { title: 'Heritage & Culture Weekend',          category: 'Family',        event_format: 'Festival',   base_audience: 35000, base_budget: 5_000_000 },
  { title: 'UAE Esports Championship',            category: 'Entertainment', event_format: 'Tournament', base_audience: 25000, base_budget: 9_000_000 },
  { title: 'Corniche Open Water Swimming Series', category: 'Sports',        event_format: 'Tournament', base_audience: 8000,  base_budget: 2_500_000 },
  { title: 'AD Family Camping Festival',          category: 'Family',        event_format: 'Festival',   base_audience: 20000, base_budget: 3_500_000 },
  { title: 'Desert Drone Racing Cup',             category: 'Sports',        event_format: 'Tournament', base_audience: 12000, base_budget: 5_000_000 },
  { title: 'AD Comedy & Culture Night',           category: 'Entertainment', event_format: 'Concert',    base_audience: 10000, base_budget: 3_000_000 },
  { title: 'Kids Creative Arts Festival',         category: 'Family',        event_format: 'Festival',   base_audience: 30000, base_budget: 4_000_000 },
  { title: 'Indoor Padel Championship AD',        category: 'Sports',        event_format: 'Tournament', base_audience: 8000,  base_budget: 2_000_000 },
  { title: 'Abu Dhabi Food & Music Street Fair',  category: 'Entertainment', event_format: 'Festival',   base_audience: 50000, base_budget: 7_000_000 },
  { title: 'Family Beach Olympics',               category: 'Family',        event_format: 'Tournament', base_audience: 25000, base_budget: 3_500_000 },
  { title: 'AD Indie Film & Music Expo',          category: 'Entertainment', event_format: 'Exhibition', base_audience: 18000, base_budget: 5_500_000 },
  { title: 'Saadiyat Tennis Open',                category: 'Sports',        event_format: 'Tournament', base_audience: 22000, base_budget: 12_000_000 },
]

function buildReason(city: City, month: number, category: Category, refs: Event[]): string {
  const m = MONTH_NAMES[month]
  if (refs.length) {
    const names = refs.slice(0, 2).map(r => r.name).join(', ')
    return `${city} has no ${category} events in ${m}. Regional precedent: ${names}. High-impact gap with proven demand signal.`
  }
  return `${city} has no ${category} events in ${m}. Low-competition window — strong first-mover opportunity.`
}

function confidenceFor(gap: number): EventConcept['confidence'] {
  if (gap >= 0.9) return 'High'
  if (gap >= 0.6) return 'Medium'
  return 'Low'
}

let idCounter = 0

export function generateRecommendations(
  adReport: GapReport,
  allEvents: Event[],
  limit = 6,
  comparableCities: City[] = ['Dubai', 'Riyadh', 'Doha'],
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

    // Find reference events: same category in same month in comparable cities
    const referenceEvents = allEvents.filter(e => {
      const d = new Date(e.start_date)
      return (
        comparableCities.includes(e.city) &&
        e.category === slot.category &&
        d.getMonth() + 1 === slot.month
      )
    }).slice(0, 3)

    concepts.push({
      id: `rec-${++idCounter}`,
      title: template.title,
      category: slot.category,
      event_format: template.event_format,
      suggested_month: slot.month,
      suggested_city: slot.city,
      estimated_audience: Math.round(template.base_audience * (1 + slot.gap_score * 0.3)),
      estimated_budget: template.base_budget,
      reason: buildReason(slot.city, slot.month, slot.category, referenceEvents),
      reference_events: referenceEvents.map(e => e.id),
      gap_score: slot.gap_score,
      confidence: confidenceFor(slot.gap_score),
    })
  }

  return concepts
}
