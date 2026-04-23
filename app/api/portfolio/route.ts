import { NextRequest, NextResponse } from 'next/server'
import { getEvents } from '@/lib/data-provider'
import { buildPortfolio, simulateBudget } from '@/lib/scorer'
import { detectGaps } from '@/lib/gap-detector'
import { enrichGapReport } from '@/lib/gap-enricher'
import { generateDecisions } from '@/lib/decision-engine'
import {
  addProposedEventFromConcept, getBudget, getProposedEvents,
} from '@/lib/store/portfolio-store'
import type { Category, City, EventConcept, PortfolioEvent } from '@/types'

export const dynamic = 'force-dynamic'

/**
 * GET /api/portfolio
 * Returns: { events, summary, decisions, budget }
 *
 * Category filter narrows the portfolio scope (shown events) but does NOT
 * prune the gap detection dataset — otherwise gap counts inflate artificially.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const city = (searchParams.get('city') ?? 'Abu Dhabi') as City
  const category = searchParams.get('category') as Category | null
  const budgetParam = searchParams.get('budget')

  // Full dataset — used for competition signal + unfiltered gap detection
  const allEvents = await getEvents({ year: 2025 })

  // Scoped portfolio (what appears in the table / rankings)
  const scoped = allEvents.filter(e => {
    if (city && e.city !== city) return false
    if (category && e.category !== category) return false
    return true
  })
  const proposed = getProposedEvents().filter(e => {
    if (city && e.city !== city) return false
    if (category && e.category !== category) return false
    return true
  })

  const budget = budgetParam ? parseInt(budgetParam) : getBudget()
  const combined = [...scoped, ...proposed]
  const scored = buildPortfolio(combined)
  const flagged: PortfolioEvent[] = scored.map(e =>
    e.id.startsWith('proposed-') ? { ...e, status: 'Proposed' } : e
  )
  const withBudget = simulateBudget(flagged, budget)

  // Gap detection uses the FULL event set (not category-filtered) so
  // the gap counts don't inflate. Then we narrow slots for the decision
  // engine if a category filter is active.
  const rawGaps = detectGaps(allEvents, city, 2025)
  const enriched = enrichGapReport(rawGaps, allEvents)
  const gapSlots = category
    ? enriched.slots.filter(s => s.category === category)
    : enriched.slots

  const decisions = generateDecisions({
    events: withBudget,
    allEvents,
    gaps: gapSlots,
    budget,
    targetCity: city,
    comparisonCity: city === 'Abu Dhabi' ? 'Dubai' : 'Abu Dhabi',
  })

  const summary = {
    total_events: withBudget.length,
    total_budget: withBudget.reduce((s, e) => s + (e.budget_allocated ?? 0), 0),
    avg_portfolio_score: withBudget.length
      ? Math.round((withBudget.reduce((s, e) => s + e.portfolio_score, 0) / withBudget.length) * 10) / 10
      : 0,
    by_category: {
      Family:        withBudget.filter(e => e.category === 'Family').length,
      Entertainment: withBudget.filter(e => e.category === 'Entertainment').length,
      Sports:        withBudget.filter(e => e.category === 'Sports').length,
    },
    by_city: withBudget.reduce((acc, e) => {
      acc[e.city] = (acc[e.city] ?? 0) + 1
      return acc
    }, {} as Record<string, number>),
  }

  return NextResponse.json({
    data: { events: withBudget, summary, decisions, budget },
    meta: { count: withBudget.length, generated_at: new Date().toISOString() },
  })
}

export async function POST(req: NextRequest) {
  let body: { concept?: EventConcept } = {}
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  if (!body.concept || !body.concept.id || !body.concept.title) {
    return NextResponse.json({ error: 'Missing concept' }, { status: 400 })
  }
  const event = addProposedEventFromConcept(body.concept)
  return NextResponse.json({
    data: event,
    meta: { generated_at: new Date().toISOString() },
  }, { status: 201 })
}
