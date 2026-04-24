'use client'

import { useDrill } from '@/context/DrillContext'
import { getMethodology, type MethodologyKind } from '@/lib/methodology'
import { InfoIcon } from '@/components/system/Icon'
import type { PortfolioEvent, EnrichedGapSlot, GapSeverity } from '@/types'

/**
 * Subtle "(i)" control next to any score. Click → drill panel opens
 * with formula, inputs, computation, thresholds, assumptions, and
 * pointer back to the source file. No magic numbers anywhere on the
 * platform — every score is defensible.
 */

interface Props {
  kind: MethodologyKind
  context?: {
    event?: PortfolioEvent
    gap?: EnrichedGapSlot
    severity?: GapSeverity
    avgScore?: number
    eventCount?: number
  }
  className?: string
  /** a11y label override */
  label?: string
}

const DEFAULT_LABELS: Record<MethodologyKind, string> = {
  'portfolio-score':     'How is the portfolio score computed?',
  'avg-portfolio-score': 'How is the average computed?',
  'gap-score':           'How is the gap score computed?',
  'gap-severity':        'How is severity assigned?',
  'decision-fund':       'How is Fund decided?',
  'decision-scale':      'How is Scale decided?',
  'decision-drop':       'How is Drop decided?',
  'decision-create':     'How are Create concepts generated?',
  'confidence-event':    'How is confidence derived?',
  'confidence-concept':  'How is confidence derived?',
}

export function MethodologyInfo({ kind, context, className = '', label }: Props) {
  const { open } = useDrill()
  const ariaLabel = label ?? DEFAULT_LABELS[kind]

  const handleClick = (e: React.MouseEvent) => {
    // Don't bubble into parent click-drills (portfolio table rows, decision rows, etc.)
    e.stopPropagation()
    const entry = getMethodology(kind, context)
    open({
      kind: 'methodology',
      eyebrow: 'Methodology',
      title: entry.title,
      entry,
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`inline-flex items-center justify-center text-fg-tertiary hover:text-accent transition-colors duration-ui ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm ${className}`}
    >
      <InfoIcon size={14} />
    </button>
  )
}
