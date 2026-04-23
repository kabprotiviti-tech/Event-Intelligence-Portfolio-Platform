import { NextRequest, NextResponse } from 'next/server'
import { getEvents } from '@/lib/data-provider'
import type { Category, City } from '@/types'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const city = searchParams.get('city') as City | null
  const category = searchParams.get('category') as Category | null
  const year = searchParams.get('year')
  const month = searchParams.get('month')

  const events = await getEvents({
    ...(city && { city }),
    ...(category && { category }),
    ...(year && { year: parseInt(year) }),
    ...(month && { month: parseInt(month) }),
  })

  return NextResponse.json({
    data: events,
    meta: { count: events.length, generated_at: new Date().toISOString() },
  })
}
