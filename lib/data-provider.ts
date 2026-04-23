import type { Event } from '@/types'
import type { EventFilters } from './data/types'
import { mockFallback } from './data/fallback'

// Re-export for backwards compatibility with existing imports (@/lib/data-provider EventFilters)
export type { EventFilters }

const LIVE = process.env.EIPP_DATA_MODE === 'live'

/**
 * The single public data entry for the whole app.
 *
 * - Mock mode (default): fast, deterministic, editorial dataset for demos.
 * - Live mode: aggregates real connectors (Google News RSS, NewsAPI,
 *   Ticketmaster) + blends with mock for calendar completeness, dedupes
 *   against tier rank, and degrades to mock if everything upstream fails.
 *
 * Flip with env: EIPP_DATA_MODE=live  (and the relevant API keys).
 */
export async function getEvents(filters?: EventFilters): Promise<Event[]> {
  if (!LIVE) return mockFallback(filters)

  // Lazy import so mock builds never pull the connector tree.
  const { getEventsFromAllSources } = await import('./data/provider-registry')
  return getEventsFromAllSources(filters)
}
