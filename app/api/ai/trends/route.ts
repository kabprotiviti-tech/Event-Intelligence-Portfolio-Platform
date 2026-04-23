import { NextRequest, NextResponse } from 'next/server'
import { getEvents } from '@/lib/data-provider'
import { getTrendSignals } from '@/lib/trend-intelligence'
import { analyzeTrends } from '@/lib/ai/generators'

export const dynamic = 'force-dynamic'
export const maxDuration = 20

/**
 * GET /api/ai/trends
 * Pulls pre-computed trend signals, then asks Claude for narrative synthesis.
 * Returns: AiResult<AiTrendsPayload>
 */
export async function GET(_req: NextRequest) {
  const all = await getEvents({ year: 2025 })
  const trends = getTrendSignals(all)

  const titles = all
    .filter(e => e.source_type === 'news' || e.source_type === 'marketplace')
    .slice(0, 30)
    .map(e => e.name)

  const result = await analyzeTrends(trends, titles)
  return NextResponse.json({
    data: result,
    meta: { generated_at: new Date().toISOString(), signal_count: trends.signals.length },
  })
}
