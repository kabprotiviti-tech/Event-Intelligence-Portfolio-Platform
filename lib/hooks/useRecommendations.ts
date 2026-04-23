import useSWR from 'swr'
import type { ApiResponse, EventConcept, Category, City } from '@/types'
import { fetcher, qs } from './fetcher'

interface UseRecommendationsFilters {
  city?: City
  category?: Category | 'All' | null
  limit?: number
  year?: number
}

export function useRecommendations(filters: UseRecommendationsFilters = {}) {
  const url = `/api/recommendations${qs({
    city: filters.city,
    category: filters.category ?? undefined,
    limit: filters.limit ?? 6,
    year: filters.year ?? 2025,
  })}`

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<EventConcept[]>>(
    url, fetcher, {
      revalidateOnFocus: false,
      dedupingInterval: 5_000,
    }
  )

  return {
    concepts: data?.data ?? [],
    isLoading,
    error: error as Error | undefined,
    mutate,
  }
}
