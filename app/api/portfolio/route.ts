import { NextRequest, NextResponse } from 'next/server'
import { getEvents } from '@/lib/data-provider'
import { buildPortfolio, simulateBudget } from '@/lib/scorer'
import { computeDecisions } from '@/lib/decision-engine'
import {
  addProposedEventFromConcept, getBudget, getProposedEvents,
} from '@/lib/store/portfolio-store'
import type { Category, City, EventConcept, PortfolioEvent } from '@/types'

export const dynamic = 'force-dynamic'

/**
 * GET /api/portfolio
 * Query: city, category, budget (optional override)
 * Returns: { events, summary, decisions, budget }
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const city = searchParams.get('city') as City | null
  const category = searchParams.get('category') as Category | null
  const budgetParam = searchParams.get('budget')

  const base = await getEvents({
    ...(city && { city }),
    ...(category && { category }),
  })
  const proposed = getProposedEvents().filter(e => {
    if (city && e.city !== city) return false
    if (category && e.category !== category) return false
    return true
  })

  const budget = budgetParam ? parseInt(budgetParam) : getBudget()
  const combined = [...base, ...proposed]
  const scored = buildPortfolio(combined)
  // Mark proposed events explicitly
  const flagged: PortfolioEvent[] = scored.map(e =>
    e.id.startsWith('proposed-') ? { ...e, status: 'Proposed' } : e
  )

  const withBudget = simulateBudget(flagged, budget)
  const decisions = computeDecisions(withBudget)

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

/**
 * POST /api/portfolio
 * Body: { concept: EventConcept }
 * Action: create a Proposed event from the concept, persist to in-memory store.
 * Returns: the new event.
 */
export async function POST(req: NextRequest) {
  let body: { concept?: EventConcept } = {}
  try {
    body = await req.json()
  } catch {
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
