import { NextRequest, NextResponse } from 'next/server'
import { getEvents } from '@/lib/data-provider'
import { detectGaps } from '@/lib/gap-detector'
import type { City } from '@/types'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const citiesParam = searchParams.get('cities') ?? 'Abu Dhabi,Dubai'
  const year = parseInt(searchParams.get('year') ?? '2025')

  const cities = citiesParam.split(',').map(c => c.trim()) as City[]
  const events = await getEvents({ year })

  const reports = cities.map(city => detectGaps(events, city, year))

  return NextResponse.json({
    data: reports,
    meta: { count: reports.length, generated_at: new Date().toISOString() },
  })
}
