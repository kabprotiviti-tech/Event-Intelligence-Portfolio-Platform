import { NextRequest, NextResponse } from 'next/server'
import { getEvents } from '@/lib/data-provider'
import { buildPortfolio, simulateBudget } from '@/lib/scorer'
import type { Category, City } from '@/types'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const city = searchParams.get('city') as City | null
  const category = searchParams.get('category') as Category | null
  const budget = searchParams.get('budget')

  const events = await getEvents({
    ...(city && { city }),
    ...(category && { category }),
  })

  let portfolio = buildPortfolio(events)

  if (budget) {
    portfolio = simulateBudget(portfolio, parseInt(budget))
  }

  const summary = {
    total_events: portfolio.length,
    total_budget: portfolio.reduce((s, e) => s + (e.budget_allocated ?? 0), 0),
    avg_portfolio_score:
      Math.round((portfolio.reduce((s, e) => s + e.portfolio_score, 0) / portfolio.length) * 10) / 10,
    by_category: {
      Family: portfolio.filter(e => e.category === 'Family').length,
      Entertainment: portfolio.filter(e => e.category === 'Entertainment').length,
      Sports: portfolio.filter(e => e.category === 'Sports').length,
    },
    by_city: portfolio.reduce((acc, e) => {
      acc[e.city] = (acc[e.city] ?? 0) + 1
      return acc
    }, {} as Record<string, number>),
  }

  return NextResponse.json({
    data: { events: portfolio, summary },
    meta: { count: portfolio.length, generated_at: new Date().toISOString() },
  })
}
