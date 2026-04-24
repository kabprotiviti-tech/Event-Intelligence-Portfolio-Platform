import { NextRequest, NextResponse } from 'next/server'
import { getEvents } from '@/lib/data-provider'
import { detectGaps } from '@/lib/gap-detector'
import { enrichGapReport } from '@/lib/gap-enricher'
import { generateEventConcept } from '@/lib/ai/generators'
import { CURRENT_YEAR } from '@/lib/config'
import type { City, Category } from '@/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 20  // Vercel serverless cap bumped — AI calls can take a few seconds

/**
 * POST /api/ai/concepts
 * Body: { city?, month?, category? } — targets a specific gap
 *    OR { gap: EnrichedGapSlot } — caller supplies the gap directly
 *
 * Returns: AiResult<AiConceptPayload>
 */
export async function POST(req: NextRequest) {
  let body: {
    city?: City
    month?: number
    category?: Category
    gap?: any
  } = {}
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  let gap = body.gap
  if (!gap) {
    // Derive from (city, month, category) — useful when a UI component has
    // only the context and wants the matching enriched gap slot.
    const city = body.city ?? 'Abu Dhabi'
    const events = await getEvents({ year: CURRENT_YEAR })
    const report = detectGaps(events, city, CURRENT_YEAR)
    const enriched = enrichGapReport(report, events)
    gap = enriched.slots.find(s =>
      (!body.month    || s.month    === body.month) &&
      (!body.category || s.category === body.category)
    )
    if (!gap) {
      return NextResponse.json({ error: 'No matching gap slot' }, { status: 404 })
    }
  }

  const result = await generateEventConcept(gap)
  return NextResponse.json({ data: result, meta: { generated_at: new Date().toISOString() } })
}
