'use client'
import { useState, useMemo } from 'react'
import { useFilters } from '@/context/FilterContext'
import { useGaps } from '@/lib/hooks'
import { GapMatrix } from '@/components/gaps/GapMatrix'
import { GapCellDrill } from '@/components/gaps/GapCellDrill'
import { TabNav } from '@/components/layout/TabNav'
import { Skeleton, ErrorFallback } from '@/components/system/states'
import type { Category, City, CityGroup } from '@/types'

/**
 * Gap Finder — always Abu Dhabi's perspective.
 * The filter controls WHO Abu Dhabi is being compared to.
 */
const GROUP_COMPARISON: Record<CityGroup, City> = {
  'Abu Dhabi': 'Dubai',    // no-op semantically → default compare
  'Dubai':     'Dubai',
  'GCC':       'Riyadh',
}

interface SelectedCell {
  month: number
  category: Category
}

export default function GapsPage() {
  const { cityGroup, category } = useFilters()
  const compareCity = GROUP_COMPARISON[cityGroup]

  const [selected, setSelected] = useState<SelectedCell | null>(null)

  // Pull reports for Abu Dhabi + chosen comparison
  const { reports, isLoading, error, mutate } = useGaps({
    cities: ['Abu Dhabi', compareCity],
    year: 2025,
    category,
  })

  const adReport = reports.find(r => r.city === 'Abu Dhabi') ?? null
  const compReport = reports.find(r => r.city === compareCity) ?? null

  const summary = useMemo(() => {
    if (!adReport || !compReport) return null
    let behind = 0
    let leading = 0
    let uncontested = 0
    for (const slot of adReport.slots) {
      const other = compReport.slots.find(s => s.month === slot.month && s.category === slot.category)
      if (!other) continue
      if (slot.event_count < other.event_count) behind++
      else if (slot.event_count > other.event_count) leading++
      else if (slot.event_count === 0 && other.event_count === 0) uncontested++
    }
    return { behind, leading, uncontested }
  }, [adReport, compReport])

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <TabNav />

      {/* Summary row — AD-centric competitive read */}
      <section aria-label="Competitive summary" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading || !summary ? (
          <>
            <Skeleton height="h-28" /><Skeleton height="h-28" /><Skeleton height="h-28" />
          </>
        ) : (
          <>
            <SummaryCard
              term={`Behind vs ${compareCity}`}
              value={summary.behind}
              tone="negative"
              hint="Month × category slots where Abu Dhabi trails"
            />
            <SummaryCard
              term={`Leading vs ${compareCity}`}
              value={summary.leading}
              tone="positive"
              hint="Slots where Abu Dhabi is ahead"
            />
            <SummaryCard
              term="Uncontested windows"
              value={summary.uncontested}
              tone="neutral"
              hint="Slots empty in both cities — first-mover opportunity"
            />
          </>
        )}
      </section>

      {/* Matrix */}
      <section aria-label="Gap matrix" className="rounded-md border border-subtle bg-surface-card p-6">
        {error ? (
          <ErrorFallback error={error} onRetry={() => mutate()} />
        ) : !adReport || !compReport ? (
          <Skeleton height="h-64" label="Loading gap matrix" />
        ) : (
          <GapMatrix
            adReport={adReport}
            comparisonReport={compReport}
            onCellClick={setSelected}
            selectedCell={selected}
          />
        )}
      </section>

      {/* Drill-down */}
      <GapCellDrill
        month={selected?.month ?? null}
        category={selected?.category ?? null}
        compare={compareCity}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}

function SummaryCard({
  term, value, tone, hint,
}: {
  term: string
  value: number
  tone: 'negative' | 'positive' | 'neutral'
  hint: string
}) {
  const toneCls =
    tone === 'negative' ? 'text-negative'
  : tone === 'positive' ? 'text-positive'
  :                       'text-fg-primary'
  return (
    <div className="rounded-md border border-subtle bg-surface-card p-5">
      <p className="text-eyebrow uppercase text-fg-tertiary">{term}</p>
      <p className={`text-h1 font-semibold mt-2 tnum ${toneCls}`} data-tabular>{value}</p>
      <p className="text-meta text-fg-tertiary mt-2 leading-snug">{hint}</p>
    </div>
  )
}
