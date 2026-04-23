'use client'
import { useFilters } from '@/context/FilterContext'
import { useGaps } from '@/lib/hooks'
import { GapMatrix } from '@/components/gaps/GapMatrix'
import { TabNav } from '@/components/layout/TabNav'
import { Skeleton, ErrorFallback } from '@/components/system/states'
import type { City, CityGroup } from '@/types'

const GROUP_CITIES: Record<CityGroup, City[]> = {
  'Abu Dhabi': ['Abu Dhabi'],
  'Dubai':     ['Dubai'],
  'GCC':       ['Riyadh', 'Doha'],
}

export default function GapsPage() {
  const { cityGroup, category } = useFilters()

  const citiesToShow: City[] = Array.from(
    new Set<City>([
      'Abu Dhabi',
      ...GROUP_CITIES[cityGroup].filter(c => c !== 'Abu Dhabi'),
      ...(cityGroup === 'Abu Dhabi' ? (['Dubai'] as City[]) : []),
    ])
  )

  const { reports, isLoading, error, mutate } = useGaps({
    cities: citiesToShow, year: 2025, category,
  })

  // Comparison vs Abu Dhabi
  const ad = reports.find(r => r.city === 'Abu Dhabi')
  const comparison = reports.map(r => ({
    city: r.city,
    gaps: r.summary.total_gaps,
    delta: ad ? r.summary.total_gaps - ad.summary.total_gaps : 0,
  }))

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <TabNav />

      <section aria-label="Gaps summary" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <Skeleton height="h-28" /><Skeleton height="h-28" /><Skeleton height="h-28" />
          </>
        ) : error ? (
          <div className="md:col-span-3"><ErrorFallback error={error} onRetry={() => mutate()} /></div>
        ) : (
          comparison.map(c => (
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
          ))
        )}
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
        {error
          ? <ErrorFallback error={error} onRetry={() => mutate()} />
          : <GapMatrix reports={reports} />}
      </section>
    </div>
  )
}
