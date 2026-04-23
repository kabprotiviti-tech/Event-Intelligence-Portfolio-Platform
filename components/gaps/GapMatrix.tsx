'use client'
import type { GapReport, Category } from '@/types'

/**
 * AD-anchored competitive gap matrix.
 *
 * Rules:
 *   - Abu Dhabi is the primary row, always. Comparison city feeds colouring.
 *   - Cell color = competitive position, not absolute density:
 *       behind   → negative tint (opportunity to compete)
 *       matching → neutral
 *       leading  → positive tint
 *       empty-both → inset (uncontested window)
 *   - Cells are clickable — parent handles drill-down.
 */

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const CATEGORIES: Category[] = ['Family','Entertainment','Sports']

type CellTone = 'behind-critical' | 'behind' | 'matching' | 'leading' | 'empty-both'

const TONE_STYLE: Record<CellTone, string> = {
  'behind-critical': 'bg-negative/80 text-white hover:bg-negative',
  'behind':          'bg-negative/25 text-negative hover:bg-negative/35',
  'matching':        'bg-surface-inset text-fg-secondary hover:bg-surface-card',
  'leading':         'bg-positive/15 text-positive hover:bg-positive/25',
  'empty-both':      'bg-surface-inset text-fg-tertiary hover:bg-surface-card',
}

interface SelectedCell {
  month: number
  category: Category
}

interface Props {
  adReport: GapReport
  comparisonReport: GapReport
  onCellClick?: (cell: SelectedCell) => void
  selectedCell?: SelectedCell | null
}

export function GapMatrix({ adReport, comparisonReport, onCellClick, selectedCell }: Props) {
  const compCity = comparisonReport.city
  const totalBehind = countBehind(adReport, comparisonReport)

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-body-sm font-semibold text-fg-primary">
            Abu Dhabi <span className="text-fg-tertiary font-normal">vs</span> {compCity}
          </p>
          <p className="text-meta text-fg-tertiary mt-0.5">
            Cells read from Abu Dhabi's perspective · click any cell to drill down
          </p>
        </div>
        <div className="flex items-center gap-4 text-meta">
          <span>
            <span className="text-negative font-semibold tnum" data-tabular>{totalBehind}</span>
            <span className="text-fg-tertiary"> slots where AD is behind</span>
          </span>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-meta border-separate border-spacing-1" data-tabular>
          <thead>
            <tr>
              <th scope="col" className="text-left text-fg-tertiary font-medium w-28" />
              {MONTHS.map(m => (
                <th key={m} scope="col" className="text-fg-tertiary font-medium text-center w-11">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map(cat => (
              <tr key={cat}>
                <th scope="row" className="text-left text-fg-secondary pr-2 font-medium">{cat}</th>
                {MONTHS.map((_, i) => {
                  const month = i + 1
                  const ad = adReport.slots.find(s => s.month === month && s.category === cat)
                  const comp = comparisonReport.slots.find(s => s.month === month && s.category === cat)
                  const adCount = ad?.event_count ?? 0
                  const compCount = comp?.event_count ?? 0
                  const delta = adCount - compCount
                  const tone = toneOf(adCount, compCount)
                  const isSelected = selectedCell?.month === month && selectedCell?.category === cat
                  const title = `${cat} · ${MONTHS[i]}: AD ${adCount} vs ${compCity} ${compCount}${
                    delta < 0 ? ` (behind by ${-delta})` : delta > 0 ? ` (leading by ${delta})` : ''
                  }`

                  const body = (
                    <div
                      className={`flex items-center justify-center gap-0.5 w-full h-9 rounded-sm font-medium transition-colors duration-ui ease-out ${TONE_STYLE[tone]} ${
                        isSelected ? 'ring-2 ring-accent ring-offset-1 ring-offset-surface-card' : ''
                      } ${onCellClick ? 'cursor-pointer' : ''}`}
                      title={title}
                    >
                      <span className="tnum" data-tabular>{adCount || '—'}</span>
                      <span className="opacity-50 mx-0.5" aria-hidden>·</span>
                      <span className="opacity-60 tnum" data-tabular>{compCount || '—'}</span>
                    </div>
                  )

                  return (
                    <td key={i} className="text-center p-0">
                      {onCellClick ? (
                        <button
                          type="button"
                          onClick={() => onCellClick({ month, category: cat })}
                          className="block w-full rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                          aria-label={title}
                          aria-pressed={isSelected}
                        >
                          {body}
                        </button>
                      ) : body}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <LegendRow compCity={compCity} />
    </div>
  )
}

function LegendRow({ compCity }: { compCity: string }) {
  return (
    <div className="flex flex-wrap gap-4 text-meta text-fg-tertiary">
      <LegendItem swatch="bg-negative" label={`AD behind (critical)`} />
      <LegendItem swatch="bg-negative/25" label="AD behind" />
      <LegendItem swatch="bg-surface-inset border border-subtle" label="matched or empty-both" />
      <LegendItem swatch="bg-positive/15" label="AD leading" />
      <span className="ml-auto italic">
        Each cell reads <span className="font-mono">AD · {compCity[0]}</span>
      </span>
    </div>
  )
}

function LegendItem({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded-sm inline-block ${swatch}`} aria-hidden />
      {label}
    </span>
  )
}

// ── helpers ─────────────────────────────────────────────────

function toneOf(ad: number, comp: number): CellTone {
  if (ad === 0 && comp === 0) return 'empty-both'
  const delta = ad - comp
  if (delta > 0)  return 'leading'
  if (delta === 0) return 'matching'
  const deficit = -delta
  return (deficit >= 2 || ad === 0) ? 'behind-critical' : 'behind'
}

function countBehind(ad: GapReport, comp: GapReport): number {
  let n = 0
  for (const slot of ad.slots) {
    const other = comp.slots.find(s => s.month === slot.month && s.category === slot.category)
    if (!other) continue
    if (slot.event_count < other.event_count) n++
  }
  return n
}
