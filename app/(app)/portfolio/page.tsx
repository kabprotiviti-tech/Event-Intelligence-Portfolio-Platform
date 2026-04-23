'use client'
import { useMemo, useState } from 'react'
import { useFilters } from '@/context/FilterContext'
import { allEvents } from '@/data'
import { buildPortfolio, simulateBudget } from '@/lib/scorer'
import { PortfolioTable } from '@/components/portfolio/PortfolioTable'
import { TabNav } from '@/components/layout/TabNav'
import type { City, CityGroup } from '@/types'

const GROUP_CITIES: Record<CityGroup, City[]> = {
  'Abu Dhabi': ['Abu Dhabi'],
  'Dubai':     ['Dubai'],
  'GCC':       ['Riyadh', 'Doha', 'Muscat'],
}

const MIN_BUDGET = 50_000_000
const MAX_BUDGET = 1_000_000_000

export default function PortfolioPage() {
  const { cityGroup, category } = useFilters()
  const [budget, setBudget] = useState<number>(250_000_000)

  const { events, stats } = useMemo(() => {
    const scoped = allEvents
      .filter(e => GROUP_CITIES[cityGroup].includes(e.city))
      .filter(e => category === 'All' || e.category === category)
    const base = buildPortfolio(scoped)
    const events = simulateBudget(base, budget)
    const allocated = events.reduce((s, e) => s + (e.budget_allocated ?? 0), 0)
    const avg = events.length ? events.reduce((s, e) => s + e.portfolio_score, 0) / events.length : 0
    return {
      events,
      stats: {
        total_events: events.length,
        allocated,
        avg_score: Math.round(avg * 10) / 10,
      },
    }
  }, [cityGroup, category, budget])

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <TabNav />

      <section aria-label="Budget simulator" className="rounded-md border border-subtle bg-surface-card p-6">
        <header className="flex items-baseline justify-between mb-5">
          <div>
            <h2 className="text-h3 font-semibold text-fg-primary">Budget Simulator</h2>
            <p className="text-meta text-fg-tertiary mt-0.5">
              Move the slider to re-allocate weighted by portfolio score
            </p>
          </div>
          <div className="text-right">
            <p className="text-eyebrow uppercase text-fg-tertiary">Total</p>
            <p className="text-h1 font-semibold text-fg-primary tnum" data-tabular>
              AED {(budget / 1_000_000).toFixed(0)}M
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
          value={budget}
          onChange={e => setBudget(parseInt(e.target.value))}
          className="w-full h-1 bg-surface-inset rounded-sm appearance-none cursor-pointer"
          aria-valuemin={MIN_BUDGET}
          aria-valuemax={MAX_BUDGET}
          aria-valuenow={budget}
          aria-valuetext={`AED ${(budget / 1_000_000).toFixed(0)} million`}
        />
        <div className="flex justify-between text-eyebrow uppercase text-fg-tertiary mt-2 tnum" data-tabular>
          <span>AED 50M</span>
          <span>AED 500M</span>
          <span>AED 1B</span>
        </div>

        <dl className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-subtle">
          <SmallStat term="Events in scope" def={stats.total_events.toString()} />
          <SmallStat term="Allocated" def={`AED ${(stats.allocated / 1_000_000).toFixed(0)}M`} />
          <SmallStat term="Avg score" def={`${stats.avg_score.toFixed(1)} / 10`} />
        </dl>
      </section>

      <section aria-label="Portfolio table" className="rounded-md border border-subtle bg-surface-card p-6">
        <header className="flex items-baseline justify-between mb-4">
          <h2 className="text-h3 font-semibold text-fg-primary">
            Portfolio <span className="text-fg-tertiary font-normal">· {cityGroup} · {category}</span>
          </h2>
          <span className="text-eyebrow uppercase text-fg-tertiary">Ranked by score</span>
        </header>
        <PortfolioTable events={events} />
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
