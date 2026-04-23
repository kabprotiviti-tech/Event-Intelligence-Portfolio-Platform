'use client'
import { useMemo, useState } from 'react'
import { useFilters } from '@/context/FilterContext'
import { allEvents } from '@/data'
import { detectGaps } from '@/lib/gap-detector'
import { generateRecommendations } from '@/lib/recommender'
import { TabNav } from '@/components/layout/TabNav'
import { CategoryBadge, ConfidenceBadge } from '@/components/ui/Badge'
import { CheckIcon, ArrowRightIcon } from '@/components/system/Icon'
import type { City, CityGroup, EventConcept } from '@/types'

const MONTH_NAMES = [
  '', 'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const GROUP_CITIES: Record<CityGroup, City[]> = {
  'Abu Dhabi': ['Abu Dhabi'],
  'Dubai':     ['Dubai'],
  'GCC':       ['Riyadh', 'Doha'],
}

export default function ConceptsPage() {
  const { cityGroup, category } = useFilters()
  const [approved, setApproved] = useState<Set<string>>(new Set())

  const concepts = useMemo(() => {
    const focus = GROUP_CITIES[cityGroup][0]
    const scoped = category === 'All' ? allEvents : allEvents.filter(e => e.category === category)
    const report = detectGaps(scoped, focus, 2025)
    return generateRecommendations(report, allEvents, 12)
  }, [cityGroup, category])

  function toggleApprove(id: string) {
    setApproved(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <TabNav />

      <div className="flex items-center justify-between">
        <p className="text-meta text-fg-tertiary tnum" data-tabular>
          {concepts.length} concept{concepts.length === 1 ? '' : 's'} generated
          <span className="mx-2">·</span>
          <span className="text-positive font-medium">{approved.size} approved</span>
        </p>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-meta font-medium text-fg-secondary hover:text-fg-primary transition-colors duration-ui ease-out"
        >
          Export to portfolio <ArrowRightIcon />
        </button>
      </div>

      {concepts.length === 0 && (
        <div className="rounded-md border border-dashed border-subtle bg-surface-card p-12 text-center">
          <p className="text-body-sm text-fg-secondary">No gaps detected for this filter.</p>
          <p className="text-meta text-fg-tertiary mt-1">Try a different category or city scope.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {concepts.map(c => (
          <ConceptFull
            key={c.id}
            concept={c}
            approved={approved.has(c.id)}
            onApprove={() => toggleApprove(c.id)}
          />
        ))}
      </div>
    </div>
  )
}

function ConceptFull({
  concept, approved, onApprove,
}: {
  concept: EventConcept
  approved: boolean
  onApprove: () => void
}) {
  return (
    <article
      className={[
        'relative rounded-md border bg-surface-card p-5 space-y-4 transition-colors duration-ui ease-out',
        approved ? 'border-positive' : 'border-subtle hover:border-strong',
      ].join(' ')}
    >
      <header>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-h3 font-semibold text-fg-primary leading-snug pr-8">
            {concept.title}
          </h3>
          {approved && (
            <span className="inline-flex items-center gap-1 text-eyebrow uppercase text-positive">
              <CheckIcon /> Approved
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={concept.category} />
          <span className="text-meta text-fg-tertiary">{concept.event_format}</span>
          <span className="text-fg-tertiary" aria-hidden>·</span>
          <ConfidenceBadge level={concept.confidence} />
        </div>
      </header>

      <dl className="grid grid-cols-3 gap-3 py-3 border-y border-subtle">
        <Field term="Timing"     def={MONTH_NAMES[concept.suggested_month]} />
        <Field term="City"       def={concept.suggested_city} />
        <Field term="Est. audience" def={concept.estimated_audience.toLocaleString()} tnum />
      </dl>

      <p className="text-body-sm text-fg-secondary leading-relaxed">{concept.reason}</p>

      {concept.reference_events.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-eyebrow uppercase text-fg-tertiary">Reference events</p>
          <div className="flex flex-wrap gap-1.5">
            {concept.reference_events.map(id => (
              <span key={id} className="inline-flex h-5 items-center px-2 rounded-sm bg-surface-inset text-meta font-mono text-fg-secondary">
                {id}
              </span>
            ))}
          </div>
        </div>
      )}

      <footer className="flex items-center justify-between pt-2">
        <div className="text-meta text-fg-tertiary">
          Gap score{' '}
          <span className="font-semibold text-fg-primary tnum" data-tabular>
            {Math.round(concept.gap_score * 100)}%
          </span>
          <span className="mx-2" aria-hidden>·</span>
          Budget{' '}
          <span className="font-semibold text-fg-primary tnum" data-tabular>
            AED {(concept.estimated_budget / 1_000_000).toFixed(1)}M
          </span>
        </div>
        <button
          type="button"
          onClick={onApprove}
          aria-pressed={approved}
          className={[
            'px-4 h-8 rounded-sm text-meta font-semibold transition-colors duration-ui ease-out',
            approved
              ? 'bg-surface-inset text-positive hover:bg-surface-canvas border border-positive/30'
              : 'bg-accent text-accent-ink hover:opacity-90',
          ].join(' ')}
        >
          {approved ? 'Approved · Undo' : 'Approve Concept'}
        </button>
      </footer>
    </article>
  )
}

function Field({ term, def, tnum }: { term: string; def: string; tnum?: boolean }) {
  return (
    <div>
      <dt className="text-eyebrow uppercase text-fg-tertiary">{term}</dt>
      <dd className={`text-body-sm font-semibold text-fg-primary mt-0.5 ${tnum ? 'tnum' : ''}`} data-tabular={tnum ? '' : undefined}>
        {def}
      </dd>
    </div>
  )
}
