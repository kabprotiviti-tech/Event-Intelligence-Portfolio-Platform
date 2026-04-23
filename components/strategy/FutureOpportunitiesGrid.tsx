import type { FutureOpportunity, DecisionConfidence } from '@/types'
import { EmptyState } from '@/components/system/states'

const CONF_STYLE: Record<DecisionConfidence, string> = {
  High:   'border-positive/40 text-positive',
  Medium: 'border-caution/40 text-caution',
  Low:    'border-subtle text-fg-tertiary',
}

export function FutureOpportunitiesGrid({ opportunities }: { opportunities: FutureOpportunity[] }) {
  if (opportunities.length === 0) {
    return (
      <EmptyState
        title="No future opportunities surfaced."
        hint="Trends and outlook align with existing portfolio — no pattern match."
      />
    )
  }

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {opportunities.map(opp => <OpportunityCard key={opp.id} opp={opp} />)}
    </div>
  )
}

function OpportunityCard({ opp }: { opp: FutureOpportunity }) {
  const investMin = (opp.investment_range.min / 1_000_000).toFixed(0)
  const investMax = (opp.investment_range.max / 1_000_000).toFixed(0)
  return (
    <article className="rounded-md border border-subtle bg-surface-card p-5 space-y-3">
      <header>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h4 className="text-body font-semibold text-fg-primary leading-snug">{opp.title}</h4>
          <span
            className={`inline-flex items-center h-5 px-2 rounded-sm border text-eyebrow uppercase font-semibold shrink-0 ${CONF_STYLE[opp.confidence]}`}
          >
            {opp.confidence}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-meta text-fg-tertiary">
          <span
            className="inline-flex items-center h-5 px-2 rounded-sm border border-subtle"
          >
            {opp.category}
          </span>
          <span
            className="inline-flex items-center h-5 px-2 rounded-sm border border-subtle"
          >
            {opp.horizon}
          </span>
        </div>
      </header>

      <p className="text-body-sm text-fg-secondary leading-relaxed">{opp.reasoning}</p>

      {opp.evidence.length > 0 && (
        <div className="space-y-1">
          <p className="text-eyebrow uppercase text-fg-tertiary">Evidence</p>
          <ul className="space-y-0.5">
            {opp.evidence.slice(0, 3).map((ev, i) => (
              <li key={i} className="text-meta text-fg-tertiary leading-snug">— {ev}</li>
            ))}
          </ul>
        </div>
      )}

      <footer className="pt-2 border-t border-subtle">
        <p className="text-meta text-fg-tertiary">
          Investment range{' '}
          <span className="font-semibold text-fg-primary tnum" data-tabular>
            AED {investMin}M – {investMax}M
          </span>
        </p>
      </footer>
    </article>
  )
}
