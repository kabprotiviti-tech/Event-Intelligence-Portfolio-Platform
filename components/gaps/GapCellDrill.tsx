'use client'
import type { Category, City } from '@/types'
import { useGapCell } from '@/lib/hooks'
import { SourceBadge } from '@/components/ui/SourceBadge'
import { Skeleton, EmptyState } from '@/components/system/states'
import type { Event } from '@/types'

const MONTHS = [
  '', 'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

interface Props {
  month: number | null
  category: Category | null
  compare: City
  onClose?: () => void
}

/**
 * Drill-down panel — opens when a matrix cell is clicked.
 * Surfaces the actual events powering that cell, side-by-side with the
 * comparison city, plus the competitive signal + source attribution.
 */
export function GapCellDrill({ month, category, compare, onClose }: Props) {
  const { cell, isLoading, error } = useGapCell({ month, category, compare })

  if (month === null || category === null) {
    return (
      <EmptyState
        title="Click any cell in the matrix above."
        hint="Drill-down shows which events populate that month & category."
      />
    )
  }

  if (isLoading) return <Skeleton height="h-64" label="Loading cell events" />
  if (error)     return <p role="alert" className="text-meta text-negative">Failed to load · {error.message}</p>
  if (!cell)     return null

  const { signal, ad_events, comp_events, comparison_city } = cell

  return (
    <section
      aria-label="Cell drill-down"
      className="rounded-md border border-subtle bg-surface-card p-6 space-y-5"
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-eyebrow uppercase text-fg-tertiary">
            {MONTHS[cell.month]} · {cell.category} · Abu Dhabi vs {comparison_city}
          </p>
          <h3 className="text-h3 font-semibold text-fg-primary mt-1 leading-snug">
            {signal.narrative}
          </h3>
          <SignalStrip signal={signal} compCity={comparison_city} />
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-meta text-fg-tertiary hover:text-fg-primary transition-colors duration-ui ease-out"
          >
            Close
          </button>
        )}
      </header>

      <div className="grid md:grid-cols-2 gap-5">
        <EventColumn
          city="Abu Dhabi"
          events={ad_events}
          emptyHint={
            signal.position === 'behind'
              ? `Abu Dhabi has no ${cell.category} events this month — direct opportunity.`
              : `No Abu Dhabi ${cell.category} events scheduled.`
          }
        />
        <EventColumn
          city={comparison_city}
          events={comp_events}
          emptyHint={`${comparison_city} also has no ${cell.category} events.`}
        />
      </div>
    </section>
  )
}

function SignalStrip({ signal, compCity }: { signal: any; compCity: string }) {
  const diffLabel =
    signal.position === 'behind'   ? `AD is behind by ${Math.abs(signal.delta)}`
  : signal.position === 'leading'  ? `AD leads by ${signal.delta}`
  : signal.position === 'matching' ? 'Even matchup'
  : 'Uncontested'

  const tone =
    signal.position === 'behind'  ? 'text-negative'
  : signal.position === 'leading' ? 'text-positive'
  :                                 'text-fg-secondary'

  return (
    <div className="flex flex-wrap items-center gap-4 mt-3 text-meta">
      <span className="inline-flex items-center gap-1.5">
        <span className="text-fg-tertiary">Abu Dhabi</span>
        <span className="font-mono font-semibold text-fg-primary tnum" data-tabular>
          {signal.ad_count}
        </span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="text-fg-tertiary">{compCity}</span>
        <span className="font-mono font-semibold text-fg-primary tnum" data-tabular>
          {signal.comp_count}
        </span>
      </span>
      <span className={`font-medium ${tone}`}>· {diffLabel}</span>
      {signal.severity !== 'None' && (
        <span className={`inline-flex items-center h-5 px-2 rounded-sm border text-eyebrow uppercase font-semibold ${
          signal.severity === 'Critical' ? 'border-negative/40 text-negative'
        : signal.severity === 'Medium'   ? 'border-caution/40 text-caution'
        :                                  'border-subtle text-fg-tertiary'
        }`}>
          {signal.severity}
        </span>
      )}
    </div>
  )
}

function EventColumn({
  city, events, emptyHint,
}: {
  city: string
  events: Event[]
  emptyHint: string
}) {
  return (
    <div className="space-y-3">
      <header className="flex items-baseline justify-between">
        <p className="text-body-sm font-semibold text-fg-primary">{city}</p>
        <span className="text-meta text-fg-tertiary tnum" data-tabular>
          {events.length} event{events.length === 1 ? '' : 's'}
        </span>
      </header>
      {events.length === 0 ? (
        <p className="text-meta text-fg-tertiary italic leading-snug">{emptyHint}</p>
      ) : (
        <ul className="space-y-2">
          {events.map(e => <EventRow key={e.id} event={e} />)}
        </ul>
      )}
    </div>
  )
}

function EventRow({ event }: { event: Event }) {
  const d = new Date(event.start_date)
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  return (
    <li className="rounded-sm border border-subtle px-3 py-2 space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-body-sm font-medium text-fg-primary leading-snug truncate">{event.name}</p>
        <span className="text-meta text-fg-tertiary shrink-0 tnum" data-tabular>{date}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-meta text-fg-tertiary">
        <span>{event.venue}</span>
        <span aria-hidden>·</span>
        <span className="tnum" data-tabular>{event.estimated_attendance.toLocaleString()} guests</span>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <SourceBadge
          source_type={event.source_type}
          verification_level={event.verification_level}
          source_label={event.source_label}
        />
        {event.source_url && (
          <a
            href={event.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-eyebrow uppercase text-fg-tertiary hover:text-fg-primary transition-colors duration-ui ease-out"
          >
            Source ↗
          </a>
        )}
      </div>
    </li>
  )
}
