import { NextRequest, NextResponse } from 'next/server'
import { getEvents } from '@/lib/data-provider'
import { detectGaps } from '@/lib/gap-detector'
import { enrichGapReport } from '@/lib/gap-enricher'
import {
  simulateScenario, compareScenarios, PRESET_SCENARIOS,
} from '@/lib/scenario-engine'
import { CURRENT_YEAR } from '@/lib/config'
import type { ScenarioConfig, City } from '@/types'

export const dynamic = 'force-dynamic'

/**
 * GET  /api/scenarios       → list preset scenario configs
 * POST /api/scenarios       → body: { scenarios: ScenarioConfig[], city? }
 *                             Returns a ScenarioComparison.
 */

export async function GET() {
  return NextResponse.json({
    data: PRESET_SCENARIOS,
    meta: { count: PRESET_SCENARIOS.length, generated_at: new Date().toISOString() },
  })
}

export async function POST(req: NextRequest) {
  let body: { scenarios?: ScenarioConfig[]; city?: City } = {}
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const configs = Array.isArray(body.scenarios) && body.scenarios.length
    ? body.scenarios
    : PRESET_SCENARIOS

  if (configs.length > 5) {
    return NextResponse.json({ error: 'At most 5 scenarios per comparison' }, { status: 400 })
  }

  const city = body.city ?? 'Abu Dhabi'
  const year = configs[0]?.year ?? CURRENT_YEAR

  const allEvents = await getEvents({ year })
  const rawReport = detectGaps(allEvents, city, year)
  const enriched = enrichGapReport(rawReport, allEvents)

  const results = configs.map(cfg => simulateScenario(cfg, allEvents, enriched.slots))
  const comparison = compareScenarios(results)

  return NextResponse.json({
    data: comparison,
    meta: { count: results.length, generated_at: new Date().toISOString() },
  })
}
