import { useState, useCallback } from 'react'
import useSWR from 'swr'
import type {
  AiResult, AiConceptPayload, AiExplanationPayload,
  AiSummaryPayload, AiTrendsPayload,
} from '@/lib/ai/types'
import type {
  City, Category, EnrichedGapSlot, PortfolioEvent, EventDecision,
} from '@/types'
import { fetcher, qs } from './fetcher'

/**
 * Auto-loading hooks — fetch on mount and when deps change.
 */

export function useAiSummary(opts: { city?: City; category?: Category | 'All' | null } = {}) {
  const url = `/api/ai/summary${qs({
    city: opts.city ?? 'Abu Dhabi',
    category: opts.category ?? undefined,
  })}`
  const { data, error, isLoading, mutate } = useSWR<{ data: AiResult<AiSummaryPayload> }>(
    url, fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60_000 }   // AI calls are pricey — longer dedupe
  )
  return { summary: data?.data, isLoading, error: error as Error | undefined, mutate }
}

export function useAiTrends() {
  const { data, error, isLoading, mutate } = useSWR<{ data: AiResult<AiTrendsPayload> }>(
    '/api/ai/trends', fetcher,
    { revalidateOnFocus: false, dedupingInterval: 5 * 60_000 }  // trends rarely change
  )
  return { trends: data?.data, isLoading, error: error as Error | undefined, mutate }
}

/**
 * On-demand hooks — call when the user clicks a button.
 * No SWR because these are user-initiated and we want explicit loading state.
 */

interface AsyncState<T> {
  result: AiResult<T> | null
  isLoading: boolean
  error: Error | null
}

export function useAiExplain() {
  const [state, setState] = useState<AsyncState<AiExplanationPayload>>({
    result: null, isLoading: false, error: null,
  })

  const run = useCallback(async (event: PortfolioEvent, decision: EventDecision['kind']) => {
    setState({ result: null, isLoading: true, error: null })
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, decision }),
      })
      if (!res.ok) throw new Error(`Explain failed (${res.status})`)
      const json = (await res.json()) as { data: AiResult<AiExplanationPayload> }
      setState({ result: json.data, isLoading: false, error: null })
    } catch (err) {
      setState({ result: null, isLoading: false, error: err as Error })
    }
  }, [])

  const reset = useCallback(() => {
    setState({ result: null, isLoading: false, error: null })
  }, [])

  return { ...state, run, reset }
}

export function useAiConcept() {
  const [state, setState] = useState<AsyncState<AiConceptPayload>>({
    result: null, isLoading: false, error: null,
  })

  const run = useCallback(async (gap: EnrichedGapSlot) => {
    setState({ result: null, isLoading: true, error: null })
    try {
      const res = await fetch('/api/ai/concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gap }),
      })
      if (!res.ok) throw new Error(`Concept generation failed (${res.status})`)
      const json = (await res.json()) as { data: AiResult<AiConceptPayload> }
      setState({ result: json.data, isLoading: false, error: null })
    } catch (err) {
      setState({ result: null, isLoading: false, error: err as Error })
    }
  }, [])

  const reset = useCallback(() => setState({ result: null, isLoading: false, error: null }), [])

  return { ...state, run, reset }
}
