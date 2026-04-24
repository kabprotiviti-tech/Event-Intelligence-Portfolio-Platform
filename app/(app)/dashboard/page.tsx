'use client'
import { useMemo } from 'react'
import { useFilters } from '@/context/FilterContext'
import { useDrill } from '@/context/DrillContext'
import { useEvents, useGaps, usePortfolio, useApprovedConcepts } from '@/lib/hooks'
import { CalendarHeatmap } from '@/components/dashboard/CalendarHeatmap'
import { GapInsightsPanel } from '@/components/dashboard/GapInsightsPanel'
import { DecisionSummary } from '@/components/dashboard/DecisionSummary'
import { WhatsChangedBanner } from '@/components/dashboard/WhatsChangedBanner'
import { AiInsightsPanel } from '@/components/ai/AiInsightsPanel'
import { StatCard } from '@/components/ui/StatCard'
import { TabNav } from '@/components/layout/TabNav'
import { Skeleton, ErrorFallback } from '@/components/system/states'
import type { City, CityGroup, EnrichedGapSlot, EventDecision, CreateDecision, PortfolioEvent } from '@/types'

const GROUP_FOCUS: Record<CityGroup, City> = {
  'Abu Dhabi': 'Abu Dhabi',
  'Dubai':     'Dubai',
  'GCC':       'Riyadh',
}

const GROUP_COMPARE: Record<CityGroup, City> = {
  'Abu Dhabi': 'Dubai',
  'Dubai':     'Abu Dhabi',
  'GCC':       'Dubai',
}

export default function DashboardPage() {
  const { cityGroup, category } = useFilters()
  const focusCity = GROUP_FOCUS[cityGroup]
  const compareCity = GROUP_COMPARE[cityGroup]

  const events    = useEvents({ city: focusCity, category, year: 2025 })
  const gaps      = useGaps({ cities: [focusCity], year: 2025, category })
  const portfolio = usePortfolio({ city: focusCity, category })
  const approved  = useApprovedConcepts()

  const report = gaps.reports[0] ?? null
  const bundle = portfolio.bundle

  const { open } = useDrill()

  // ── Drill openers ─────────────────────────────────────────

  const openAllEvents = () => {
    if (!bundle) return
    open({
      kind: 'events',
      eyebrow: `${cityGroup} · ${category === 'All' ? 'all categories' : category}`,
      title: `${bundle.events.length} events in scope`,
      events: bundle.events,
      sortHint: 'Sorted by date — source badges indicate provenance',
    })
  }

  const openTopScored = () => {
    if (!bundle) return
    const top = [...bundle.events].sort((a, b) => b.portfolio_score - a.portfolio_score)
    open({
      kind: 'events',
      eyebrow: 'Portfolio quality',
      title: `Events ranked by score`,
      events: top,
      sortHint: `Average ${bundle.summary.avg_portfolio_score.toFixed(1)}/10 · sorted highest to lowest`,
    })
  }

  const openAllGaps = () => {
    if (!report) return
    open({
      kind: 'gaps',
      eyebrow: `${focusCity} · 2025 calendar`,
      title: `${report.summary.total_gaps} gap slots detected`,
      gaps: report.slots.filter(s => s.severity !== 'Low'),
      compare: compareCity,
    })
  }

  const openConcepts = () => {
    if (!bundle) return
    open({
      kind: 'concepts',
      eyebrow: 'Gap-sourced opportunities',
      title: `${bundle.decisions.create.length} new opportunities`,
      concepts: bundle.decisions.create,
    })
  }

  const openCellFromHeatmap = (cell: { month: number; category: typeof category }) => {
    if (cell.category === 'All') return
    open({
      kind: 'cell',
      eyebrow: 'Calendar slot',
      title: `${monthLabel(cell.month)} · ${cell.category}`,
      month: cell.month,
      category: cell.category,
      compare: compareCity,
    })
  }

  const openCellFromGap = (gap: EnrichedGapSlot) => {
    open({
      kind: 'cell',
      eyebrow: 'Calendar slot',
      title: `${monthLabel(gap.month)} · ${gap.category}`,
      month: gap.month,
      category: gap.category,
      compare: compareCity,
    })
  }

  const openEventDecision = (d: EventDecision) => {
    const label = d.kind === 'fund' ? 'Fund' : d.kind === 'scale' ? 'Scale' : 'Drop'
    open({
      kind: 'event-decision',
      eyebrow: `${label} recommendation`,
      title: d.event.name,
      decision: d,
    })
  }

  const openCreateDecision = (d: CreateDecision) => {
    open({
      kind: 'create-decision',
      eyebrow: 'New opportunity',
      title: d.concept.title,
      decision: d,
    })
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      {/* What's changed since last visit — first thing the Director sees */}
      <WhatsChangedBanner
        bundle={bundle}
        gapReport={report}
        approvedConceptIds={Array.from(approved.ids)}
      />

      <TabNav />

      {/* KPI row — every card drillable */}
      <section aria-label="Key indicators" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {events.isLoading || portfolio.isLoading ? (
          <>
            <Skeleton height="h-[128px]" /><Skeleton height="h-[128px]" />
            <Skeleton height="h-[128px]" /><Skeleton height="h-[128px]" />
          </>
        ) : (
          <>
            <StatCard
              label={`${cityGroup} Events`}
              value={events.count}
              sub={`${category === 'All' ? 'All categories' : category} · 2025`}
              priority
              onClick={openAllEvents}
              clickHint="View events"
            />
            <StatCard
              label="Calendar Gaps"
              value={report?.summary.total_gaps ?? 0}
              sub="Weighted empty or light slots"
              onClick={openAllGaps}
              clickHint="View all gaps"
            />
            <StatCard
              label="Avg Portfolio Score"
              value={(bundle?.summary.avg_portfolio_score ?? 0).toFixed(1)}
              sub="Weighted formula · /10"
              onClick={openTopScored}
              clickHint="Rank by score"
            />
            <StatCard
              label="New Opportunities"
              value={bundle?.decisions.create.length ?? 0}
              sub="Critical gaps to source"
              onClick={openConcepts}
              clickHint="See opportunities"
            />
          </>
        )}
      </section>

      {/* Heatmap — cells clickable */}
      <section aria-label="Calendar heatmap" className="rounded-md border border-subtle bg-surface-card p-6">
        <header className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="text-h3 font-semibold text-fg-primary">
              {focusCity} Event Calendar — 2025
            </h2>
            <p className="text-meta text-fg-tertiary mt-0.5">Click any cell to see the events · weighted by impact</p>
          </div>
          <span className="text-eyebrow uppercase text-fg-tertiary">vs {compareCity}</span>
        </header>
        {gaps.error
          ? <ErrorFallback error={gaps.error} onRetry={() => gaps.mutate()} />
          : <CalendarHeatmap report={report} onCellClick={openCellFromHeatmap} />}
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <section aria-label="Top gap opportunities" className="rounded-md border border-subtle bg-surface-card p-6">
          <header className="flex items-baseline justify-between mb-4">
            <h2 className="text-h3 font-semibold text-fg-primary">Top Gap Opportunities</h2>
            <span className="text-eyebrow uppercase text-fg-tertiary">Click to drill</span>
          </header>
          {gaps.error
            ? <ErrorFallback error={gaps.error} onRetry={() => gaps.mutate()} />
            : <GapInsightsPanel report={report} onGapClick={openCellFromGap} />}
        </section>

        <section aria-label="Recommended actions" className="rounded-md border border-subtle bg-surface-card p-6">
          <header className="flex items-baseline justify-between mb-4">
            <h2 className="text-h3 font-semibold text-fg-primary">Recommended Actions</h2>
            <span className="text-eyebrow uppercase text-fg-tertiary">Click to explain</span>
          </header>
          {portfolio.error
            ? <ErrorFallback error={portfolio.error} onRetry={() => portfolio.mutate()} />
            : <DecisionSummary
                data={bundle?.decisions}
                onEventDecisionClick={openEventDecision}
                onCreateClick={openCreateDecision}
              />}
        </section>
      </div>

      {/* AI Insights — narrative layer */}
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

function monthLabel(n: number): string {
  return ['', 'January','February','March','April','May','June','July','August','September','October','November','December'][n]
}
