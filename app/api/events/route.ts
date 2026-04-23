import { NextRequest, NextResponse } from 'next/server'
import { getEvents } from '@/lib/data-provider'
import { getProposedEvents } from '@/lib/store/portfolio-store'
import type { Category, City } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const city = searchParams.get('city') as City | null
  const category = searchParams.get('category') as Category | null
  const year = searchParams.get('year')
  const month = searchParams.get('month')
  const includeProposed = searchParams.get('include_proposed') !== '0'

  const base = await getEvents({
    ...(city && { city }),
    ...(category && { category }),
    ...(year && { year: parseInt(year) }),
    ...(month && { month: parseInt(month) }),
  })

  // Proposed events from approved concepts, filtered the same way
  const proposed = includeProposed ? getProposedEvents().filter(e => {
    if (city && e.city !== city) return false
    if (category && e.category !== category) return false
    const d = new Date(e.start_date)
    if (year && d.getFullYear() !== parseInt(year)) return false
    if (month && d.getMonth() + 1 !== parseInt(month)) return false
    return true
  }) : []

  const events = [...base, ...proposed].sort(
    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  )

  return NextResponse.json({
    data: events,
    meta: {
      count: events.length,
      proposed_count: proposed.length,
      generated_at: new Date().toISOString(),
    },
  })
}
