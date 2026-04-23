import useSWR from 'swr'
import type { ApiResponse, EnrichedGapReport, Category, City } from '@/types'
import { fetcher, qs } from './fetcher'

interface UseGapsFilters {
  cities: City[]
  year?: number
  category?: Category | 'All' | null
}

export function useGaps({ cities, year = 2025, category }: UseGapsFilters) {
  const url = `/api/gaps${qs({
    cities: cities.join(','),
    year,
    category: category ?? undefined,
  })}`

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<EnrichedGapReport[]>>(
    url, fetcher, {
      revalidateOnFocus: false,
      dedupingInterval: 5_000,
    }
  )

  return {
    reports: data?.data ?? [],
    isLoading,
    error: error as Error | undefined,
    mutate,
  }
}
