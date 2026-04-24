interface Props {
  label: string
  value: string | number
  sub?: string
  trend?: { direction: 'up' | 'down' | 'flat'; value: string }
  priority?: boolean
  onClick?: () => void
  clickHint?: string   // e.g., "View all events"
  /** Small inline slot beside the label — typically a MethodologyInfo button. */
  infoSlot?: React.ReactNode
}

/**
 * Data-first KPI block. No gradients, no icons, no trend chips.
 * Priority = 2px left rail in accent. When `onClick` is provided, the card
 * becomes a button with a quiet hint so the Director knows it's drillable.
 */
export function StatCard({ label, value, sub, trend, priority, onClick, clickHint, infoSlot }: Props) {
  const body = (
    <>
      {priority && (
        <div aria-hidden className="absolute top-0 bottom-0 left-0 w-[2px] bg-accent rounded-sm" />
      )}
      <div className="flex items-center justify-between gap-2">
        <p className="text-eyebrow uppercase text-fg-tertiary">{label}</p>
        {infoSlot}
      </div>
      <p className="text-display font-semibold text-fg-primary mt-3 tnum leading-none" data-tabular>
        {value}
      </p>
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
      {onClick && clickHint && (
        <p className="text-eyebrow uppercase text-fg-tertiary mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-ui ease-out">
          {clickHint} →
        </p>
      )}
    </>
  )

  const baseCls = 'relative rounded-md border bg-surface-card p-5 transition-all duration-ui ease-out'

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseCls} border-subtle hover:border-strong hover:-translate-y-px text-left w-full group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
      >
        {body}
      </button>
    )
  }

  return <div className={`${baseCls} border-subtle`}>{body}</div>
}
