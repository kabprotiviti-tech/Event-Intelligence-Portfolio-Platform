import type { GapReport } from '@/types'

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function GapInsightsPanel({ report }: { report: GapReport | null }) {
  if (!report) {
    return (
      <div
        className="h-24 rounded-sm bg-surface-inset animate-pulse"
        role="status"
        aria-label="Loading gap insights"
      />
    )
  }

  const { summary } = report
  const topGaps = report.slots
    .filter(s => s.density === 'empty' || s.density === 'light')
    .sort((a, b) => b.gap_score - a.gap_score)
    .slice(0, 4)

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-3 gap-3">
        <SummaryCell term="Emptiest Month" def={MONTH_NAMES[summary.emptiest_month]} tone="accent" />
        <SummaryCell term="Weakest Category" def={summary.emptiest_category} tone="caution" />
        <SummaryCell term="Total Gaps" def={`${summary.total_gaps} slots`} tone="neutral" />
      </dl>

      {topGaps.length === 0 ? (
        <p className="text-meta text-fg-tertiary">
          No significant gaps detected for this scope.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {topGaps.map(s => (
            <li
              key={`${s.month}-${s.category}`}
              className="flex items-center justify-between rounded-sm bg-surface-card border border-subtle px-3 h-9 text-body-sm"
            >
              <span className="text-fg-secondary">
                <span className="font-medium text-fg-primary">{MONTH_NAMES[s.month]}</span>
                <span className="text-fg-tertiary mx-2">·</span>
                {s.category}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1 rounded-sm bg-surface-inset" aria-hidden>
                  <div className="h-full rounded-sm bg-accent" style={{ width: `${s.gap_score * 100}%` }} />
                </div>
                <span className="text-meta text-fg-tertiary w-8 text-right tnum" data-tabular>
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

function SummaryCell({ term, def, tone }: { term: string; def: string; tone: 'accent' | 'caution' | 'neutral' }) {
  const toneClass = tone === 'accent' ? 'text-fg-primary'
                  : tone === 'caution' ? 'text-caution'
                  : 'text-fg-primary'
  return (
    <div className="rounded-sm bg-surface-inset border border-subtle p-3">
      <dt className="text-eyebrow uppercase text-fg-tertiary">{term}</dt>
      <dd className={`text-body font-semibold mt-1 ${toneClass}`}>{def}</dd>
    </div>
  )
}
