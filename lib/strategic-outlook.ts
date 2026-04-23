/**
 * Strategic outlook — 12–36 month horizon projection.
 *
 * Simple projection logic: use the event stream grouped by year to compute
 * year-by-year category mix, gap counts, and competitive position.
 *
 * For years beyond the dataset, the outlook is labeled "projected" and
 * extrapolates from the nearest real year's category mix.
 */

import type {
  Category, City, Event, StrategicOutlook, YearlyOutlook, CompetitivePosition,
  CompetitiveGap, UnderdevelopedCategory,
} from '@/types'
import { detectGaps } from './gap-detector'

const CATEGORIES: Category[] = ['Family', 'Entertainment', 'Sports']

export function getStrategicOutlook(
  events: Event[],
  targetCity: City = 'Abu Dhabi',
  comparisonCity: City = 'Dubai',
  horizonYears = 2,
): StrategicOutlook {
  const startYear = new Date().getFullYear()
  const yearly: YearlyOutlook[] = []

  for (let offset = 0; offset < horizonYears; offset++) {
    yearly.push(buildYearlyOutlook(events, targetCity, comparisonCity, startYear + offset))
  }

  const underdeveloped_categories = findUnderdeveloped(yearly)
  const competitive_gaps = findCompetitiveGaps(events, targetCity, comparisonCity)
  const long_term_recommendations = buildLongTermRecs(
    underdeveloped_categories, competitive_gaps, yearly, comparisonCity
  )

  return {
    horizon_years: horizonYears,
    yearly,
    underdeveloped_categories,
    competitive_gaps,
    long_term_recommendations,
  }
}

// ─── Per-year outlook ───────────────────────────────────────

function buildYearlyOutlook(
  events: Event[], targetCity: City, comparisonCity: City, year: number,
): YearlyOutlook {
  const yearEvents = events.filter(e => new Date(e.start_date).getFullYear() === year)
  const target = yearEvents.filter(e => e.city === targetCity)
  const comp = yearEvents.filter(e => e.city === comparisonCity)

  const category_mix = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = target.filter(e => e.category === cat).length
    return acc
  }, {} as Record<Category, number>)

  // Project forward when no data: copy nearest year's mix, scale by trend
  const projected_events = target.length > 0
    ? target.length
    : estimateProjected(events, targetCity, year)

  const gap_report = detectGaps(events.filter(e => e.city === targetCity), targetCity, year)
  const gap_count = gap_report.summary.total_gaps

  const competitive_position: CompetitivePosition =
    target.length >= comp.length * 0.9 ? 'leading'
  : target.length >= comp.length * 0.6 ? 'matching'
  :                                      'lagging'

  return { year, projected_events, category_mix, gap_count, competitive_position }
}

function estimateProjected(events: Event[], city: City, year: number): number {
  // Take nearest past year's count and extrapolate with a 5% growth assumption
  const years = Array.from(new Set(events
    .filter(e => e.city === city)
    .map(e => new Date(e.start_date).getFullYear())))
  if (years.length === 0) return 0
  const nearest = years.reduce((best, y) => Math.abs(y - year) < Math.abs(best - year) ? y : best, years[0])
  const base = events.filter(e => e.city === city && new Date(e.start_date).getFullYear() === nearest).length
  const yearsFromNearest = Math.max(1, year - nearest)
  return Math.round(base * Math.pow(1.05, yearsFromNearest))
}

// ─── Underdeveloped categories ──────────────────────────────

function findUnderdeveloped(years: YearlyOutlook[]): UnderdevelopedCategory[] {
  const out: UnderdevelopedCategory[] = []

  for (const cat of CATEGORIES) {
    const shares = years.map(y => {
      const total = y.category_mix.Family + y.category_mix.Entertainment + y.category_mix.Sports
      return total > 0 ? y.category_mix[cat] / total : 0
    })
    const avg = shares.reduce((s, n) => s + n, 0) / Math.max(1, shares.length)
    const pct = Math.round(avg * 100)

    if (avg < 0.25) {
      const severity = avg < 0.15 ? 'High' : 'Medium'
      out.push({
        category: cat,
        avg_share_pct: pct,
        severity,
        reason: `${cat} averages only ${pct}% of portfolio across the horizon.`,
      })
    }
  }

  return out
}

// ─── Competitive gaps ───────────────────────────────────────

function findCompetitiveGaps(events: Event[], targetCity: City, comparisonCity: City): CompetitiveGap[] {
  const gaps: CompetitiveGap[] = []
  const year = new Date().getFullYear()

  for (let m = 1; m <= 12; m++) {
    for (const cat of CATEGORIES) {
      const own = events.filter(e =>
        e.city === targetCity && e.category === cat &&
        new Date(e.start_date).getMonth() + 1 === m &&
        new Date(e.start_date).getFullYear() === year
      ).length
      const other = events.filter(e =>
        e.city === comparisonCity && e.category === cat &&
        new Date(e.start_date).getMonth() + 1 === m &&
        new Date(e.start_date).getFullYear() === year
      ).length
      if (other > own) {
        gaps.push({ city: comparisonCity, month: m, category: cat, their_lead: other - own })
      }
    }
  }

  // Top 5 by lead size
  return gaps.sort((a, b) => b.their_lead - a.their_lead).slice(0, 5)
}

// ─── Long-term recommendations ──────────────────────────────

function buildLongTermRecs(
  underdev: UnderdevelopedCategory[],
  compGaps: CompetitiveGap[],
  years: YearlyOutlook[],
  comparisonCity: City,
): string[] {
  const recs: string[] = []

  for (const u of underdev.filter(u => u.severity === 'High').slice(0, 2)) {
    recs.push(
      `Rebuild ${u.category} programming — share is only ${u.avg_share_pct}% and trending structural. Target 3–5 new events over 24 months.`
    )
  }

  // Cluster competitive gaps by category
  const byCat = new Map<Category, CompetitiveGap[]>()
  for (const g of compGaps) {
    if (!byCat.has(g.category)) byCat.set(g.category, [])
    byCat.get(g.category)!.push(g)
  }
  for (const [cat, gapList] of byCat) {
    const totalLead = gapList.reduce((s, g) => s + g.their_lead, 0)
    if (totalLead >= 3) {
      recs.push(
        `Close ${totalLead}-event ${cat} lead vs ${comparisonCity} — prioritize new programming in months ${gapList.map(g => g.month).join(', ')}.`
      )
    }
  }

  // Trajectory
  const lagging = years.filter(y => y.competitive_position === 'lagging').length
  if (lagging === years.length) {
    recs.push(`Abu Dhabi is lagging ${comparisonCity} in every horizon year — escalate to strategic-level intervention.`)
  }

  if (recs.length === 0) {
    recs.push('Portfolio is well-positioned across the horizon. Focus on quality uplift within existing categories.')
  }

  return recs.slice(0, 4)
}
