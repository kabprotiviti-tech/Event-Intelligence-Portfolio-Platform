import { NextRequest, NextResponse } from 'next/server'
import { setBudget } from '@/lib/store/portfolio-store'

export const dynamic = 'force-dynamic'

/**
 * POST /api/portfolio/simulate
 * Body: { budget: number }
 * Persists budget to the in-memory store and returns the normalized value.
 * The portfolio GET endpoint then picks up the new budget automatically.
 */
export async function POST(req: NextRequest) {
  let body: { budget?: number } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (typeof body.budget !== 'number' || Number.isNaN(body.budget)) {
    return NextResponse.json({ error: 'budget must be a number' }, { status: 400 })
  }

  const budget = setBudget(body.budget)
  return NextResponse.json({
    data: { budget },
    meta: { generated_at: new Date().toISOString() },
  })
}
