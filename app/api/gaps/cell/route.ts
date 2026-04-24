import { NextRequest, NextResponse } from 'next/server'
import { getEvents } from '@/lib/data-provider'
import { getCellEvents, competitiveSignalFor } from '@/lib/gap-detail'
import { CURRENT_YEAR } from '@/lib/config'
import type { Category, City } from '@/types'

export const dynamic = 'force-dynamic'

/**
 * GET /api/gaps/cell?month=&category=&compare=
 *   month:    1-12
 *   category: Family | Entertainment | Sports
 *   compare:  Dubai | Riyadh | Doha  (defaults to Dubai)
 *
 * Returns the events that populate the cell in Abu Dhabi + the comparison
 * city, with a competitive signal narrative for the drill-down UI.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const month = parseInt(searchParams.get('month') ?? '0')
  const category = searchParams.get('category') as Category | null
  const compare = (searchParams.get('compare') ?? 'Dubai') as City
  const year = parseInt(searchParams.get('year') ?? String(CURRENT_YEAR))

  if (!month || month < 1 || month > 12) {
    return NextResponse.json({ error: 'month must be 1-12' }, { status: 400 })
  }
  if (!category || !['Family','Entertainment','Sports'].includes(category)) {
    return NextResponse.json({ error: 'category required' }, { status: 400 })
  }

  const all = await getEvents({ year })
  const adEvents   = getCellEvents(all, 'Abu Dhabi', month, category, year)
  const compEvents = getCellEvents(all, compare,     month, category, year)

  const signal = competitiveSignalFor(adEvents, compEvents, month, category, compare)

  return NextResponse.json({
    data: {
      month, category, year,
      ad_city: 'Abu Dhabi',
      comparison_city: compare,
      ad_events: adEvents,
      comp_events: compEvents,
      signal,
    },
    meta: { generated_at: new Date().toISOString() },
  })
}
