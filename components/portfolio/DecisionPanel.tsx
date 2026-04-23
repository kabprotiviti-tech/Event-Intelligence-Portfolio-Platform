import type { DecisionEntry, DecisionKind, DecisionPanel as DecisionPanelData } from '@/types'
import { Skeleton, EmptyState } from '@/components/system/states'

const HEADINGS: Record<DecisionKind, { title: string; sub: string; eyebrow: string }> = {
  fund:  { title: 'Fund',  sub: 'Double down on strength',      eyebrow: 'Top 3' },
  scale: { title: 'Scale', sub: 'Underfunded upside',           eyebrow: 'Top 3' },
  drop:  { title: 'Drop',  sub: 'Reclaim budget',               eyebrow: 'Bottom 3' },
}

export function DecisionPanel({ data }: { data: DecisionPanelData | null | undefined }) {
  if (!data) {
    return (
      <div className="grid md:grid-cols-3 gap-4">
        <Skeleton height="h-56" />
        <Skeleton height="h-56" />
        <Skeleton height="h-56" />
      </div>
    )
  }

  const empty = data.fund.length === 0 && data.scale.length === 0 && data.drop.length === 0
  if (empty) {
    return <EmptyState title="No decisions to surface yet." hint="Adjust filters or budget to populate the panel." />
  }

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Column kind="fund"  entries={data.fund}  />
      <Column kind="scale" entries={data.scale} />
      <Column kind="drop"  entries={data.drop}  />
    </div>
  )
}

function Column({ kind, entries }: { kind: DecisionKind; entries: DecisionEntry[] }) {
  const h = HEADINGS[kind]
  const accentBar = kind === 'fund' ? 'bg-positive' : kind === 'scale' ? 'bg-accent' : 'bg-negative'

  return (
    <article className="rounded-md border border-subtle bg-surface-card overflow-hidden">
      <header className="border-b border-subtle px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <span aria-hidden className={`w-1 h-4 rounded-sm ${accentBar}`} />
          <p className="text-eyebrow uppercase text-fg-tertiary">{h.eyebrow} · {h.title}</p>
        </div>
        <h3 className="text-h3 font-semibold text-fg-primary mt-1">{h.title}</h3>
        <p className="text-meta text-fg-tertiary">{h.sub}</p>
      </header>

      {entries.length === 0 ? (
        <p className="p-5 text-meta text-fg-tertiary">Nothing matches this bucket for the current filter.</p>
      ) : (
        <ol className="divide-y divide-subtle">
          {entries.map((entry, i) => (
            <DecisionRow key={entry.event.id} index={i + 1} entry={entry} />
          ))}
        </ol>
      )}
    </article>
  )
}

function DecisionRow({ entry, index }: { entry: DecisionEntry; index: number }) {
  const { event, reason } = entry
  const perM = event.budget_allocated ? `AED ${(event.budget_allocated / 1_000_000).toFixed(1)}M` : '—'

  return (
    <li className="px-5 py-4">
      <div className="flex items-start gap-3">
        <span className="font-mono text-meta text-fg-tertiary mt-0.5 tnum w-4 shrink-0" data-tabular>
          {index}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-body-sm font-semibold text-fg-primary truncate">{event.name}</p>
            <span className="text-meta text-fg-tertiary tnum shrink-0" data-tabular>
              {event.portfolio_score.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-meta text-fg-tertiary mt-0.5">
            <span>{event.city}</span>
            <span aria-hidden>·</span>
            <span>{event.category}</span>
            <span aria-hidden>·</span>
            <span className="tnum" data-tabular>{perM}</span>
          </div>
          <p className="text-meta text-fg-secondary leading-snug mt-2">{reason}</p>
        </div>
      </div>
    </li>
  )
}
