import type { EventConcept } from '@/types'
import { CategoryBadge, ConfidenceBadge } from '@/components/ui/Badge'

const MONTH_NAMES = ['', 'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function ConceptCard({ concept }: { concept: EventConcept }) {
  return (
    <article className="bg-surface-card border border-subtle rounded-md p-4 space-y-3 hover:border-strong transition-colors duration-ui ease-out">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-body font-semibold text-fg-primary leading-snug">
          {concept.title}
        </h4>
        <ConfidenceBadge level={concept.confidence} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <CategoryBadge category={concept.category} />
        <span className="text-meta text-fg-tertiary">{concept.event_format}</span>
        <span className="text-fg-tertiary" aria-hidden>·</span>
        <span className="text-meta text-fg-secondary">{MONTH_NAMES[concept.suggested_month]} 2025</span>
        <span className="text-fg-tertiary" aria-hidden>·</span>
        <span className="text-meta text-fg-secondary">{concept.suggested_city}</span>
      </div>

      <p className="text-body-sm text-fg-secondary leading-relaxed">{concept.reason}</p>

      {concept.reference_events.length > 0 && (
        <div className="flex flex-wrap gap-1 items-center">
          <span className="text-eyebrow uppercase text-fg-tertiary mr-1">Refs</span>
          {concept.reference_events.slice(0, 3).map(id => (
            <span key={id} className="inline-flex h-5 items-center px-1.5 rounded-sm bg-surface-inset text-meta font-mono text-fg-tertiary">
              {id}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-subtle text-meta text-fg-tertiary">
        <span>
          Est. audience{' '}
          <span className="font-semibold text-fg-primary tnum" data-tabular>
            {concept.estimated_audience.toLocaleString()}
          </span>
        </span>
        <span>
          Gap score{' '}
          <span className="font-semibold text-fg-primary tnum" data-tabular>
            {Math.round(concept.gap_score * 100)}%
          </span>
        </span>
      </div>
    </article>
  )
}
