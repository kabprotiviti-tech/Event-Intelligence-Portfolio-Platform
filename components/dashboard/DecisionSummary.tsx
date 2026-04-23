import Link from 'next/link'
import type {
  DecisionPanel, DecisionKind, EventDecision, CreateDecision,
} from '@/types'
import { Skeleton, EmptyState } from '@/components/system/states'
import { ArrowRightIcon } from '@/components/system/Icon'

const BUCKETS: Array<{ kind: DecisionKind; label: string; rail: string }> = [
  { kind: 'fund',   label: 'Fund',    rail: 'bg-positive' },
  { kind: 'scale',  label: 'Scale',   rail: 'bg-accent'   },
  { kind: 'drop',   label: 'Drop',    rail: 'bg-negative' },
  { kind: 'create', label: 'Create',  rail: 'bg-info'     },
]

interface Props {
  data: DecisionPanel | null | undefined
  /** Open event decision detail in drill panel */
  onEventDecisionClick?: (decision: EventDecision) => void
  /** Open create-bucket detail / full list in drill panel */
  onCreateClick?: (decision: CreateDecision) => void
}

export function DecisionSummary({ data, onEventDecisionClick, onCreateClick }: Props) {
  if (!data) return <Skeleton height="h-40" label="Loading recommended actions" />

  const totalCount = data.fund.length + data.scale.length + data.drop.length + data.create.length
  if (totalCount === 0) {
    return <EmptyState title="No decisions available." hint="Events or filters need adjustment." />
  }

  return (
    <ul className="divide-y divide-subtle">
      {BUCKETS.map(b => {
        const list =
          b.kind === 'fund'   ? data.fund
        : b.kind === 'scale'  ? data.scale
        : b.kind === 'drop'   ? data.drop
        :                       data.create
        const top = list[0]
        const count = list.length

        const rowBody = (
          <div className="flex items-start gap-3 py-3.5">
            <span aria-hidden className={`w-1 h-4 rounded-sm mt-1 shrink-0 ${b.rail}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-body-sm font-semibold text-fg-primary">
                  {b.label}
                  <span className="ml-2 text-meta text-fg-tertiary font-normal tnum" data-tabular>
                    {count}
                  </span>
                </p>
              </div>
              {top ? (
                <p className="text-meta text-fg-secondary leading-snug mt-1 truncate">
                  {'event' in top
                    ? `${top.event.name} · ${top.event.city}`
                    : `${top.concept.title} · ${top.concept.suggested_city}`}
                </p>
              ) : (
                <p className="text-meta text-fg-tertiary mt-1">Nothing matches this bucket.</p>
              )}
            </div>
          </div>
        )

        // Wire click only when a top item exists
        const canDrill = Boolean(top)
        const handleClick = () => {
          if (!top) return
          if (b.kind === 'create' && onCreateClick) onCreateClick(top as CreateDecision)
          else if (b.kind !== 'create' && onEventDecisionClick) onEventDecisionClick(top as EventDecision)
        }

        return (
          <li key={b.kind} className="first:-mt-3.5 last:-mb-3.5">
            {canDrill && (onEventDecisionClick || onCreateClick) ? (
              <button
                type="button"
                onClick={handleClick}
                className="w-full text-left hover:bg-surface-inset -mx-3 px-3 rounded-sm transition-colors duration-ui ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {rowBody}
              </button>
            ) : rowBody}
          </li>
        )
      })}
      <li className="pt-3">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-1.5 text-meta font-medium text-fg-secondary hover:text-fg-primary transition-colors duration-ui ease-out"
        >
          See full recommendations <ArrowRightIcon />
        </Link>
      </li>
    </ul>
  )
}
