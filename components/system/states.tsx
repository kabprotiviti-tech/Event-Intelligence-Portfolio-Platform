/**
 * Reusable loading / error / empty states.
 * Token-driven, keyboard-friendly, no decorative shapes.
 */

interface SkeletonProps {
  height?: string           // Tailwind height class, e.g., "h-24"
  className?: string
  label?: string            // for screen readers
}

export function Skeleton({ height = 'h-24', className = '', label = 'Loading' }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={`${height} rounded-sm bg-surface-inset animate-pulse ${className}`}
    />
  )
}

export function SkeletonRows({ count = 3, height = 'h-10' }: { count?: number; height?: string }) {
  return (
    <div role="status" aria-label="Loading" className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${height} rounded-sm bg-surface-inset animate-pulse`} />
      ))}
    </div>
  )
}

export function ErrorFallback({
  error, onRetry, compact = false,
}: {
  error?: Error | string
  onRetry?: () => void
  compact?: boolean
}) {
  const msg = typeof error === 'string' ? error : error?.message ?? 'Something went wrong.'
  return (
    <div
      role="alert"
      className={`rounded-md border border-negative/40 bg-surface-card ${compact ? 'p-3' : 'p-6'}`}
    >
      <p className="text-eyebrow uppercase text-negative mb-1">Error</p>
      <p className={`${compact ? 'text-body-sm' : 'text-body'} text-fg-primary`}>{msg}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex items-center h-8 px-3 rounded-sm border border-subtle hover:border-strong text-meta font-medium text-fg-secondary hover:text-fg-primary transition-colors duration-ui ease-out"
        >
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({
  title, hint, className = '',
}: {
  title: string
  hint?: string
  className?: string
}) {
  return (
    <div className={`rounded-md border border-dashed border-subtle bg-surface-card p-10 text-center ${className}`}>
      <p className="text-body-sm text-fg-secondary">{title}</p>
      {hint && <p className="text-meta text-fg-tertiary mt-1">{hint}</p>}
    </div>
  )
}
