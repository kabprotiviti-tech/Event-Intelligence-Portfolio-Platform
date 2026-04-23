import { NextRequest, NextResponse } from 'next/server'
import { getEvents } from '@/lib/data-provider'
import { detectGaps } from '@/lib/gap-detector'
import { generateRecommendations } from '@/lib/recommender'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const year = parseInt(searchParams.get('year') ?? '2025')
  const limit = parseInt(searchParams.get('limit') ?? '6')

  const events = await getEvents({ year })
  const adReport = detectGaps(events, 'Abu Dhabi', year)

  const concepts = generateRecommendations(adReport, events, limit)

  return NextResponse.json({
    data: concepts,
    meta: { count: concepts.length, generated_at: new Date().toISOString() },
  })
}
