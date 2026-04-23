import type { Event, City } from '@/types'
import type { DataProvider, EventFilters } from '@/lib/data/types'
import { fetchJson } from '@/lib/data/fetch-wrapper'
import { memoize } from '@/lib/data/cache'
import { normalizeEvent } from '@/lib/data/normalize'

/**
 * NewsAPI.org — https://newsapi.org/v2/everything
 * Requires NEWS_API_KEY.
 * Tier 3 (news signal — lowest confidence).
 */

const ENDPOINT = 'https://newsapi.org/v2/everything'
const TTL_MS = 15 * 60 * 1000
const CITIES: City[] = ['Abu Dhabi', 'Dubai', 'Riyadh', 'Doha']

interface NewsApiResponse {
  status: string
  articles?: Array<{
    title: string
    description?: string
    url: string
    publishedAt: string
    source?: { name?: string }
  }>
  message?: string
}

export const newsapiProvider: DataProvider = {
  meta: {
    id: 'newsapi',
    kind: 'news',
    label: 'NewsAPI.org',
    default_tier: 'Tier 3',
    enabled: Boolean(process.env.NEWS_API_KEY) && process.env.EIPP_DATA_MODE === 'live',
  },

  async getEvents(filters?: EventFilters): Promise<Event[]> {
    if (!this.meta.enabled) return []
    const apiKey = process.env.NEWS_API_KEY as string

    const targets = scopeCities(filters?.city)
    const results: Event[] = []

    await Promise.all(
      targets.map(async city => {
        const q = buildQuery(city, filters?.category)
        const url = `${ENDPOINT}?q=${encodeURIComponent(q)}&pageSize=50&language=en&sortBy=publishedAt&apiKey=${apiKey}`
        const cacheKey = `newsapi:${city}:${filters?.category ?? 'all'}`

        try {
          const json = await memoize(cacheKey, TTL_MS, () =>
            fetchJson<NewsApiResponse>(url, { timeout_ms: 6000 }),
          )

          if (json.status !== 'ok' || !json.articles) {
            if (json.message) console.warn(`[newsapi:${city}] ${json.message}`)
            return
          }

          for (const article of json.articles) {
            if (!article.title || !article.publishedAt) continue
            const normalized = normalizeEvent(
              {
                name: article.title,
                description: article.description ?? '',
                start_date: article.publishedAt,
                city,
                url: article.url,
              },
              { sourceId: 'newsapi', sourceType: 'news', defaultTier: 'Tier 3' },
            )
            if (normalized) results.push(normalized)
          }
        } catch (err) {
          console.error(`[newsapi:${city}]`, err instanceof Error ? err.message : err)
        }
      }),
    )

    return results
  },

  async healthCheck() {
    if (!this.meta.enabled) return false
    try {
      const url = `${ENDPOINT}?q=test&pageSize=1&apiKey=${process.env.NEWS_API_KEY}`
      const json = await fetchJson<NewsApiResponse>(url, { timeout_ms: 3000, retries: 0 })
      return json.status === 'ok'
    } catch {
      return false
    }
  },
}

function scopeCities(city?: EventFilters['city']): City[] {
  if (!city) return CITIES
  return Array.isArray(city) ? city : [city]
}

function buildQuery(city: City, category?: string): string {
  const base = `"${city}" events`
  return category ? `${base} ${category.toLowerCase()}` : base
}
