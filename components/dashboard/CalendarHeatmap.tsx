'use client'
import type { GapReport, Category } from '@/types'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const CATEGORIES: Category[] = ['Family','Entertainment','Sports']

const DENSITY_CELL: Record<string, string> = {
  empty:    'bg-gap-empty    text-fg-tertiary',
  light:    'bg-gap-light    text-fg-primary',
  moderate: 'bg-gap-moderate text-accent-ink',
  heavy:    'bg-gap-heavy    text-accent-ink',
}

const DENSITY_LEGEND = [
  { id: 'empty',    label: 'Empty' },
  { id: 'light',    label: 'Light' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'heavy',    label: 'Heavy' },
] as const

interface Props {
  report: GapReport | null | undefined
  onCellClick?: (cell: { month: number; category: Category }) => void
}

export function CalendarHeatmap({ report, onCellClick }: Props) {
  if (!report) {
    return (
      <div
        className="h-40 rounded-sm bg-surface-inset animate-pulse"
        role="status"
        aria-label="Loading calendar"
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-meta border-separate border-spacing-1" data-tabular>
        <thead>
          <tr>
            <th scope="col" className="text-left text-fg-tertiary font-medium w-24 pb-1">
              <span className="sr-only">Category</span>
            </th>
            {MONTHS.map(m => (
              <th key={m} scope="col" className="text-fg-tertiary font-medium text-center pb-1 w-10">{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.map(cat => (
            <tr key={cat}>
              <th scope="row" className="text-fg-secondary font-medium py-1 pr-2 text-left">
                {cat}
              </th>
              {MONTHS.map((_, i) => {
                const month = i + 1
                const slot = report.slots.find(s => s.month === month && s.category === cat)
                const density = slot?.density ?? 'empty'
                const count = slot?.event_count ?? 0
                const title = `${cat} · ${MONTHS[i]}: ${count} event${count === 1 ? '' : 's'} (${density})`

                const body = (
                  <div
                    className={`rounded-sm w-9 h-8 flex items-center justify-center font-medium mx-auto tnum transition-opacity duration-ui ease-out ${DENSITY_CELL[density]} ${onCellClick ? 'hover:opacity-80' : ''}`}
                  >
                    {count || '—'}
                  </div>
                )

                return (
                  <td key={i} className="text-center p-0">
                    {onCellClick ? (
                      <button
                        type="button"
                        onClick={() => onCellClick({ month, category: cat })}
                        title={title}
                        aria-label={title}
                        className="block w-full rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        {body}
                      </button>
                    ) : (
                      <div title={title}>{body}</div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-wrap gap-4 mt-3 text-meta text-fg-tertiary">
        {DENSITY_LEGEND.map(({ id, label }) => (
          <span key={id} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-sm inline-block bg-gap-${id}`} aria-hidden />
            {label}
          </span>
        ))}
        {onCellClick && (
          <span className="ml-auto italic">Click any cell for drill-down</span>
        )}
      </div>
    </div>
  )
}
