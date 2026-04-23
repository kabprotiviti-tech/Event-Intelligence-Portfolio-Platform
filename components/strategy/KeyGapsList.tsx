import type { EnrichedGapSlot, GapSeverity } from '@/types'
import { EmptyState } from '@/components/system/states'

const MONTHS = [
  '', 'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const SEVERITY_STYLE: Record<GapSeverity, string> = {
  Critical: 'border-negative/40 text-negative',
  Medium:   'border-caution/40 text-caution',
  Low:      'border-subtle text-fg-tertiary',
}

export function KeyGapsList({ gaps }: { gaps: EnrichedGapSlot[] }) {
  if (gaps.length === 0) {
    return <EmptyState title="No high-severity gaps." hint="Portfolio coverage is healthy across months." />
  }

  return (
    <ol className="divide-y divide-subtle">
      {gaps.map((g, i) => (
        <li key={`${g.month}-${g.category}`} className="py-3.5 first:pt-0 last:pb-0">
          <div className="flex items-start gap-3">
            <span
              className="font-mono text-meta text-fg-tertiary tnum mt-1 w-4 shrink-0"
              data-tabular
            >{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-body-sm text-fg-primary">
                  <span className="font-semibold">{MONTHS[g.month]}</span>
                  <span className="text-fg-tertiary mx-2">·</span>
                  {g.category}
                </p>
                <span
                  className={`inline-flex items-center h-5 px-2 rounded-sm border text-eyebrow uppercase font-semibold shrink-0 ${SEVERITY_STYLE[g.severity]}`}
                >
                  {g.severity}
                </span>
              </div>
              <p className="text-meta text-fg-secondary leading-snug mt-1">{g.competitor_context}</p>
              <p className="text-meta text-fg-tertiary italic leading-snug mt-0.5">{g.recommendation_hint}</p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
