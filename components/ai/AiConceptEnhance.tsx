'use client'
import { useState } from 'react'
import { useAiConcept } from '@/lib/hooks'
import { SparkleIcon } from '@/components/system/Icon'
import { AiBadge } from './AiBadge'
import type { EnrichedGapSlot } from '@/types'

/**
 * "Generate concept with AI" button — takes a gap slot, asks Claude to
 * propose a concrete concept, and renders it inline.
 *
 * Use case: concepts page, attached to each suggested gap row.
 */
export function AiConceptEnhance({ gap }: { gap: EnrichedGapSlot }) {
  const [open, setOpen] = useState(false)
  const { result, isLoading, error, run } = useAiConcept()

  async function handleClick() {
    setOpen(true)
    if (!result) await run(gap)
  }

  return (
    <div className="space-y-3">
      {!open && (
        <button
          type="button"
          onClick={handleClick}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-sm border border-accent/40 text-meta font-medium text-accent hover:bg-accent hover:text-accent-ink transition-colors duration-ui ease-out"
        >
          <SparkleIcon />
          Propose concept with AI
        </button>
      )}

      {open && (
        <article className="rounded-md border border-accent/30 bg-surface-card p-4 space-y-3">
          {isLoading && (
            <p className="text-meta text-fg-tertiary" aria-live="polite">Drafting concept…</p>
          )}
          {error && <p className="text-meta text-negative" role="alert">{error.message}</p>}
          {result && (
            <>
              <header className="flex items-start justify-between gap-3">
                <h4 className="text-body font-semibold text-fg-primary leading-snug">
                  {result.data.title}
                </h4>
                <AiBadge confidence={result.confidence} fallback={result.fallback} />
              </header>
              <div className="flex flex-wrap gap-2 text-meta text-fg-secondary">
                <span className="inline-flex items-center h-5 px-2 rounded-sm border border-subtle">
                  {result.data.format}
                </span>
                <span className="inline-flex items-center h-5 px-2 rounded-sm border border-subtle tnum" data-tabular>
                  {result.data.audience_estimate.toLocaleString()} audience
                </span>
              </div>
              <p className="text-body-sm text-fg-secondary leading-relaxed">{result.data.reason}</p>
              {result.data.risks && result.data.risks.length > 0 && (
                <div className="pt-2 border-t border-subtle">
                  <p className="text-eyebrow uppercase text-fg-tertiary mb-1">Risks</p>
                  <ul className="space-y-0.5">
                    {result.data.risks.map((r, i) => (
                      <li key={i} className="text-meta text-caution leading-snug">— {r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </article>
      )}
    </div>
  )
}
