import useSWR, { mutate as globalMutate } from 'swr'
import type { ApiResponse, PortfolioBundle, EventConcept, Category, City } from '@/types'
import { fetcher, qs } from './fetcher'

interface UsePortfolioFilters {
  city?: City | null
  category?: Category | 'All' | null
  budget?: number
}

export function usePortfolio(filters: UsePortfolioFilters = {}) {
  const url = `/api/portfolio${qs({
    city: filters.city ?? undefined,
    category: filters.category ?? undefined,
    budget: filters.budget,
  })}`

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<PortfolioBundle>>(
    url, fetcher, {
      revalidateOnFocus: false,
      dedupingInterval: 2_000,
    }
  )

  return {
    bundle: data?.data,
    isLoading,
    error: error as Error | undefined,
    mutate,
  }
}

/**
 * Approve a concept → creates a Proposed event on the server.
 * Revalidates every portfolio query so all views reflect the change.
 */
export async function approveConcept(concept: EventConcept) {
  const res = await fetch('/api/portfolio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ concept }),
  })
  if (!res.ok) {
    const msg = await res.json().catch(() => ({ error: 'Unknown' }))
    throw new Error(msg.error ?? `Approve failed (${res.status})`)
  }
  // Refresh any portfolio / events / recommendations subscribers
  globalMutate(key => typeof key === 'string' && (
    key.startsWith('/api/portfolio') ||
    key.startsWith('/api/events') ||
    key.startsWith('/api/recommendations')
  ))
  return res.json()
}

/** Persist budget change, then revalidate portfolio. */
export async function updateBudget(budget: number) {
  const res = await fetch('/api/portfolio/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ budget }),
  })
  if (!res.ok) {
    const msg = await res.json().catch(() => ({ error: 'Unknown' }))
    throw new Error(msg.error ?? `Budget update failed (${res.status})`)
  }
  globalMutate(key => typeof key === 'string' && key.startsWith('/api/portfolio'))
  return res.json() as Promise<{ data: { budget: number } }>
}
