'use client'
import { useState } from 'react'
import { useAiExplain } from '@/lib/hooks'
import { SparkleIcon, CloseIcon } from '@/components/system/Icon'
import { AiBadge } from './AiBadge'
import type { PortfolioEvent, EventDecision } from '@/types'

/**
 * Small sparkle button that expands into an AI-generated explanation card.
 * Used inline inside decision rows (Fund / Scale / Drop). Click → fetch →
 * render explanation + 2-3 bullets + confidence badge.
 */
export function AiExplainButton({
  event, decision,
}: {
  event: PortfolioEvent
  decision: EventDecision['kind']
}) {
  const [open, setOpen] = useState(false)
  const { result, isLoading, error, run, reset } = useAiExplain()

  async function toggle() {
    if (open) {
      setOpen(false)
      reset()
      return
    }
    setOpen(true)
    if (!result) await run(event, decision)
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="inline-flex items-center gap-1 text-meta text-fg-secondary hover:text-fg-primary transition-colors duration-ui ease-out"
      >
        {open
          ? <><CloseIcon /> Close AI</>
          : <><SparkleIcon /> Explain with AI</>
        }
      </button>

      {open && (
        <div className="mt-3 rounded-sm border border-accent/30 bg-surface-inset p-3 space-y-2">
          {isLoading && (
            <p className="text-meta text-fg-tertiary" aria-live="polite">
              Generating explanation…
            </p>
          )}
          {error && (
            <p className="text-meta text-negative" role="alert">
              {error.message}
            </p>
          )}
          {result && (
            <>
              <div className="flex items-start justify-between gap-2">
                <p className="text-body-sm text-fg-primary font-medium leading-snug">
                  {result.data.explanation}
                </p>
                <AiBadge
                  confidence={result.confidence}
                  fallback={result.fallback}
                  className="shrink-0"
                />
              </div>
              {result.data.bullet_reasons.length > 0 && (
                <ul className="space-y-0.5 pt-1">
                  {result.data.bullet_reasons.map((b, i) => (
                    <li key={i} className="text-meta text-fg-secondary leading-snug">— {b}</li>
                  ))}
                </ul>
              )}
              {result.data.caveats && result.data.caveats.length > 0 && (
                <div className="pt-2 mt-2 border-t border-subtle">
                  <p className="text-eyebrow uppercase text-fg-tertiary mb-1">Caveats</p>
                  <ul className="space-y-0.5">
                    {result.data.caveats.map((c, i) => (
                      <li key={i} className="text-meta text-caution leading-snug">— {c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}
