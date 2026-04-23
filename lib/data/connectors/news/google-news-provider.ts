import type { Event, City } from '@/types'
import type { DataProvider, EventFilters } from '@/lib/data/types'
import { fetchText } from '@/lib/data/fetch-wrapper'
import { memoize } from '@/lib/data/cache'
import { normalizeEvent } from '@/lib/data/normalize'

/**
 * Google News RSS — public feed, no API key required for basic operation.
 *
 * GOOGLE_NEWS_API_KEY is reserved for a future SerpAPI / Google News JSON
 * upgrade (richer metadata, pagination). For now the RSS path works without
 * it, so we enable this connector whenever EIPP_DATA_MODE=live.
 */

const FEED = 'https://news.google.com/rss/search?q={q}&hl=en-AE&gl=AE&ceid=AE:en'
const TTL_MS = 15 * 60 * 1000  // 15 minutes — news cadence is hourly at most for our purposes

const CITIES: City[] = ['Abu Dhabi', 'Dubai', 'Riyadh', 'Doha']

export const googleNewsProvider: DataProvider = {
  meta: {
    id: 'google-news',
    kind: 'news',
    label: 'Google News',
    default_tier: 'Tier 3',
    enabled: process.env.EIPP_DATA_MODE === 'live',
  },

  async getEvents(filters?: EventFilters): Promise<Event[]> {
    if (!this.meta.enabled) return []

    const targetCities = scopeCities(filters?.city)
    const results: Event[] = []

    await Promise.all(
      targetCities.map(async city => {
        const q = buildQuery(city, filters?.category)
        const cacheKey = `google-news:${city}:${filters?.category ?? 'all'}`
        try {
          const items = await memoize(cacheKey, TTL_MS, async () => {
            const url = FEED.replace('{q}', encodeURIComponent(q))
            const xml = await fetchText(url, { timeout_ms: 6000 })
            return parseRssItems(xml)
          })

          for (const item of items) {
            const normalized = normalizeEvent(
              {
                name: item.title,
                description: item.description,
                start_date: item.pubDate,      // news date — real event date must be inferred or verified downstream
                city,
                url: item.link,
              },
              {
                sourceId: 'google-news',
                sourceType: 'news',
                defaultTier: 'Tier 3',
              },
            )
            if (normalized) results.push(normalized)
          }
        } catch (err) {
          // Never throw — registry treats empty as "quiet source"
          console.error(`[google-news:${city}]`, err instanceof Error ? err.message : err)
        }
      }),
    )

    return results
  },

  async healthCheck() {
    if (!this.meta.enabled) return false
    try {
      await fetchText(FEED.replace('{q}', 'test'), { timeout_ms: 3000, retries: 0 })
      return true
    } catch {
      return false
    }
  },
}

/* ── Query building ───────────────────────────────────────────── */

function scopeCities(city?: EventFilters['city']): City[] {
  if (!city) return CITIES
  return Array.isArray(city) ? city : [city]
}

function buildQuery(city: City, category?: string): string {
  // "events <city>" plus category when specified — keeps Google scoped.
  const parts = ['events', city]
  if (category) parts.push(category)
  return parts.join(' ')
}

/* ── RSS parsing (no deps) ────────────────────────────────────── */

interface RssItem {
  title: string
  link: string
  pubDate: string
  description: string
}

function parseRssItems(xml: string): RssItem[] {
  const items: RssItem[] = []
  const itemRe = /<item\b[^>]*>([\s\S]*?)<\/item>/gi
  let m: RegExpExecArray | null
  while ((m = itemRe.exec(xml)) !== null) {
    const inner = m[1]
    items.push({
      title:       extractTag(inner, 'title'),
      link:        extractTag(inner, 'link'),
      pubDate:     extractTag(inner, 'pubDate'),
      description: stripHtml(extractTag(inner, 'description')),
    })
  }
  return items.filter(i => i.title && i.pubDate)
}

function extractTag(xml: string, tag: string): string {
  const re = new RegExp(
    `<${tag}\\b[^>]*>\\s*(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?\\s*<\\/${tag}>`,
    'i',
  )
  const m = xml.match(re)
  return m ? m[1].trim() : ''
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}
