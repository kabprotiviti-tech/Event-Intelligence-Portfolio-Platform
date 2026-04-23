import type { PortfolioHealth } from '@/types'
import { TrendUpIcon, TrendFlatIcon, TrendDownIcon } from '@/components/system/Icon'

const LABEL_TONE = {
  Strong:    'text-positive',
  Solid:     'text-fg-primary',
  'At risk': 'text-caution',
  Weak:      'text-negative',
} as const

const TRAJECTORY_ICON = {
  improving: TrendUpIcon,
  stable:    TrendFlatIcon,
  declining: TrendDownIcon,
} as const

const TRAJECTORY_TONE = {
  improving: 'text-positive',
  stable:    'text-fg-tertiary',
  declining: 'text-negative',
} as const

export function PortfolioHealthCard({ health }: { health: PortfolioHealth }) {
  const Icon = TRAJECTORY_ICON[health.trajectory]

  return (
    <section
      aria-label="Portfolio health"
      className="rounded-md border border-subtle bg-surface-card p-7"
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
        <div className="min-w-0 shrink-0">
          <p className="text-eyebrow uppercase text-fg-tertiary">Portfolio Health</p>
          <div className="flex items-baseline gap-4 mt-3">
            <span className="text-display font-semibold text-fg-primary tnum leading-none" data-tabular>
              {health.score.toFixed(1)}
            </span>
            <span className="text-meta text-fg-tertiary">/ 10</span>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <span className={`text-h2 font-semibold ${LABEL_TONE[health.label]}`}>
              {health.label}
            </span>
            <span aria-hidden className="text-fg-tertiary">·</span>
            <span className={`inline-flex items-center gap-1.5 text-body-sm ${TRAJECTORY_TONE[health.trajectory]}`}>
              <Icon />
              {health.trajectory}
            </span>
          </div>
        </div>

        <ul className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-w-xl">
          {health.factors.map((f, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-body-sm text-fg-secondary"
            >
              <span
                aria-hidden
                className={`mt-2 w-1.5 h-1.5 rounded-sm shrink-0 ${
                  f.signal === 'positive' ? 'bg-positive'
                : f.signal === 'negative' ? 'bg-negative'
                :                           'bg-fg-tertiary'
                }`}
              />
              <span>{f.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
