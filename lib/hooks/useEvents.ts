import useSWR from 'swr'
import type { ApiResponse, Event, Category, City } from '@/types'
import { fetcher, qs } from './fetcher'

interface UseEventsFilters {
  city?: City | null
  category?: Category | 'All' | null
  year?: number
  month?: number
}

export function useEvents(filters: UseEventsFilters = {}) {
  const url = `/api/events${qs({
    city: filters.city ?? undefined,
    category: filters.category ?? undefined,
    year: filters.year,
    month: filters.month,
  })}`

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Event[]>>(
    url, fetcher, {
      revalidateOnFocus: false,
      dedupingInterval: 5_000,
    }
  )

  return {
    events: data?.data ?? [],
    count:  data?.meta.count ?? 0,
    isLoading,
    error: error as Error | undefined,
    mutate,
  }
}
