import type { Event } from '@/types'
import { CategoryBadge } from './Badge'
import { SourceBadge } from './SourceBadge'

export function EventCard({ event }: { event: Event }) {
  const d = new Date(event.start_date)
  const month = d.toLocaleDateString('en-GB', { month: 'short' })
  const day = d.toLocaleDateString('en-GB', { day: '2-digit' })

  return (
    <div className="group flex items-center gap-4 rounded-md bg-surface-card border border-subtle p-4 hover:border-strong transition-colors duration-ui ease-out">
      <div className="shrink-0 w-12 h-12 rounded-sm bg-surface-inset border border-subtle flex flex-col items-center justify-center">
        <span className="text-eyebrow text-fg-tertiary">{month}</span>
        <span className="text-h3 font-semibold text-fg-primary leading-none tnum" data-tabular>{day}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body font-semibold text-fg-primary truncate">{event.name}</p>
        <div className="flex items-center flex-wrap gap-2 mt-1 text-meta text-fg-tertiary">
          <CategoryBadge category={event.category} />
          <SourceBadge
            source_type={event.source_type}
            verification_level={event.verification_level}
            source_label={event.source_label}
            compact
          />
          <span aria-hidden>·</span>
          <span>{event.city}</span>
          <span aria-hidden>·</span>
          <span className="tnum" data-tabular>{event.estimated_attendance.toLocaleString()}</span>
          <span>guests</span>
        </div>
      </div>
      <div className="text-right shrink-0" aria-label={`Impact weight ${event.impact_weight} of 5`}>
        <p className="text-eyebrow uppercase text-fg-tertiary">Impact</p>
        <div className="flex items-center gap-0.5 mt-1" aria-hidden>
          {[1, 2, 3, 4, 5].map(i => (
            <span
              key={i}
              className={`w-1 h-4 rounded-sm ${i <= event.impact_weight ? 'bg-accent' : 'bg-border-subtle'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
