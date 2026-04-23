import { NextRequest, NextResponse } from 'next/server'
import { getEvents } from '@/lib/data-provider'
import { detectGaps } from '@/lib/gap-detector'
import { generateRecommendations } from '@/lib/recommender'
import { getApprovedConceptIds } from '@/lib/store/portfolio-store'
import type { Category, City } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const year = parseInt(searchParams.get('year') ?? '2025')
  const limit = parseInt(searchParams.get('limit') ?? '6')
  const city = (searchParams.get('city') ?? 'Abu Dhabi') as City
  const category = searchParams.get('category') as Category | null

  const events = await getEvents({ year })
  const scoped = category ? events.filter(e => e.category === category) : events
  const report = detectGaps(scoped, city, year)

  const all = generateRecommendations(report, events, limit * 2)

  // Filter out concepts already approved (server-side) so the list stays
  // focused on open opportunities. Client still shows approved-state if
  // the concept re-appears from a later regen.
  const approved = new Set(getApprovedConceptIds())
  const concepts = all.filter(c => !approved.has(c.id)).slice(0, limit)

  return NextResponse.json({
    data: concepts,
    meta: {
      count: concepts.length,
      filtered_approved: all.length - concepts.length,
      generated_at: new Date().toISOString(),
    },
  })
}
