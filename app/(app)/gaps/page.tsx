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
  'Dubai':     ['Dubai'],
  'GCC':       ['Riyadh', 'Doha'],
}

export default function GapsPage() {
  const { cityGroup, category } = useFilters()

  const { reports, comparison } = useMemo(() => {
    const scoped = category === 'All' ? allEvents : allEvents.filter(e => e.category === category)

    const citiesToShow: City[] = [
      'Abu Dhabi',
      ...GROUP_CITIES[cityGroup].filter(c => c !== 'Abu Dhabi'),
      ...(cityGroup === 'Abu Dhabi' ? (['Dubai'] as City[]) : []),
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
    <div className="mx-auto max-w-[1400px] space-y-6">
      <TabNav />

      <section aria-label="Gaps summary" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {comparison.map(c => (
          <div key={c.city} className="rounded-md border border-subtle bg-surface-card p-5">
            <p className="text-eyebrow uppercase text-fg-tertiary">{c.city}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-h1 font-semibold text-fg-primary tnum" data-tabular>{c.gaps}</p>
              <p className="text-meta text-fg-tertiary">gap slots</p>
            </div>
            {c.delta !== 0 && c.city !== 'Abu Dhabi' && (
              <p className={`text-meta mt-2 ${c.delta > 0 ? 'text-positive' : 'text-negative'}`}>
                {c.delta > 0 ? '+' : ''}{c.delta} vs Abu Dhabi
              </p>
            )}
          </div>
        ))}
      </section>

      <section aria-label="Gap matrix" className="rounded-md border border-subtle bg-surface-card p-6">
        <header className="flex items-baseline justify-between mb-5">
          <div>
            <h2 className="text-h3 font-semibold text-fg-primary">Gap Matrix</h2>
            <p className="text-meta text-fg-tertiary mt-0.5">
              Month × category · cell count weighted by impact
            </p>
          </div>
        </header>
        <GapMatrix reports={reports} />
      </section>
    </div>
  )
}
