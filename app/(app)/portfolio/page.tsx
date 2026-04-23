'use client'
import { useEffect, useRef, useState } from 'react'
import { useFilters } from '@/context/FilterContext'
import { usePortfolio, updateBudget } from '@/lib/hooks'
import { PortfolioTable } from '@/components/portfolio/PortfolioTable'
import { DecisionPanel } from '@/components/portfolio/DecisionPanel'
import { TabNav } from '@/components/layout/TabNav'
import { Skeleton, ErrorFallback } from '@/components/system/states'
import type { City, CityGroup } from '@/types'

const GROUP_FOCUS: Record<CityGroup, City> = {
  'Abu Dhabi': 'Abu Dhabi',
  'Dubai':     'Dubai',
  'GCC':       'Riyadh',
}

const MIN_BUDGET = 50_000_000
const MAX_BUDGET = 1_000_000_000

export default function PortfolioPage() {
  const { cityGroup, category } = useFilters()
  const focusCity = GROUP_FOCUS[cityGroup]

  const { bundle, isLoading, error, mutate } = usePortfolio({ city: focusCity, category })

  // Local slider state synced with server budget. Debounced POST on change.
  const [localBudget, setLocalBudget] = useState<number>(bundle?.budget ?? 250_000_000)
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (bundle?.budget && !pending.current) {
      setLocalBudget(bundle.budget)
    }
  }, [bundle?.budget])

  function onBudgetChange(next: number) {
    setLocalBudget(next)
    if (pending.current) clearTimeout(pending.current)
    pending.current = setTimeout(async () => {
      pending.current = null
      try {
        await updateBudget(next)
      } catch { /* toast future */ }
    }, 350)
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <TabNav />

      {/* Budget simulator */}
      <section aria-label="Budget simulator" className="rounded-md border border-subtle bg-surface-card p-6">
        <header className="flex items-baseline justify-between mb-5">
          <div>
            <h2 className="text-h3 font-semibold text-fg-primary">Budget Simulator</h2>
            <p className="text-meta text-fg-tertiary mt-0.5">
              Persists across sessions · re-allocates weighted by portfolio score
            </p>
          </div>
          <div className="text-right">
            <p className="text-eyebrow uppercase text-fg-tertiary">Total</p>
            <p className="text-h1 font-semibold text-fg-primary tnum" data-tabular>
              AED {(localBudget / 1_000_000).toFixed(0)}M
            </p>
          </div>
        </header>

        <label htmlFor="budget-slider" className="sr-only">Total budget</label>
        <input
          id="budget-slider"
          type="range"
          min={MIN_BUDGET}
          max={MAX_BUDGET}
          step={10_000_000}
          value={localBudget}
          onChange={e => onBudgetChange(parseInt(e.target.value))}
          className="w-full h-1 bg-surface-inset rounded-sm appearance-none cursor-pointer"
          aria-valuemin={MIN_BUDGET}
          aria-valuemax={MAX_BUDGET}
          aria-valuenow={localBudget}
          aria-valuetext={`AED ${(localBudget / 1_000_000).toFixed(0)} million`}
        />
        <div className="flex justify-between text-eyebrow uppercase text-fg-tertiary mt-2 tnum" data-tabular>
          <span>AED 50M</span>
          <span>AED 500M</span>
          <span>AED 1B</span>
        </div>

        <dl className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-subtle">
          <SmallStat term="Events in scope" def={bundle?.summary.total_events.toString() ?? '—'} />
          <SmallStat term="Allocated"       def={bundle ? `AED ${(bundle.summary.total_budget / 1_000_000).toFixed(0)}M` : '—'} />
          <SmallStat term="Avg score"       def={bundle ? `${bundle.summary.avg_portfolio_score.toFixed(1)} / 10` : '—'} />
        </dl>
      </section>

      {/* Decision panel — the Director view */}
      <section aria-label="Recommended actions" className="space-y-3">
        <header>
          <h2 className="text-h3 font-semibold text-fg-primary">Recommended Actions</h2>
          <p className="text-meta text-fg-tertiary mt-0.5">
            Fund where the signal is strong. Scale where upside is underfunded. Drop what the numbers can't defend.
          </p>
        </header>
        {error
          ? <ErrorFallback error={error} onRetry={() => mutate()} />
          : <DecisionPanel data={bundle?.decisions} />}
      </section>

      {/* Full table */}
      <section aria-label="Portfolio table" className="rounded-md border border-subtle bg-surface-card p-6">
        <header className="flex items-baseline justify-between mb-4">
          <h2 className="text-h3 font-semibold text-fg-primary">
            Portfolio <span className="text-fg-tertiary font-normal">· {cityGroup} · {category}</span>
          </h2>
          <span className="text-eyebrow uppercase text-fg-tertiary">Ranked by score</span>
        </header>
        {error ? (
          <ErrorFallback error={error} onRetry={() => mutate()} />
        ) : isLoading || !bundle ? (
          <Skeleton height="h-64" label="Loading portfolio" />
        ) : (
          <PortfolioTable events={bundle.events} />
        )}
      </section>
    </div>
  )
}

function SmallStat({ term, def }: { term: string; def: string }) {
  return (
    <div>
      <dt className="text-eyebrow uppercase text-fg-tertiary">{term}</dt>
      <dd className="text-h3 font-semibold text-fg-primary mt-1 tnum" data-tabular>{def}</dd>
    </div>
  )
}
