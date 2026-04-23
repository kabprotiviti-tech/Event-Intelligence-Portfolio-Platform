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
  'Dubai':     ['Dubai'],
  'GCC':       ['Riyadh', 'Doha', 'Muscat'],
}

export default function DashboardPage() {
  const { cityGroup, category } = useFilters()

  const data = useMemo(() => {
    const focusCity = GROUP_CITIES[cityGroup][0]
    const scoped = category === 'All' ? allEvents : allEvents.filter(e => e.category === category)
    const focusEvents = scoped.filter(e => GROUP_CITIES[cityGroup].includes(e.city))
    const adReport = detectGaps(scoped, focusCity, 2025)
    const portfolio = buildPortfolio(focusEvents)
    const concepts = generateRecommendations(adReport, allEvents, 3)
    return { focusCity, focusEvents, adReport, portfolio, concepts }
  }, [cityGroup, category])

  const avgScore = data.portfolio.length
    ? Math.round((data.portfolio.reduce((s, e) => s + e.portfolio_score, 0) / data.portfolio.length) * 10) / 10
    : 0

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <TabNav />

      <section aria-label="Key indicators" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={`${cityGroup} Events`}
          value={data.focusEvents.length}
          sub={`${category === 'All' ? 'All categories' : category} · 2025`}
          priority
        />
        <StatCard
          label="Calendar Gaps"
          value={data.adReport.summary.total_gaps}
          sub="Weighted empty or light slots"
        />
        <StatCard
          label="Avg Portfolio Score"
          value={avgScore.toFixed(1)}
          sub="Weighted formula · /10"
        />
        <StatCard
          label="Concepts Ready"
          value={data.concepts.length}
          sub="Generated from gaps"
        />
      </section>

      <section aria-label="Calendar heatmap" className="rounded-md border border-subtle bg-surface-card p-6">
        <header className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="text-h3 font-semibold text-fg-primary">
              {data.focusCity} Event Calendar — 2025
            </h2>
            <p className="text-meta text-fg-tertiary mt-0.5">Density by category and month</p>
          </div>
          <span className="text-eyebrow uppercase text-fg-tertiary">Weighted by impact</span>
        </header>
        <CalendarHeatmap report={data.adReport} />
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <section aria-label="Top gap opportunities" className="rounded-md border border-subtle bg-surface-card p-6">
          <header className="flex items-baseline justify-between mb-4">
            <h2 className="text-h3 font-semibold text-fg-primary">Top Gap Opportunities</h2>
            <span className="text-eyebrow uppercase text-fg-tertiary">Prioritized</span>
          </header>
          <GapInsightsPanel report={data.adReport} />
        </section>

        <section aria-label="Recommended concepts" className="rounded-md border border-subtle bg-surface-card p-6">
          <header className="flex items-baseline justify-between mb-4">
            <h2 className="text-h3 font-semibold text-fg-primary">Recommended Concepts</h2>
            <span className="text-eyebrow uppercase text-fg-tertiary">Gap-sourced</span>
          </header>
          {data.concepts.length === 0 ? (
            <p className="text-body-sm text-fg-tertiary">No concepts for this filter — adjust the tabs to explore.</p>
          ) : (
            <div className="space-y-3">
              {data.concepts.map(c => <ConceptCard key={c.id} concept={c} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
