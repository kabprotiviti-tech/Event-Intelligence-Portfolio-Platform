'use client'
import { useFilters } from '@/context/FilterContext'
import { useChairmanBrief } from '@/lib/hooks'
import { PortfolioHealthCard } from '@/components/strategy/PortfolioHealthCard'
import { TrendStrip } from '@/components/strategy/TrendStrip'
import { KeyGapsList } from '@/components/strategy/KeyGapsList'
import { DecisionSummary } from '@/components/dashboard/DecisionSummary'
import { StrategicOutlookPanel } from '@/components/strategy/StrategicOutlookPanel'
import { FutureOpportunitiesGrid } from '@/components/strategy/FutureOpportunitiesGrid'
import { ScenarioComparisonPanel } from '@/components/strategy/ScenarioComparisonPanel'
import { Skeleton, ErrorFallback } from '@/components/system/states'
import type { City, CityGroup } from '@/types'

const GROUP_FOCUS: Record<CityGroup, City> = {
  'Abu Dhabi': 'Abu Dhabi',
  'Dubai':     'Dubai',
  'GCC':       'Riyadh',
}

export default function StrategyPage() {
  const { cityGroup } = useFilters()
  const focusCity = GROUP_FOCUS[cityGroup]

  const { brief, isLoading, error, mutate } = useChairmanBrief({ city: focusCity, horizon: 2 })

  if (error) {
    return (
      <div className="mx-auto max-w-[1400px]">
        <ErrorFallback error={error} onRetry={() => mutate()} />
      </div>
    )
  }

  if (isLoading || !brief) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-6">
        <Skeleton height="h-52" label="Loading Chairman brief" />
        <Skeleton height="h-28" />
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton height="h-80" /><Skeleton height="h-80" />
        </div>
        <Skeleton height="h-96" />
      </div>
    )
  }

  const generated = new Date(brief.generated_at).toLocaleString('en-GB', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      {/* Meta */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
        <div>
          <p className="text-eyebrow uppercase text-fg-tertiary">
            {brief.target_city} · 2025 Review
          </p>
          <h1 className="text-h2 font-semibold text-fg-primary mt-1">Chairman Brief</h1>
        </div>
        <p className="text-meta text-fg-tertiary">Generated {generated}</p>
      </header>

      {/* Section 1 — Portfolio Health */}
      <PortfolioHealthCard health={brief.portfolio_health} />

      {/* Trend strip — one-line intelligence read */}
      <TrendStrip trends={brief.trends} />

      {/* Section 2 + 3 — Key Gaps · Recommended Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <section
          aria-label="Key gaps"
          className="rounded-md border border-subtle bg-surface-card p-6"
        >
          <header className="flex items-baseline justify-between mb-4">
            <h2 className="text-h3 font-semibold text-fg-primary">Key Gaps</h2>
            <span className="text-eyebrow uppercase text-fg-tertiary">Top 5</span>
          </header>
          <KeyGapsList gaps={brief.key_gaps} />
        </section>

        <section
          aria-label="Recommended actions"
          className="rounded-md border border-subtle bg-surface-card p-6"
        >
          <header className="flex items-baseline justify-between mb-4">
            <h2 className="text-h3 font-semibold text-fg-primary">Recommended Actions</h2>
            <span className="text-eyebrow uppercase text-fg-tertiary">Fund · Scale · Drop · Create</span>
          </header>
          <DecisionSummary data={brief.recommended_actions} />
        </section>
      </div>

      {/* Section 4 — Strategic Outlook */}
      <StrategicOutlookPanel outlook={brief.strategic_outlook} />

      {/* Future opportunities — bridges outlook to action */}
      <section aria-label="Future opportunities" className="space-y-3">
        <header>
          <h2 className="text-h3 font-semibold text-fg-primary">Future Opportunities</h2>
          <p className="text-meta text-fg-tertiary mt-0.5">
            Where gaps, trends and competitive position converge
          </p>
        </header>
        <FutureOpportunitiesGrid opportunities={brief.future_opportunities} />
      </section>

      {/* Section 5 — Scenario Comparison */}
      <section aria-label="Scenario comparison" className="space-y-3">
        <header>
          <h2 className="text-h3 font-semibold text-fg-primary">Scenario Comparison</h2>
          <p className="text-meta text-fg-tertiary mt-0.5">
            3 preset strategies · same budget, different risk posture
          </p>
        </header>
        <ScenarioComparisonPanel data={brief.scenarios} />
      </section>
    </div>
  )
}
