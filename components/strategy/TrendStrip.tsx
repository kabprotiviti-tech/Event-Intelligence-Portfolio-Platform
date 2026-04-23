import type { TrendReport, TrendSignal } from '@/types'
import { TrendUpIcon, TrendFlatIcon, TrendDownIcon } from '@/components/system/Icon'

const DIR_ICON = {
  rising:    TrendUpIcon,
  stable:    TrendFlatIcon,
  declining: TrendDownIcon,
} as const

const DIR_TONE = {
  rising:    'text-positive border-positive/30',
  stable:    'text-fg-tertiary border-subtle',
  declining: 'text-negative border-negative/30',
} as const

export function TrendStrip({ trends }: { trends: TrendReport }) {
  return (
    <section
      aria-label="Category trends"
      className="rounded-md border border-subtle bg-surface-card px-6 py-5"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-eyebrow uppercase text-fg-tertiary">Trend Intelligence</p>
          <p className="text-body-sm text-fg-secondary mt-1">
            Last 6 months vs prior 6 months · source-weighted
          </p>
        </div>
        <ul className="flex flex-wrap items-center gap-2">
          {trends.signals.map(signal => <TrendPill key={signal.category} signal={signal} />)}
        </ul>
      </div>
      {trends.emerging_formats.length > 0 && (
        <div className="mt-4 pt-4 border-t border-subtle">
          <p className="text-eyebrow uppercase text-fg-tertiary mb-2">Emerging formats</p>
          <ul className="flex flex-wrap gap-2">
            {trends.emerging_formats.map(f => (
              <li
                key={f.format}
                className="inline-flex items-center gap-1.5 h-6 px-2 rounded-sm border border-positive/30 text-meta text-positive"
              >
                <TrendUpIcon />
                {f.format}
                <span className="font-mono text-fg-tertiary tnum" data-tabular>
                  +{Math.round(f.growth * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

function TrendPill({ signal }: { signal: TrendSignal }) {
  const Icon = DIR_ICON[signal.direction]
  const tone = DIR_TONE[signal.direction]
  const mom = Math.round(signal.momentum * 100)
  const sign = mom > 0 ? '+' : ''
  return (
    <li className={`inline-flex items-center gap-2 h-7 px-3 rounded-sm border ${tone}`}>
      <Icon />
      <span className="text-body-sm font-medium">{signal.category}</span>
      <span className="font-mono text-meta tnum" data-tabular>
        {sign}{mom}%
      </span>
    </li>
  )
}
