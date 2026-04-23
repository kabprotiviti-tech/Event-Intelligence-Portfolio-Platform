import Link from 'next/link'
import type { DecisionPanel, DecisionKind } from '@/types'
import { Skeleton, EmptyState } from '@/components/system/states'
import { ArrowRightIcon } from '@/components/system/Icon'

/**
 * Compact dashboard view of the decision engine output.
 * Shows the top item per bucket only — Director's glance read.
 * Deep-dive on /portfolio.
 */

const BUCKETS: Array<{ kind: DecisionKind; label: string; rail: string }> = [
  { kind: 'fund',   label: 'Fund',    rail: 'bg-positive' },
  { kind: 'scale',  label: 'Scale',   rail: 'bg-accent'   },
  { kind: 'drop',   label: 'Drop',    rail: 'bg-negative' },
  { kind: 'create', label: 'Create',  rail: 'bg-info'     },
]

export function DecisionSummary({ data }: { data: DecisionPanel | null | undefined }) {
  if (!data) return <Skeleton height="h-40" label="Loading recommended actions" />

  const totalCount = data.fund.length + data.scale.length + data.drop.length + data.create.length
  if (totalCount === 0) {
    return <EmptyState title="No decisions available." hint="Events or filters need adjustment." />
  }

  return (
    <ul className="divide-y divide-subtle">
      {BUCKETS.map(b => {
        const top =
          b.kind === 'fund'   ? data.fund[0]
        : b.kind === 'scale'  ? data.scale[0]
        : b.kind === 'drop'   ? data.drop[0]
        :                       data.create[0]
        const count =
          b.kind === 'fund'   ? data.fund.length
        : b.kind === 'scale'  ? data.scale.length
        : b.kind === 'drop'   ? data.drop.length
        :                       data.create.length

        return (
          <li key={b.kind} className="py-3.5 first:pt-0 last:pb-0">
            <div className="flex items-start gap-3">
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
