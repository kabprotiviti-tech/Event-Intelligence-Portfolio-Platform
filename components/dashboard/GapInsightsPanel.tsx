import type { EnrichedGapReport, GapSeverity } from '@/types'
import { Skeleton, EmptyState } from '@/components/system/states'

const MONTH_NAMES = [
  '', 'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const SEVERITY_STYLES: Record<GapSeverity, string> = {
  Critical: 'border-negative/40 text-negative',
  Medium:   'border-caution/40 text-caution',
  Low:      'border-subtle text-fg-tertiary',
}

export function GapInsightsPanel({ report }: { report: EnrichedGapReport | null | undefined }) {
  if (!report) return <Skeleton height="h-24" label="Loading gap insights" />

  const { summary } = report
  const topGaps = report.slots
    .filter(s => s.severity !== 'Low')
    .sort((a, b) => b.gap_score - a.gap_score)
    .slice(0, 4)

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-3 gap-3">
        <SummaryCell term="Emptiest Month"    def={MONTH_NAMES[summary.emptiest_month]} />
        <SummaryCell term="Weakest Category"  def={summary.emptiest_category} tone="caution" />
        <SummaryCell term="Total Gaps"        def={`${summary.total_gaps} slots`} />
      </dl>

      {topGaps.length === 0 ? (
        <EmptyState title="No significant gaps detected." hint="This scope is already well-served." />
      ) : (
        <ul className="space-y-3">
          {topGaps.map(s => (
            <li
              key={`${s.month}-${s.category}`}
              className="rounded-sm border border-subtle bg-surface-card px-4 py-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-body-sm text-fg-primary">
                    <span className="font-semibold">{MONTH_NAMES[s.month]}</span>
                    <span className="text-fg-tertiary mx-2">·</span>
                    {s.category}
                  </p>
                </div>
                <SeverityPill severity={s.severity} />
              </div>
              <p className="text-meta text-fg-secondary leading-snug">{s.competitor_context}</p>
              <p className="text-meta text-fg-tertiary italic leading-snug">{s.recommendation_hint}</p>
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 h-1 rounded-sm bg-surface-inset" aria-hidden>
                  <div
                    className="h-full rounded-sm bg-accent"
                    style={{ width: `${s.gap_score * 100}%` }}
                  />
                </div>
                <span className="text-meta text-fg-tertiary w-10 text-right tnum" data-tabular>
                  {Math.round(s.gap_score * 100)}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SummaryCell({ term, def, tone = 'neutral' }: { term: string; def: string; tone?: 'neutral' | 'caution' }) {
  const toneCls = tone === 'caution' ? 'text-caution' : 'text-fg-primary'
  return (
    <div className="rounded-sm bg-surface-inset border border-subtle p-3">
      <dt className="text-eyebrow uppercase text-fg-tertiary">{term}</dt>
      <dd className={`text-body font-semibold mt-1 ${toneCls}`}>{def}</dd>
    </div>
  )
}

function SeverityPill({ severity }: { severity: GapSeverity }) {
  return (
    <span
      className={`inline-flex items-center h-5 px-2 rounded-sm border text-eyebrow uppercase font-semibold ${SEVERITY_STYLES[severity]}`}
    >
      {severity}
    </span>
  )
}
