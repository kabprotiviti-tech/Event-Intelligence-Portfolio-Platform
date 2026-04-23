import useSWR from 'swr'
import type { ApiResponse, ChairmanBrief, City } from '@/types'
import { fetcher, qs } from './fetcher'

interface Opts {
  city?: City
  horizon?: number
  year?: number
}

export function useChairmanBrief(opts: Opts = {}) {
  const url = `/api/chairman${qs({
    city: opts.city ?? 'Abu Dhabi',
    horizon: opts.horizon ?? 2,
    year: opts.year,
  })}`

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ChairmanBrief>>(
    url, fetcher, {
      revalidateOnFocus: false,
      dedupingInterval: 10_000,
    }
  )

  return {
    brief: data?.data,
    isLoading,
    error: error as Error | undefined,
    mutate,
  }
}
