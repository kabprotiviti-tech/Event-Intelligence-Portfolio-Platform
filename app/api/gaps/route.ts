import { NextRequest, NextResponse } from 'next/server'
import { getEvents } from '@/lib/data-provider'
import { detectGaps } from '@/lib/gap-detector'
import { enrichGapReport } from '@/lib/gap-enricher'
import { getProposedEvents } from '@/lib/store/portfolio-store'
import type { City, Category } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const citiesParam = searchParams.get('cities') ?? 'Abu Dhabi,Dubai'
  const year = parseInt(searchParams.get('year') ?? '2025')
  const categoryParam = searchParams.get('category') as Category | null

  const cities = citiesParam.split(',').map(c => c.trim()) as City[]
  const base = await getEvents({ year })
  const all = [...base, ...getProposedEvents()]

  const scoped = categoryParam ? all.filter(e => e.category === categoryParam) : all
  const comparisonCities: City[] = Array.from(
    new Set<City>(['Abu Dhabi', 'Dubai', 'Riyadh', 'Doha'].filter(c => !cities.includes(c as City)) as City[])
  )

  const reports = cities.map(city => {
    const raw = detectGaps(scoped, city, year)
    return enrichGapReport(raw, scoped, comparisonCities)
  })

  return NextResponse.json({
    data: reports,
    meta: { count: reports.length, generated_at: new Date().toISOString() },
  })
}
