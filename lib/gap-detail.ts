import type { Event, Category, City } from '@/types'

/**
 * Given a month/category/city, return the actual events that populated
 * that cell in the gap matrix. Powers the drill-down panel.
 */
export function getCellEvents(
  events: Event[],
  city: City,
  month: number,
  category: Category,
  year = 2025,
): Event[] {
  return events.filter(e => {
    if (e.city !== city || e.category !== category) return false
    const d = new Date(e.start_date)
    return d.getFullYear() === year && d.getMonth() + 1 === month
  }).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
}

/**
 * Signal from an AD vs comparison-city comparison for a given slot.
 * Used to drive the cell's visual tone + drill-down narrative.
 */
export interface CompetitiveSignal {
  ad_count: number
  comp_count: number
  delta: number                          // ad_count - comp_count
  position: 'leading' | 'matching' | 'behind' | 'empty_both'
  severity: 'Critical' | 'Medium' | 'Low' | 'None'
  narrative: string                      // one-sentence summary for the drill header
}

export function competitiveSignalFor(
  adEvents: Event[], compEvents: Event[], month: number, category: Category, compCity: string,
): CompetitiveSignal {
  const ad_count = adEvents.length
  const comp_count = compEvents.length
  const delta = ad_count - comp_count

  let position: CompetitiveSignal['position']
  if (ad_count === 0 && comp_count === 0) position = 'empty_both'
  else if (delta > 0)                      position = 'leading'
  else if (delta === 0)                    position = 'matching'
  else                                     position = 'behind'

  let severity: CompetitiveSignal['severity'] = 'None'
  if (position === 'behind') {
    severity = (comp_count - ad_count >= 2 || (ad_count === 0 && comp_count >= 1))
      ? 'Critical'
      : 'Medium'
  } else if (position === 'empty_both') {
    severity = 'Low'   // both empty — opportunity to be first mover
  }

  const monthName = MONTHS[month]
  let narrative: string
  if (position === 'empty_both') {
    narrative = `No ${category} events in ${monthName} anywhere in the region — uncontested window for Abu Dhabi.`
  } else if (position === 'behind') {
    const gap = comp_count - ad_count
    narrative = `${compCity} leads by ${gap} ${category.toLowerCase()} event${gap === 1 ? '' : 's'} in ${monthName}. Abu Dhabi has ${ad_count === 0 ? 'none' : ad_count}.`
  } else if (position === 'leading') {
    narrative = `Abu Dhabi leads in ${category} during ${monthName} (${ad_count} vs ${comp_count}).`
  } else {
    narrative = `Even matchup in ${category} during ${monthName} (${ad_count} each).`
  }

  return { ad_count, comp_count, delta, position, severity, narrative }
}

const MONTHS = [
  '', 'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
