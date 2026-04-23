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
  'Dubai': ['Dubai'],
  'GCC': ['Riyadh', 'Doha', 'Muscat'],
}

export default function PortfolioPage() {
  const { cityGroup, category } = useFilters()
  const [budget, setBudget] = useState<number>(250_000_000)

  const { events, stats } = useMemo(() => {
    const scoped = allEvents
      .filter(e => GROUP_CITIES[cityGroup].includes(e.city))
      .filter(e => category === 'All' || e.category === category)

    const base = buildPortfolio(scoped)
    const events = simulateBudget(base, budget)

    const total = events.reduce((s, e) => s + (e.budget_allocated ?? 0), 0)
    const avg = events.length ? events.reduce((s, e) => s + e.portfolio_score, 0) / events.length : 0

    return {
      events,
      stats: {
        total_events: events.length,
        allocated: total,
        avg_score: Math.round(avg * 10) / 10,
      },
    }
  }, [cityGroup, category, budget])

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto">
      <TabNav />

      {/* Budget simulator */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Budget Simulator</h2>
            <p className="text-xs text-slate-500 mt-0.5">Move the slider to re-allocate weighted by portfolio score</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Total</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">AED {(budget / 1_000_000).toFixed(0)}M</p>
          </div>
        </div>

        <input
          type="range"
          min={50_000_000}
          max={1_000_000_000}
          step={10_000_000}
          value={budget}
          onChange={e => setBudget(parseInt(e.target.value))}
          className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#0a1a33]"
        />
        <div className="flex justify-between text-[10px] text-slate-400 uppercase tracking-widest font-medium mt-2">
          <span>AED 50M</span>
          <span>AED 500M</span>
          <span>AED 1B</span>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100">
          <SmallStat label="Events in scope" value={stats.total_events.toString()} />
          <SmallStat label="Allocated" value={`AED ${(stats.allocated / 1_000_000).toFixed(0)}M`} />
          <SmallStat label="Avg score" value={`${stats.avg_score} / 10`} />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-800">Portfolio ({cityGroup} · {category})</h2>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest">Ranked by score</span>
        </div>
        <PortfolioTable events={events} />
      </div>
    </div>
  )
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">{label}</p>
      <p className="text-base font-semibold text-slate-900 mt-1 tabular-nums">{value}</p>
    </div>
  )
}
