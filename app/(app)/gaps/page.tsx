'use client'
import { useMemo } from 'react'
import { useFilters } from '@/context/FilterContext'
import { allEvents } from '@/data'
import { detectGaps } from '@/lib/gap-detector'
import { GapMatrix } from '@/components/gaps/GapMatrix'
import { TabNav } from '@/components/layout/TabNav'
import type { City, CityGroup } from '@/types'

const GROUP_CITIES: Record<CityGroup, City[]> = {
  'Abu Dhabi': ['Abu Dhabi'],
  'Dubai': ['Dubai'],
  'GCC': ['Riyadh', 'Doha'],
}

export default function GapsPage() {
  const { cityGroup, category } = useFilters()

  const { reports, comparison } = useMemo(() => {
    const scoped = category === 'All'
      ? allEvents
      : allEvents.filter(e => e.category === category)

    const citiesToShow = [
      'Abu Dhabi' as City,
      ...GROUP_CITIES[cityGroup].filter(c => c !== 'Abu Dhabi'),
      ...(cityGroup === 'Abu Dhabi' ? ['Dubai' as City] : []),
    ]
    const unique = Array.from(new Set(citiesToShow))
    const reports = unique.map(city => detectGaps(scoped, city, 2025))

    const adGaps = reports[0].summary.total_gaps
    const comparison = reports.map(r => ({
      city: r.city,
      gaps: r.summary.total_gaps,
      delta: r.summary.total_gaps - adGaps,
    }))

    return { reports, comparison }
  }, [cityGroup, category])

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto">
      <TabNav />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {comparison.map(c => (
          <div key={c.city} className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-medium">{c.city}</p>
            <div className="flex items-end gap-3 mt-2">
              <p className="text-3xl font-bold text-slate-900">{c.gaps}</p>
              <p className="text-xs text-slate-400 mb-1.5">gap slots</p>
            </div>
            {c.delta !== 0 && c.city !== 'Abu Dhabi' && (
              <p className={`text-xs mt-2 ${c.delta > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {c.delta > 0 ? '+' : ''}{c.delta} vs Abu Dhabi
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Gap Matrix</h2>
            <p className="text-xs text-slate-500 mt-0.5">Month × Category · cell count weighted by impact</p>
          </div>
        </div>
        <GapMatrix reports={reports} />
      </div>
    </div>
  )
}
