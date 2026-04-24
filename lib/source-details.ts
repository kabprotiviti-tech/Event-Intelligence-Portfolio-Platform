/**
 * Catalog of every data source the platform can surface. Resolves an
 * event's (source_type + verification_level + source_label) into a
 * detailed provider record the Chairman can read and act on.
 *
 * If a provider isn't listed explicitly, falls back to a tier+kind
 * generic template. The goal: every SourceBadge click lands somewhere
 * useful, even for edge cases.
 */

import type { SourceType, VerificationLevel } from '@/types'

export interface SourceDetail {
  /** Short label used in the drill header */
  title: string
  /** Long human-readable provider name */
  provider: string
  /** ConnectorKind: government / marketplace / news / editorial */
  kind: 'government' | 'marketplace' | 'news' | 'editorial'
  /** Verification tier */
  tier: VerificationLevel
  /** Effect on portfolio score from lib/scorer.ts */
  tier_modifier: string
  /** 1–2 sentence description */
  description: string
  /** Publicly-documented endpoint URL (omit for mock) */
  endpoint?: string
  /** In-memory cache TTL for live connectors */
  cache_ttl_min?: number
  /** Is this connector active in current env? */
  enabled_default?: boolean
  /** Environment flag that enables this connector */
  env_flag?: string
  /** 2–3 strengths */
  strengths: string[]
  /** 2–3 limitations / risks */
  limitations: string[]
  /** External link to provider docs or homepage */
  source_url?: string
  /** Our own source file reference */
  source_file: string
}

// ═══════════════════════════════════════════════════════════════
// Catalog
// ═══════════════════════════════════════════════════════════════

const CATALOG: Record<string, SourceDetail> = {
  'DCT Official': {
    title: 'DCT Official Calendar',
    provider: 'Department of Culture and Tourism — Abu Dhabi',
    kind: 'government',
    tier: 'Tier 1',
    tier_modifier: '× 1.00 (no penalty, highest trust)',
    description: 'Official calendar of sanctioned Abu Dhabi events. Authoritative for scheduling, budget, and strategic alignment.',
    endpoint: 'https://visitabudhabi.ae/en/whats-on (planned API)',
    strengths: [
      'Canonical source — every event here is confirmed by DCT',
      'Full metadata: venue, organiser, ministry alignment',
      'Multi-year contracts visible (F1, ADIPEC locked commitments)',
    ],
    limitations: [
      'Lags behind marketplace signals for emerging events',
      'Not all inter-ministerial events published externally',
      'Real API integration TBD — currently mocked',
    ],
    source_url: 'https://visitabudhabi.ae',
    source_file: 'lib/data/connectors/government/dct-provider.ts (stub)',
  },
  'Visit Dubai': {
    title: 'Visit Dubai',
    provider: 'Dubai Department of Economy and Tourism (DET)',
    kind: 'government',
    tier: 'Tier 1',
    tier_modifier: '× 1.00',
    description: "Dubai's official events calendar. Primary benchmark for AD-vs-Dubai comparative analysis.",
    endpoint: 'https://www.visitdubai.com/en/events',
    strengths: [
      'Authoritative for Dubai programming',
      'Fast-moving — DET publishes 6+ months ahead',
      'Strong sports + business event coverage',
    ],
    limitations: [
      'No standardised API — web scraping required',
      'Private-sector spin-offs undercounted',
    ],
    source_url: 'https://www.visitdubai.com',
    source_file: 'lib/data/connectors/government/dubai-provider.ts (stub)',
  },
  'Ticketmaster': {
    title: 'Ticketmaster Discovery',
    provider: 'Ticketmaster Discovery API',
    kind: 'marketplace',
    tier: 'Tier 2',
    tier_modifier: '× 0.90 (moderate penalty — real tickets but not curated)',
    description: 'Real ticket-sale inventory for UAE/SA/QA. Structured event data with venue, city, pricing, classification.',
    endpoint: 'https://app.ticketmaster.com/discovery/v2/events.json',
    cache_ttl_min: 15,
    enabled_default: false,
    env_flag: 'TICKETMASTER_API_KEY',
    strengths: [
      'Real demand signal — actual tickets selling',
      'Strong structured data (venue, price, capacity)',
      'Free tier: 5000 calls/day — plenty for our cadence',
    ],
    limitations: [
      'Misses events not on Ticketmaster (~40% of UAE mid-market)',
      'Classification taxonomy needs manual mapping to our categories',
      'API key required — currently not provisioned in production',
    ],
    source_url: 'https://developer.ticketmaster.com',
    source_file: 'lib/data/connectors/marketplace/ticketmaster-provider.ts',
  },
  'Platinumlist': {
    title: 'Platinumlist',
    provider: 'Platinumlist.net',
    kind: 'marketplace',
    tier: 'Tier 2',
    tier_modifier: '× 0.90',
    description: 'UAE-native ticketing marketplace. Deep UAE event inventory, especially mid-market concerts and festivals.',
    endpoint: 'https://api.platinumlist.net (planned)',
    strengths: [
      'Strongest UAE-local coverage',
      'Catches events Ticketmaster misses',
      'Sponsor + organiser metadata available',
    ],
    limitations: [
      'No public API yet — integration requires partnership',
      'Sparse on government-sanctioned events',
    ],
    source_url: 'https://platinumlist.net',
    source_file: 'lib/data/connectors/marketplace/platinumlist-provider.ts (stub)',
  },
  'Google News': {
    title: 'Google News RSS',
    provider: 'Google News — RSS feed',
    kind: 'news',
    tier: 'Tier 3',
    tier_modifier: '× 0.80 (notable penalty — signal but unverified)',
    description: 'News coverage aggregator. No API key needed for RSS. Used as demand/chatter indicator, not as confirmation.',
    endpoint: 'https://news.google.com/rss/search?q={query}',
    cache_ttl_min: 15,
    enabled_default: false,
    env_flag: 'EIPP_DATA_MODE=live',
    strengths: [
      'No key required — public RSS',
      'Wide coverage across global news outlets',
      'Good for trend momentum signal',
    ],
    limitations: [
      'Tier 3 reliability — news mentions are not event confirmations',
      'Dates refer to publication, not event dates — requires extraction',
      'Prone to duplicates across outlets',
    ],
    source_url: 'https://news.google.com',
    source_file: 'lib/data/connectors/news/google-news-provider.ts',
  },
  'NewsAPI': {
    title: 'NewsAPI.org',
    provider: 'NewsAPI.org',
    kind: 'news',
    tier: 'Tier 3',
    tier_modifier: '× 0.80',
    description: 'Aggregated news API across 80k+ sources. Structured metadata (title, description, published, source).',
    endpoint: 'https://newsapi.org/v2/everything',
    cache_ttl_min: 15,
    enabled_default: false,
    env_flag: 'NEWS_API_KEY',
    strengths: [
      'Better structure than Google News RSS',
      'Description field enables richer classification',
      'Free tier: 100 req/day (sufficient with caching)',
    ],
    limitations: [
      'Free tier blocks commercial use and historical lookback',
      'Tier 3 reliability — same caveats as Google News',
    ],
    source_url: 'https://newsapi.org',
    source_file: 'lib/data/connectors/news/newsapi-provider.ts',
  },
  'Mock editorial': {
    title: 'Editorial Mock Dataset',
    provider: 'EIPP internal curated dataset',
    kind: 'editorial',
    tier: 'Tier 1',
    tier_modifier: '× 1.00 (highest — authored by DCT strategy team in spirit)',
    description: 'Curated baseline of ~70 real Abu Dhabi + Dubai + GCC events with plausible scoring. Used for demos and when live connectors are unavailable.',
    strengths: [
      'Deterministic — same result every call',
      'Full metadata: dates, venues, audiences, scoring factors',
      'No network dependency — instant response',
    ],
    limitations: [
      'NOT real data — mock values for ROI, strategic fit, etc.',
      'Factor scores are illustrative, not measured',
      'Always replaced by Tier 1 live data when available',
    ],
    source_file: 'data/mock-events-{abudhabi,dubai,gcc}.ts',
  },
}

// ═══════════════════════════════════════════════════════════════
// Generic fallbacks (when source_label is absent or unrecognised)
// ═══════════════════════════════════════════════════════════════

const GENERIC: Record<string, (tier: VerificationLevel) => SourceDetail> = {
  government: (tier) => ({
    title: 'Government source',
    provider: 'Government or official calendar',
    kind: 'government',
    tier,
    tier_modifier: tierModifier(tier),
    description: 'Sanctioned government/ministry event calendar. Events here are officially confirmed.',
    strengths: [
      'Highest verification tier',
      'Authoritative for scheduling and sign-off',
    ],
    limitations: [
      'Lags emerging/private events',
      'Specific provider not identified on this record — upgrade by setting source_label',
    ],
    source_file: 'lib/data/connectors/government/*',
  }),
  marketplace: (tier) => ({
    title: 'Marketplace source',
    provider: 'Ticketing / marketplace platform',
    kind: 'marketplace',
    tier,
    tier_modifier: tierModifier(tier),
    description: 'Real ticket inventory from a ticketing platform. Demand signal is strong but classification may vary.',
    strengths: [
      'Real demand signal — tickets selling',
      'Dates and venues are reliable',
    ],
    limitations: [
      'Categorisation needs manual mapping',
      'Provider not specifically identified',
    ],
    source_file: 'lib/data/connectors/marketplace/*',
  }),
  news: (tier) => ({
    title: 'News signal',
    provider: 'News aggregator',
    kind: 'news',
    tier,
    tier_modifier: tierModifier(tier),
    description: 'News-coverage-derived signal. Treated as leading indicator, not confirmation.',
    strengths: [
      'Captures announcements before ticketing goes live',
      'Wide outlet coverage',
    ],
    limitations: [
      'Lowest verification tier',
      'Dates may refer to article, not event',
    ],
    source_file: 'lib/data/connectors/news/*',
  }),
}

function tierModifier(tier: VerificationLevel): string {
  return tier === 'Tier 1' ? '× 1.00'
       : tier === 'Tier 2' ? '× 0.90'
       :                     '× 0.80'
}

// ═══════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════

export interface SourceLookup {
  source_type: SourceType
  verification_level: VerificationLevel
  source_label?: string
  source_url?: string
}

export function getSourceDetail(lookup: SourceLookup): SourceDetail {
  // Specific provider match via source_label
  if (lookup.source_label && CATALOG[lookup.source_label]) {
    const entry = CATALOG[lookup.source_label]
    // Enrich with per-event URL if present
    return lookup.source_url ? { ...entry, source_url: lookup.source_url } : entry
  }

  // Generic fallback by connector kind
  const kind: 'government' | 'marketplace' | 'news' =
    lookup.source_type === 'government' ? 'government' :
    lookup.source_type === 'marketplace' ? 'marketplace' :
    'news'

  const generic = GENERIC[kind](lookup.verification_level)
  if (lookup.source_url) return { ...generic, source_url: lookup.source_url }
  return generic
}

/**
 * List all providers in the catalog — used by /framework page if we ever
 * want to render the authoritative catalog inline. Deterministic order.
 */
export function listProviders(): SourceDetail[] {
  const priority = ['Mock editorial', 'DCT Official', 'Visit Dubai', 'Ticketmaster', 'Platinumlist', 'Google News', 'NewsAPI']
  return priority.map(k => CATALOG[k]).filter(Boolean)
}
