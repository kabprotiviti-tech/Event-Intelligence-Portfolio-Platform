'use client'
import type { FutureOpportunity, DecisionConfidence } from '@/types'
import { EmptyState } from '@/components/system/states'
import { useDrill } from '@/context/DrillContext'

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
  const { open } = useDrill()
  const investMin = (opp.investment_range.min / 1_000_000).toFixed(0)
  const investMax = (opp.investment_range.max / 1_000_000).toFixed(0)
  return (
    <button
      type="button"
      onClick={() => open({
        kind: 'future-opportunity',
        eyebrow: 'Future opportunity',
        title: opp.title,
        opportunity: opp,
      })}
      className="text-left rounded-md border border-subtle bg-surface-card p-5 space-y-3 hover:border-strong transition-colors duration-ui ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
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
          <span className="inline-flex items-center h-5 px-2 rounded-sm border border-subtle">
            {opp.category}
          </span>
          <span className="inline-flex items-center h-5 px-2 rounded-sm border border-subtle">
            {opp.horizon}
          </span>
        </div>
      </header>

      <p className="text-body-sm text-fg-secondary leading-relaxed line-clamp-3">{opp.reasoning}</p>

      <footer className="pt-2 border-t border-subtle flex items-baseline justify-between text-meta">
        <span className="text-fg-tertiary">
          <span className="font-semibold text-fg-primary tnum" data-tabular>AED {investMin}M – {investMax}M</span>
        </span>
        <span className="text-fg-tertiary">Open detail →</span>
      </footer>
    </button>
  )
}
