import { NextRequest, NextResponse } from 'next/server'
import { getEvents } from '@/lib/data-provider'
import { detectGaps } from '@/lib/gap-detector'
import { generateRecommendations } from '@/lib/recommender'
import { computeCategoryTrends } from '@/lib/trend-analyzer'
import { getApprovedConceptIds } from '@/lib/store/portfolio-store'
import type { Category, City } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const year = parseInt(searchParams.get('year') ?? '2025')
  const limit = parseInt(searchParams.get('limit') ?? '6')
  const city = (searchParams.get('city') ?? 'Abu Dhabi') as City
  const category = searchParams.get('category') as Category | null

  // Run gap detection on the FULL event set; narrow the returned slots
  // to the active category (if any) after the fact so gap counts reflect
  // reality and not a side-effect of filtering.
  const events = await getEvents({ year })
  const fullReport = detectGaps(events, city, year)
  const report = category
    ? { ...fullReport, slots: fullReport.slots.filter(s => s.category === category) }
    : fullReport

  const trends = computeCategoryTrends(events)
  const all = generateRecommendations(report, events, { limit: limit * 2, trends })

  const approved = new Set(getApprovedConceptIds())
  const concepts = all.filter(c => !approved.has(c.id)).slice(0, limit)

  return NextResponse.json({
    data: concepts,
    meta: {
      count: concepts.length,
      filtered_approved: all.length - concepts.length,
      trend_signal: {
        Family:        round(trends.Family),
        Entertainment: round(trends.Entertainment),
        Sports:        round(trends.Sports),
      },
      generated_at: new Date().toISOString(),
    },
  })
}

function round(n: number) {
  return Math.round(n * 10) / 10
}
