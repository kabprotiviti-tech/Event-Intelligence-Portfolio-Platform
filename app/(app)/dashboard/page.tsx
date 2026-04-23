'use client'
import { useFilters } from '@/context/FilterContext'
import { useEvents, useGaps, usePortfolio } from '@/lib/hooks'
import { CalendarHeatmap } from '@/components/dashboard/CalendarHeatmap'
import { GapInsightsPanel } from '@/components/dashboard/GapInsightsPanel'
import { DecisionSummary } from '@/components/dashboard/DecisionSummary'
import { AiInsightsPanel } from '@/components/ai/AiInsightsPanel'
import { StatCard } from '@/components/ui/StatCard'
import { TabNav } from '@/components/layout/TabNav'
import { Skeleton, ErrorFallback } from '@/components/system/states'
import type { City, CityGroup } from '@/types'

const GROUP_FOCUS: Record<CityGroup, City> = {
  'Abu Dhabi': 'Abu Dhabi',
  'Dubai':     'Dubai',
  'GCC':       'Riyadh',
}

export default function DashboardPage() {
  const { cityGroup, category } = useFilters()
  const focusCity = GROUP_FOCUS[cityGroup]

  const events      = useEvents({ city: focusCity, category, year: 2025 })
  const gaps        = useGaps({ cities: [focusCity], year: 2025, category })
  const portfolio   = usePortfolio({ city: focusCity, category })

  const report = gaps.reports[0] ?? null
  const bundle = portfolio.bundle

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <TabNav />

      {/* KPI row */}
      <section aria-label="Key indicators" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {events.isLoading || portfolio.isLoading ? (
          <>
            <Skeleton height="h-[104px]" /><Skeleton height="h-[104px]" />
            <Skeleton height="h-[104px]" /><Skeleton height="h-[104px]" />
          </>
        ) : (
          <>
            <StatCard label={`${cityGroup} Events`} value={events.count}
              sub={`${category === 'All' ? 'All categories' : category} · 2025`} priority />
            <StatCard label="Calendar Gaps" value={report?.summary.total_gaps ?? 0}
              sub="Weighted empty or light slots" />
            <StatCard label="Avg Portfolio Score" value={(bundle?.summary.avg_portfolio_score ?? 0).toFixed(1)}
              sub="Weighted formula · /10" />
            <StatCard label="New Opportunities" value={bundle?.decisions.create.length ?? 0}
              sub="Critical gaps to source" />
          </>
        )}
      </section>

      {/* Heatmap */}
      <section aria-label="Calendar heatmap" className="rounded-md border border-subtle bg-surface-card p-6">
        <header className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="text-h3 font-semibold text-fg-primary">
              {focusCity} Event Calendar — 2025
            </h2>
            <p className="text-meta text-fg-tertiary mt-0.5">Density by category and month</p>
          </div>
          <span className="text-eyebrow uppercase text-fg-tertiary">Weighted by impact</span>
        </header>
        {gaps.error
          ? <ErrorFallback error={gaps.error} onRetry={() => gaps.mutate()} />
          : <CalendarHeatmap report={report} />}
      </section>

      {/* Split: gaps + recommendations */}
      <div className="grid lg:grid-cols-2 gap-6">
        <section aria-label="Top gap opportunities" className="rounded-md border border-subtle bg-surface-card p-6">
          <header className="flex items-baseline justify-between mb-4">
            <h2 className="text-h3 font-semibold text-fg-primary">Top Gap Opportunities</h2>
            <span className="text-eyebrow uppercase text-fg-tertiary">Prioritized</span>
          </header>
          {gaps.error
            ? <ErrorFallback error={gaps.error} onRetry={() => gaps.mutate()} />
            : <GapInsightsPanel report={report} />}
        </section>

        <section aria-label="Recommended actions" className="rounded-md border border-subtle bg-surface-card p-6">
          <header className="flex items-baseline justify-between mb-4">
            <h2 className="text-h3 font-semibold text-fg-primary">Recommended Actions</h2>
            <span className="text-eyebrow uppercase text-fg-tertiary">Director view</span>
          </header>
          {portfolio.error
            ? <ErrorFallback error={portfolio.error} onRetry={() => portfolio.mutate()} />
            : <DecisionSummary data={bundle?.decisions} />}
        </section>
      </div>

      {/* AI Insights — narrative layer over the rules engine */}
      <section aria-label="AI insights" className="rounded-md border border-subtle bg-surface-card p-6">
        <header className="flex items-baseline justify-between mb-5">
          <div>
            <h2 className="text-h3 font-semibold text-fg-primary">AI Insights</h2>
            <p className="text-meta text-fg-tertiary mt-0.5">
              Claude narrative · falls back to rules when unavailable
            </p>
          </div>
          <span className="text-eyebrow uppercase text-fg-tertiary">Strategy · Trends</span>
        </header>
        <AiInsightsPanel city={focusCity} category={category} />
      </section>
    </div>
  )
}
