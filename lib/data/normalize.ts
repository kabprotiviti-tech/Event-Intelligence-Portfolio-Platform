import type { Event, City } from '@/types'
import type { NormalizerContext } from './types'
import {
  classifyCategory, extractCity, cityToCountry,
  defaultImpactForTier, cleanHeadline,
} from './classifier'

export interface PartialExternalEvent {
  name: string
  description?: string
  start_date: string                  // any parseable format
  end_date?: string
  venue?: string
  city?: City | string                // raw city string (mapped to City or extracted from text)
  url?: string
  ticket_price_min?: number
  ticket_price_max?: number
  external_category_hint?: string     // e.g., "Sports" from Ticketmaster segment
  estimated_attendance?: number
}

/**
 * Normalize an external event shape into our canonical Event.
 * Connectors extract a PartialExternalEvent from their specific payload,
 * then hand it here. One normalization path, one id convention, one log target.
 */
export function normalizeEvent(
  raw: PartialExternalEvent,
  ctx: NormalizerContext,
): Event | null {
  if (!raw.name || !raw.start_date) return null

  const name = cleanHeadline(raw.name)
  const startDate = normalizeDate(raw.start_date)
  if (!startDate) return null

  const text = `${name} ${raw.description ?? ''}`
  const city = coerceCity(raw.city) ?? extractCity(text) ?? 'Abu Dhabi'

  // If the external source already hints a category, respect it when it maps.
  const hintedCategory = raw.external_category_hint
    ? mapExternalCategory(raw.external_category_hint)
    : null
  const category = hintedCategory ?? classifyCategory(text)

  const impactWeight = defaultImpactForTier(ctx.defaultTier)

  return {
    id: makeId(ctx.sourceId, name, startDate),
    name,
    category,
    event_format: 'Festival',          // generic; connector may override via post-processing
    city,
    country: cityToCountry(city),
    start_date: startDate,
    end_date: raw.end_date ? normalizeDate(raw.end_date) : undefined,
    venue: raw.venue || 'TBA',
    estimated_attendance: raw.estimated_attendance ?? 0,
    ticket_price_range: {
      min: raw.ticket_price_min ?? 0,
      max: raw.ticket_price_max ?? 0,
      currency: 'AED',
    },
    source_type: ctx.sourceType,
    verification_level: ctx.defaultTier,
    tourism_origin: 'Mixed',
    indoor_outdoor: 'Mixed',
    impact_weight: impactWeight,
    min_budget_required: 0,
    // Unknown from external sources — neutral 5/10 so recs surface from gaps not seed bias
    roi_score: 5, strategic_fit_score: 5, seasonality_score: 5,
    private_sector_score: 5, tourism_impact_score: 5,
  }
}

/* ── helpers ─────────────────────────────────────────────────── */

function coerceCity(raw: PartialExternalEvent['city']): City | null {
  if (!raw) return null
  const KNOWN: City[] = ['Abu Dhabi', 'Dubai', 'Riyadh', 'Doha', 'Muscat']
  const s = String(raw).trim()
  const hit = KNOWN.find(c => c.toLowerCase() === s.toLowerCase())
  return hit ?? extractCity(s)
}

function mapExternalCategory(hint: string) {
  const t = hint.toLowerCase()
  if (/sport|tennis|football|golf|race|championship/.test(t)) return 'Sports' as const
  if (/family|kids|children/.test(t))                         return 'Family' as const
  if (/music|concert|art|theatre|theater|comedy|film|expo|conference/.test(t))
    return 'Entertainment' as const
  return null
}

export function normalizeDate(s: string): string {
  // Accept ISO, RFC 2822, "Mar 15, 2025", etc. Return yyyy-mm-dd.
  const d = new Date(s)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

function makeId(sourceId: string, name: string, date: string): string {
  return `${sourceId}-${hash(`${name}|${date}`)}`
}

function hash(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h).toString(36)
}
