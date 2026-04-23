'use client'
import type { PortfolioEvent } from '@/types'
import { CategoryBadge } from '@/components/ui/Badge'
import { SourceBadge } from '@/components/ui/SourceBadge'
import { useDrill } from '@/context/DrillContext'

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 10) * 100
  const tone =
    score >= 8 ? 'bg-accent'
  : score >= 6 ? 'bg-fg-secondary'
  :             'bg-border-strong'
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1 rounded-sm bg-surface-inset" aria-hidden>
        <div className={`h-full rounded-sm ${tone}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-body-sm text-fg-primary font-medium w-6 tnum" data-tabular>
        {score.toFixed(1)}
      </span>
    </div>
  )
}

const HEADERS = [
  { id: 'name',       label: 'Event',      align: 'left'  },
  { id: 'category',   label: 'Category',   align: 'left'  },
  { id: 'city',       label: 'City',       align: 'left'  },
  { id: 'date',       label: 'Date',       align: 'left'  },
  { id: 'source',     label: 'Source',     align: 'left'  },
  { id: 'attendance', label: 'Attendance', align: 'right' },
  { id: 'score',      label: 'Score',      align: 'left'  },
  { id: 'budget',     label: 'Budget',     align: 'right' },
] as const

export function PortfolioTable({ events }: { events: PortfolioEvent[] }) {
  const { open } = useDrill()

  if (events.length === 0) {
    return (
      <div className="py-10 text-center border border-dashed border-subtle rounded-md">
        <p className="text-body-sm text-fg-secondary">No events match this filter.</p>
        <p className="text-meta text-fg-tertiary mt-1">Switch tab or city scope to see portfolio.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-body" data-tabular>
        <thead>
          <tr className="border-b border-subtle">
            {HEADERS.map(h => (
              <th
                key={h.id}
                scope="col"
                className={`text-eyebrow font-semibold uppercase text-fg-tertiary pb-3 pr-4 ${h.align === 'right' ? 'text-right' : 'text-left'}`}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {events.map(e => (
            <tr
              key={e.id}
              onClick={() => open({
                kind: 'event-detail',
                eyebrow: 'Event detail',
                title: e.name,
                event: e,
              })}
              className="border-b border-subtle last:border-0 hover:bg-surface-inset transition-colors duration-ui ease-out cursor-pointer"
            >
              <td className="py-3 pr-4 font-medium text-fg-primary max-w-[240px] truncate">
                <div className="flex items-center gap-2">
                  {e.status === 'Proposed' && (
                    <span
                      className="inline-flex items-center h-4 px-1.5 rounded-sm border border-accent/40 text-eyebrow uppercase text-accent shrink-0"
                      title="Proposed from an approved concept"
                    >
                      New
                    </span>
                  )}
                  <span className="truncate">{e.name}</span>
                </div>
              </td>
              <td className="py-3 pr-4"><CategoryBadge category={e.category} /></td>
              <td className="py-3 pr-4 text-fg-secondary">{e.city}</td>
              <td className="py-3 pr-4 text-fg-tertiary text-body-sm tnum">
                {new Date(e.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              </td>
              <td className="py-3 pr-4">
                <SourceBadge
                  source_type={e.source_type}
                  verification_level={e.verification_level}
                  source_label={e.source_label}
                  compact
                />
              </td>
              <td className="py-3 pr-4 text-fg-secondary text-right tnum">
                {e.estimated_attendance.toLocaleString()}
              </td>
              <td className="py-3 pr-4"><ScoreBar score={e.portfolio_score} /></td>
              <td className="py-3 text-fg-secondary text-right tnum">
                {e.budget_allocated ? `AED ${(e.budget_allocated / 1_000_000).toFixed(1)}M` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
