import { NextRequest, NextResponse } from 'next/server'
import { getEvents } from '@/lib/data-provider'
import { detectGaps } from '@/lib/gap-detector'
import { enrichGapReport } from '@/lib/gap-enricher'
import { buildPortfolio, simulateBudget } from '@/lib/scorer'
import { generateStrategicSummary } from '@/lib/ai/generators'
import { getBudget } from '@/lib/store/portfolio-store'
import type { City, Category } from '@/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * GET /api/ai/summary?city=Abu Dhabi&category=All
 * Returns a strategic summary based on current gaps + portfolio state.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const city     = (searchParams.get('city') ?? 'Abu Dhabi') as City
  const category = searchParams.get('category') as Category | null

  const all = await getEvents({ year: 2025 })
  const scoped = category ? all.filter(e => e.category === category) : all

  const rawReport = detectGaps(scoped, city, 2025)
  const enriched  = enrichGapReport(rawReport, scoped)

  const portfolio = simulateBudget(
    buildPortfolio(scoped.filter(e => e.city === city)),
    getBudget(),
  )

  const result = await generateStrategicSummary(enriched.slots, portfolio)
  return NextResponse.json({ data: result, meta: { generated_at: new Date().toISOString() } })
}
