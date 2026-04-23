import type { Event, Category, City } from '@/types'
import { allEvents } from '@/data'

export interface EventFilters {
  city?: City | City[]
  category?: Category
  year?: number
  month?: number
  verification_level?: string
}

export async function getEvents(filters?: EventFilters): Promise<Event[]> {
  let events = [...allEvents]

  if (filters?.city) {
    const cities = Array.isArray(filters.city) ? filters.city : [filters.city]
    events = events.filter(e => cities.includes(e.city))
  }
  if (filters?.category) {
    events = events.filter(e => e.category === filters.category)
  }
  if (filters?.year) {
    events = events.filter(e => new Date(e.start_date).getFullYear() === filters.year)
  }
  if (filters?.month) {
    events = events.filter(e => new Date(e.start_date).getMonth() + 1 === filters.month)
  }
  if (filters?.verification_level) {
    events = events.filter(e => e.verification_level === filters.verification_level)
  }

  return events.sort(
    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  )
}
