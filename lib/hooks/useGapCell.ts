import useSWR from 'swr'
import type { Category, City, Event } from '@/types'
import type { CompetitiveSignal } from '@/lib/gap-detail'
import { fetcher, qs } from './fetcher'

interface CellResponse {
  data: {
    month: number
    category: Category
    year: number
    ad_city: 'Abu Dhabi'
    comparison_city: City
    ad_events: Event[]
    comp_events: Event[]
    signal: CompetitiveSignal
  }
}

interface Opts {
  month: number | null
  category: Category | null
  compare?: City
  year?: number
}

/**
 * Fetches the events behind one matrix cell + the competitive signal.
 * Returns null when month/category not set (nothing selected yet).
 */
export function useGapCell({ month, category, compare = 'Dubai', year = 2025 }: Opts) {
  const shouldFetch = month !== null && category !== null
  const url = shouldFetch
    ? `/api/gaps/cell${qs({ month: month!, category: category!, compare, year })}`
    : null

  const { data, error, isLoading } = useSWR<CellResponse>(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5_000,
  })

  return {
    cell: data?.data,
    isLoading,
    error: error as Error | undefined,
  }
}
