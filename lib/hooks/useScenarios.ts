import useSWR from 'swr'
import type { ApiResponse, ScenarioConfig, ScenarioComparison, City } from '@/types'
import { fetcher } from './fetcher'

/** GET preset scenario configs (for the builder UI). */
export function useScenarioPresets() {
  const { data, error, isLoading } = useSWR<ApiResponse<ScenarioConfig[]>>(
    '/api/scenarios', fetcher, { revalidateOnFocus: false },
  )
  return { presets: data?.data ?? [], isLoading, error: error as Error | undefined }
}

/** POST a set of ScenarioConfig and get back a ScenarioComparison. */
export async function runScenarios(
  scenarios: ScenarioConfig[], city: City = 'Abu Dhabi',
): Promise<ScenarioComparison> {
  const res = await fetch('/api/scenarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenarios, city }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown' }))
    throw new Error(err.error ?? `Scenario run failed (${res.status})`)
  }
  const json = (await res.json()) as ApiResponse<ScenarioComparison>
  return json.data
}
