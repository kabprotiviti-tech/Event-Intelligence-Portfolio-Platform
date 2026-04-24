import { NextRequest, NextResponse } from 'next/server'
import { getEvents } from '@/lib/data-provider'
import { detectGaps } from '@/lib/gap-detector'
import { enrichGapReport } from '@/lib/gap-enricher'
import { getProposedEvents } from '@/lib/store/portfolio-store'
import { CURRENT_YEAR } from '@/lib/config'
import type { City, Category, EnrichedGapReport, GapSeverity } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const citiesParam = searchParams.get('cities') ?? 'Abu Dhabi,Dubai'
  const year = parseInt(searchParams.get('year') ?? String(CURRENT_YEAR))
  const categoryParam = searchParams.get('category') as Category | null

  const cities = citiesParam.split(',').map(c => c.trim()) as City[]
  const base = await getEvents({ year })
  const all = [...base, ...getProposedEvents()]

  // NOTE: do NOT pre-filter events by category before detectGaps — that
  // leaves empty slots in other categories and inflates total_gaps.
  // detectGaps runs over the full event set; we filter returned slots after.
  const comparisonCities: City[] = ['Abu Dhabi', 'Dubai', 'Riyadh', 'Doha']
    .filter(c => !cities.includes(c as City)) as City[]

  const reports = cities.map(city => {
    const raw = detectGaps(all, city, year)
    const enriched = enrichGapReport(raw, all, comparisonCities)
    return categoryParam ? scopeByCategory(enriched, categoryParam) : enriched
  })

  return NextResponse.json({
    data: reports,
    meta: { count: reports.length, generated_at: new Date().toISOString() },
  })
}

/**
 * Narrow a gap report to a single category and rebuild summary metrics
 * from that narrower slice — so the "Calendar Gaps: N" number the
 * dashboard shows always matches what the matrix renders.
 */
function scopeByCategory(report: EnrichedGapReport, category: Category): EnrichedGapReport {
  const slots = report.slots.filter(s => s.category === category)
  const emptySlots = slots.filter(s => s.severity !== 'Low')

  // Emptiest month within the category scope
  const monthTotals: Record<number, number> = {}
  for (const s of slots) monthTotals[s.month] = (monthTotals[s.month] ?? 0) + s.weighted_density
  const emptiestMonth = Object.entries(monthTotals)
    .sort((a, b) => a[1] - b[1])[0]?.[0]
  const emptiest_month = emptiestMonth ? parseInt(emptiestMonth) : report.summary.emptiest_month

  return {
    ...report,
    slots,
    summary: {
      emptiest_month,
      emptiest_category: category,
      total_gaps: emptySlots.length,
    },
  }
}
