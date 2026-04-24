import { NextRequest, NextResponse } from 'next/server'
import { getEvents } from '@/lib/data-provider'
import { buildPortfolio, simulateBudget } from '@/lib/scorer'
import { explainDecision } from '@/lib/ai/generators'
import { getBudget } from '@/lib/store/portfolio-store'
import { CURRENT_YEAR } from '@/lib/config'
import type { EventDecision } from '@/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 20

/**
 * POST /api/ai/explain
 * Body: { event_id: string, decision: 'fund'|'scale'|'drop' }
 *   — looks up the event in the current scored portfolio and narrates the decision
 * OR
 * Body: { event: PortfolioEvent, decision: 'fund'|'scale'|'drop' }
 *   — caller supplies the event object directly
 */
export async function POST(req: NextRequest) {
  let body: {
    event_id?: string
    event?: any
    decision?: EventDecision['kind']
  } = {}
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.decision || !['fund','scale','drop'].includes(body.decision)) {
    return NextResponse.json({ error: 'decision must be fund|scale|drop' }, { status: 400 })
  }

  let event = body.event
  if (!event && body.event_id) {
    const all = await getEvents({ year: CURRENT_YEAR })
    const scored = buildPortfolio(all)
    const withBudget = simulateBudget(scored, getBudget())
    event = withBudget.find(e => e.id === body.event_id)
    if (!event) return NextResponse.json({ error: 'event not found' }, { status: 404 })
  }
  if (!event) return NextResponse.json({ error: 'event or event_id required' }, { status: 400 })

  const result = await explainDecision(event, body.decision)
  return NextResponse.json({ data: result, meta: { generated_at: new Date().toISOString() } })
}
