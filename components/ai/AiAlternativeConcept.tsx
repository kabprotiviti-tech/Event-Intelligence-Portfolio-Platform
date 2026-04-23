'use client'
import { useState } from 'react'
import { SparkleIcon } from '@/components/system/Icon'
import { AiBadge } from './AiBadge'
import type { Category, City } from '@/types'
import type { AiResult, AiConceptPayload } from '@/lib/ai/types'

/**
 * Inline AI alternative on a rule-based concept card.
 * User sees the rule concept by default. Clicking this asks Claude for
 * an alternative grounded in the same (city, month, category) slot.
 */
export function AiAlternativeConcept({
  city, month, category,
}: {
  city: City
  month: number
  category: Category
}) {
  const [state, setState] = useState<{
    result: AiResult<AiConceptPayload> | null
    loading: boolean
    error: string | null
    open: boolean
  }>({ result: null, loading: false, error: null, open: false })

  async function handleClick() {
    if (state.open) {
      setState(s => ({ ...s, open: false }))
      return
    }
    if (state.result) {
      setState(s => ({ ...s, open: true }))
      return
    }
    setState({ result: null, loading: true, error: null, open: true })
    try {
      const res = await fetch('/api/ai/concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, month, category }),
      })
      if (!res.ok) throw new Error(`AI request failed (${res.status})`)
      const json = (await res.json()) as { data: AiResult<AiConceptPayload> }
      setState({ result: json.data, loading: false, error: null, open: true })
    } catch (err) {
      setState({ result: null, loading: false, error: (err as Error).message, open: true })
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 text-meta font-medium text-accent hover:opacity-80 transition-opacity duration-ui ease-out"
      >
        <SparkleIcon />
        {state.open ? 'Hide AI alternative' : 'Propose AI alternative'}
      </button>

      {state.open && (
        <div className="rounded-sm border border-accent/30 bg-surface-inset p-3 space-y-2">
          {state.loading && (
            <p className="text-meta text-fg-tertiary" aria-live="polite">Drafting alternative…</p>
          )}
          {state.error && <p className="text-meta text-negative" role="alert">{state.error}</p>}
          {state.result && (
            <>
              <div className="flex items-start justify-between gap-2">
                <p className="text-body-sm font-semibold text-fg-primary leading-snug">
                  {state.result.data.title}
                </p>
                <AiBadge
                  confidence={state.result.confidence}
                  fallback={state.result.fallback}
                  className="shrink-0"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center h-5 px-2 rounded-sm border border-subtle text-meta text-fg-secondary">
                  {state.result.data.format}
                </span>
                <span className="inline-flex items-center h-5 px-2 rounded-sm border border-subtle text-meta text-fg-secondary tnum" data-tabular>
                  {state.result.data.audience_estimate.toLocaleString()} audience
                </span>
              </div>
              <p className="text-meta text-fg-secondary leading-snug">{state.result.data.reason}</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
