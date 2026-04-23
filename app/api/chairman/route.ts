import { NextRequest, NextResponse } from 'next/server'
import { getChairmanBrief } from '@/lib/chairman-brief'
import type { City } from '@/types'

export const dynamic = 'force-dynamic'

/**
 * GET /api/chairman
 * Query: city (default Abu Dhabi), horizon (years, default 2), year
 * Returns: full ChairmanBrief bundle — health, gaps, decisions, outlook,
 *          trends, future opportunities, 3 preset scenario comparison.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const targetCity = (searchParams.get('city') ?? 'Abu Dhabi') as City
  const horizonYears = parseInt(searchParams.get('horizon') ?? '2')
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined

  const brief = await getChairmanBrief({ targetCity, horizonYears, year })

  return NextResponse.json({
    data: brief,
    meta: { generated_at: brief.generated_at },
  })
}
