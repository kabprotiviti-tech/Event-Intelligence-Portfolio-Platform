import type { DecisionConfidence } from '@/types'
import { SparkleIcon } from '@/components/system/Icon'

const CONF: Record<DecisionConfidence, string> = {
  High:   'border-positive/40 text-positive',
  Medium: 'border-caution/40 text-caution',
  Low:    'border-subtle text-fg-tertiary',
}

/**
 * Provenance chip — surfaces whether the narrative came from Claude or
 * a deterministic fallback, plus confidence. Never hidden — the director
 * sees at a glance whether they're reading model output or rule output.
 */
export function AiBadge({
  confidence, fallback, className = '',
}: {
  confidence: DecisionConfidence
  fallback: boolean
  className?: string
}) {
  if (fallback) {
    return (
      <span
        className={`inline-flex items-center h-5 px-2 rounded-sm border border-subtle text-eyebrow uppercase text-fg-tertiary ${className}`}
        title="Narrative from deterministic rules (Claude unavailable or key unset)"
      >
        Rule-based
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1 h-5 px-2 rounded-sm border text-eyebrow uppercase ${CONF[confidence]} ${className}`}
      title={`Claude · confidence: ${confidence}`}
    >
      <SparkleIcon />
      AI · {confidence}
    </span>
  )
}
