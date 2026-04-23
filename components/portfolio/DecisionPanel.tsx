'use client'
import type {
  DecisionPanel as DecisionPanelData,
  DecisionKind, EventDecision, CreateDecision, DecisionConfidence,
  KeyFactor, DecisionConstraints,
} from '@/types'
import { Skeleton, EmptyState } from '@/components/system/states'
import { AiExplainButton } from '@/components/ai/AiExplainButton'
import { useDrill } from '@/context/DrillContext'

/**
 * 4-bucket director view: Fund · Scale · Drop · Create.
 * Each row: event/concept, key factors, confidence, plain-English reason.
 * Constraint summary above the grid shows category balance, seasonality,
 * budget utilization, and competition deficit.
 */

const HEADINGS: Record<DecisionKind, { title: string; sub: string; eyebrow: string; rail: string }> = {
  fund:   { title: 'Fund Immediately', sub: 'Double down on strength',       eyebrow: 'Top 3',     rail: 'bg-positive' },
  scale:  { title: 'Scale',            sub: 'Underfunded upside',            eyebrow: 'Top 3',     rail: 'bg-accent'   },
  drop:   { title: 'Drop',             sub: 'Reclaim budget',                eyebrow: 'Bottom 3',  rail: 'bg-negative' },
  create: { title: 'New Opportunities',sub: 'Gap-sourced concepts',          eyebrow: 'Top 4',     rail: 'bg-info'     },
}

const CONFIDENCE_STYLE: Record<DecisionConfidence, string> = {
  High:   'border-positive/40 text-positive',
  Medium: 'border-caution/40 text-caution',
  Low:    'border-subtle text-fg-tertiary',
}

const MONTH_NAMES = [
  '', 'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',
]

export function DecisionPanel({ data }: { data: DecisionPanelData | null | undefined }) {
  if (!data) {
    return (
      <div className="space-y-4">
        <Skeleton height="h-14" />
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height="h-72" />)}
        </div>
      </div>
    )
  }

  const empty = data.fund.length + data.scale.length + data.drop.length + data.create.length === 0
  if (empty) {
    return <EmptyState title="No decisions to surface yet." hint="Adjust filters or budget to populate the panel." />
  }

  return (
    <div className="space-y-4">
      <ConstraintsBar c={data.constraints} />
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        <EventColumn kind="fund"  entries={data.fund} />
        <EventColumn kind="scale" entries={data.scale} />
        <EventColumn kind="drop"  entries={data.drop} />
        <CreateColumn entries={data.create} />
      </div>
    </div>
  )
}

/* ─── Constraints summary ────────────────────────────────────── */

function ConstraintsBar({ c }: { c: DecisionConstraints }) {
  const belowMinCats = (Object.entries(c.category_balance) as Array<[string, { count: number; below_min: boolean }]>)
    .filter(([, v]) => v.below_min)
    .map(([cat]) => cat)

  return (
    <div className="rounded-md border border-subtle bg-surface-card px-5 py-4">
      <p className="text-eyebrow uppercase text-fg-tertiary mb-3">Strategic constraints</p>
      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-5 text-meta">
        <ConstraintCell
          term="Category balance"
          def={belowMinCats.length === 0 ? 'Balanced' : `${belowMinCats.join(', ')} below min`}
          tone={belowMinCats.length ? 'caution' : 'positive'}
        />
        <ConstraintCell
          term="Seasonality"
          def={
            c.seasonality.peak_months.length
              ? `Peak ${c.seasonality.peak_months.map(m => MONTH_NAMES[m]).join(', ')}`
              : 'Well spread'
          }
          tone={c.seasonality.peak_months.length > 3 ? 'caution' : 'neutral'}
        />
        <ConstraintCell
          term="Budget utilization"
          def={`${c.budget.utilization_pct}% · AED ${(c.budget.allocated / 1_000_000).toFixed(0)}M`}
          tone={c.budget.within_limit ? 'positive' : 'negative'}
        />
        <ConstraintCell
          term={`vs ${c.competition.comparison_city}`}
          def={`${c.competition.ad_deficit_slots} deficit slots`}
          tone={c.competition.ad_deficit_slots > 10 ? 'caution' : 'neutral'}
        />
      </dl>
    </div>
  )
}

function ConstraintCell({
  term, def, tone,
}: { term: string; def: string; tone: 'positive' | 'caution' | 'negative' | 'neutral' }) {
  const toneCls =
    tone === 'positive' ? 'text-positive'
  : tone === 'caution'  ? 'text-caution'
  : tone === 'negative' ? 'text-negative'
  : 'text-fg-primary'
  return (
    <div>
      <dt className="text-eyebrow uppercase text-fg-tertiary">{term}</dt>
      <dd className={`text-body-sm font-semibold mt-1 ${toneCls}`}>{def}</dd>
    </div>
  )
}

/* ─── Columns ────────────────────────────────────────────────── */

function EventColumn({ kind, entries }: { kind: 'fund' | 'scale' | 'drop'; entries: EventDecision[] }) {
  const h = HEADINGS[kind]
  return (
    <section className="rounded-md border border-subtle bg-surface-card overflow-hidden">
      <ColumnHeader heading={h} />
      {entries.length === 0 ? (
        <p className="p-5 text-meta text-fg-tertiary">Nothing matches this bucket for the current filter.</p>
      ) : (
        <ol className="divide-y divide-subtle">
          {entries.map((entry, i) => (
            <EventDecisionRow key={entry.event.id} index={i + 1} entry={entry} />
          ))}
        </ol>
      )}
    </section>
  )
}

function CreateColumn({ entries }: { entries: CreateDecision[] }) {
  const h = HEADINGS.create
  return (
    <section className="rounded-md border border-subtle bg-surface-card overflow-hidden">
      <ColumnHeader heading={h} />
      {entries.length === 0 ? (
        <p className="p-5 text-meta text-fg-tertiary">No high-severity gaps to source from.</p>
      ) : (
        <ol className="divide-y divide-subtle">
          {entries.map((entry, i) => (
            <CreateDecisionRow key={entry.concept.id} index={i + 1} entry={entry} />
          ))}
        </ol>
      )}
    </section>
  )
}

function ColumnHeader({ heading }: { heading: typeof HEADINGS[DecisionKind] }) {
  return (
    <header className="border-b border-subtle px-5 pt-5 pb-4">
      <div className="flex items-center gap-3">
        <span aria-hidden className={`w-1 h-4 rounded-sm ${heading.rail}`} />
        <p className="text-eyebrow uppercase text-fg-tertiary">{heading.eyebrow}</p>
      </div>
      <h3 className="text-h3 font-semibold text-fg-primary mt-1">{heading.title}</h3>
      <p className="text-meta text-fg-tertiary">{heading.sub}</p>
    </header>
  )
}

/* ─── Rows ───────────────────────────────────────────────────── */

function EventDecisionRow({ entry, index }: { entry: EventDecision; index: number }) {
  const { event, reason, key_factors, confidence, kind } = entry
  const { open } = useDrill()
  const perM = event.budget_allocated ? `AED ${(event.budget_allocated / 1_000_000).toFixed(1)}M` : '—'

  const openDecision = () => {
    const label = kind === 'fund' ? 'Fund' : kind === 'scale' ? 'Scale' : 'Drop'
    open({
      kind: 'event-decision',
      eyebrow: `${label} recommendation`,
      title: event.name,
      decision: entry,
    })
  }

  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={openDecision}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDecision() }
        }}
        className="px-5 py-4 hover:bg-surface-inset transition-colors duration-ui ease-out cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
      >
        <div className="flex items-start gap-3">
          <span className="font-mono text-meta text-fg-tertiary tnum mt-1 w-4 shrink-0" data-tabular>{index}</span>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-body-sm font-semibold text-fg-primary truncate">{event.name}</p>
              <ConfidencePill confidence={confidence} />
            </div>
            <p className="text-meta text-fg-tertiary">
              {event.city} · {event.category} · <span className="tnum" data-tabular>{perM}</span>
            </p>
            <p className="text-meta text-fg-secondary leading-snug">{reason}</p>
            <KeyFactors factors={key_factors} />
            <div onClick={e => e.stopPropagation()}>
              <AiExplainButton event={event} decision={kind} />
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

function CreateDecisionRow({ entry, index }: { entry: CreateDecision; index: number }) {
  const { concept, reason, key_factors, confidence } = entry
  const { open } = useDrill()

  return (
    <li>
      <button
        type="button"
        onClick={() => open({
          kind: 'create-decision',
          eyebrow: 'New opportunity',
          title: concept.title,
          decision: entry,
        })}
        className="w-full text-left px-5 py-4 hover:bg-surface-inset transition-colors duration-ui ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
      >
        <div className="flex items-start gap-3">
          <span className="font-mono text-meta text-fg-tertiary tnum mt-1 w-4 shrink-0" data-tabular>{index}</span>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-body-sm font-semibold text-fg-primary truncate">{concept.title}</p>
              <ConfidencePill confidence={confidence} />
            </div>
            <p className="text-meta text-fg-tertiary">
              {MONTH_NAMES[concept.suggested_month]} · {concept.suggested_city} · {concept.category}
            </p>
            <p className="text-meta text-fg-secondary leading-snug">{reason}</p>
            <KeyFactors factors={key_factors} />
          </div>
        </div>
      </button>
    </li>
  )
}

/* ─── Atoms ──────────────────────────────────────────────────── */

function ConfidencePill({ confidence }: { confidence: DecisionConfidence }) {
  return (
    <span
      className={`inline-flex items-center h-5 px-2 rounded-sm border text-eyebrow uppercase font-semibold shrink-0 ${CONFIDENCE_STYLE[confidence]}`}
      title="Confidence based on data tier + score coherence"
    >
      {confidence}
    </span>
  )
}

function KeyFactors({ factors }: { factors: KeyFactor[] }) {
  if (factors.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1">
      {factors.map((f, i) => (
        <span
          key={i}
          className={`inline-flex items-center h-5 px-2 rounded-sm border text-eyebrow uppercase font-medium ${
            f.signal === 'positive' ? 'border-positive/30 text-positive'
          : f.signal === 'negative' ? 'border-negative/30 text-negative'
          :                           'border-subtle text-fg-tertiary'
          }`}
        >
          {f.label} <span className="ml-1 font-mono normal-case tnum" data-tabular>{f.value}</span>
        </span>
      ))}
    </div>
  )
}
