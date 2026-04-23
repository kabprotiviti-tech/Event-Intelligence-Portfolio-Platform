interface Props {
  label: string
  value: string | number
  sub?: string
  trend?: { direction: 'up' | 'down' | 'flat'; value: string }
  priority?: boolean
}

/**
 * Data-first KPI block. No gradients, no icons, no trend chips.
 * The *only* expression of priority is a 2px left rail in accent.
 */
export function StatCard({ label, value, sub, trend, priority }: Props) {
  return (
    <div className="relative rounded-md border border-subtle bg-surface-card p-5 transition-colors duration-ui ease-out hover:border-strong">
      {priority && (
        <div aria-hidden className="absolute top-0 bottom-0 left-0 w-[2px] bg-accent rounded-sm" />
      )}
      <p className="text-eyebrow uppercase text-fg-tertiary">{label}</p>
      <p className="text-display font-semibold text-fg-primary mt-3 tnum leading-none" data-tabular>
        {value}
      </p>
      {(sub || trend) && (
        <div className="flex items-center gap-2 mt-3 text-meta text-fg-tertiary">
          {sub && <span>{sub}</span>}
          {trend && (
            <span
              className={
                trend.direction === 'up' ? 'text-positive' :
                trend.direction === 'down' ? 'text-negative' : 'text-fg-tertiary'
              }
            >
              {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '−' : ''}{trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
