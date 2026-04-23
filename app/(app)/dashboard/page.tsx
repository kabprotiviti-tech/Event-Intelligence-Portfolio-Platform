'use client'
import { useMemo } from 'react'
import { useFilters } from '@/context/FilterContext'
import { allEvents } from '@/data'
import { detectGaps } from '@/lib/gap-detector'
import { buildPortfolio } from '@/lib/scorer'
import { generateRecommendations } from '@/lib/recommender'
import { CalendarHeatmap } from '@/components/dashboard/CalendarHeatmap'
import { GapInsightsPanel } from '@/components/dashboard/GapInsightsPanel'
import { ConceptCard } from '@/components/concepts/ConceptCard'
import { StatCard } from '@/components/ui/StatCard'
import { TabNav } from '@/components/layout/TabNav'
import type { City, CityGroup } from '@/types'

const GROUP_CITIES: Record<CityGroup, City[]> = {
  'Abu Dhabi': ['Abu Dhabi'],
  'Dubai': ['Dubai'],
  'GCC': ['Riyadh', 'Doha', 'Muscat'],
}

export default function DashboardPage() {
  const { cityGroup, category } = useFilters()

  const { adReport, focusEvents, portfolio, concepts, focusCity } = useMemo(() => {
    const focusCity = GROUP_CITIES[cityGroup][0]
    const scoped = category === 'All'
      ? allEvents
      : allEvents.filter(e => e.category === category)

    const focusEvents = scoped.filter(e => GROUP_CITIES[cityGroup].includes(e.city))
    const adReport = detectGaps(scoped, focusCity, 2025)
    const portfolio = buildPortfolio(focusEvents)
    const concepts = generateRecommendations(adReport, allEvents, 3)

    return { adReport, focusEvents, portfolio, concepts, focusCity }
  }, [cityGroup, category])

  const avgScore = portfolio.length
    ? Math.round((portfolio.reduce((s, e) => s + e.portfolio_score, 0) / portfolio.length) * 10) / 10
    : 0

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto">
      {/* Category tabs */}
      <TabNav />

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={`${cityGroup} Events`} value={focusEvents.length} sub={`${category === 'All' ? 'All categories' : category} · 2025`} accent />
        <StatCard label="Calendar Gaps" value={adReport.summary.total_gaps} sub="Weighted empty/light slots" />
        <StatCard label="Avg Portfolio Score" value={`${avgScore}`} sub="Weighted formula · /10" />
        <StatCard label="Concepts Ready" value={concepts.length} sub="Generated from gaps" />
      </div>

      {/* Heatmap */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">{focusCity} Event Calendar — 2025</h2>
            <p className="text-xs text-slate-500 mt-0.5">Density by category & month</p>
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest">Weighted by impact</span>
        </div>
        <CalendarHeatmap report={adReport} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Top Gap Opportunities</h2>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Prioritized</span>
          </div>
          <GapInsightsPanel report={adReport} />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Recommended Concepts</h2>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Gap-sourced</span>
          </div>
          <div className="space-y-3">
            {concepts.length
              ? concepts.map(c => <ConceptCard key={c.id} concept={c} />)
              : <p className="text-xs text-slate-400">No concepts for this filter — adjust tabs to explore.</p>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
