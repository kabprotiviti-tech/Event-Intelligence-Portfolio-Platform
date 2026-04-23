import type { SourceType, VerificationLevel } from '@/types'

/**
 * Source attribution pill — tells the Director where a data point
 * came from and how verified it is. Required on anything derived
 * from an event (cells, table rows, decision bullets).
 */

const SOURCE_LABEL: Record<SourceType, string> = {
  government:  'Gov',
  marketplace: 'Market',
  news:        'News',
}

const SOURCE_TITLE: Record<SourceType, string> = {
  government:  'Government / official calendar',
  marketplace: 'Ticketing / marketplace (Ticketmaster, Platinumlist)',
  news:        'News signal (Google News, NewsAPI)',
}

const TIER_TONE: Record<VerificationLevel, string> = {
  'Tier 1': 'text-positive border-positive/40',
  'Tier 2': 'text-fg-primary border-subtle',
  'Tier 3': 'text-fg-tertiary border-subtle',
}

export function SourceBadge({
  source_type, verification_level, source_label, compact = false,
}: {
  source_type: SourceType
  verification_level: VerificationLevel
  source_label?: string
  compact?: boolean
}) {
  const title = `${SOURCE_TITLE[source_type]} · ${verification_level}${source_label ? ' · ' + source_label : ''}`

  if (compact) {
    return (
      <span
        title={title}
        className={`inline-flex items-center h-4 px-1.5 rounded-sm border text-eyebrow uppercase font-mono ${TIER_TONE[verification_level]}`}
      >
        {SOURCE_LABEL[source_type]}·{verification_level.slice(5)}
      </span>
    )
  }

  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 h-5 px-2 rounded-sm border text-eyebrow uppercase ${TIER_TONE[verification_level]}`}
    >
      <span>{SOURCE_LABEL[source_type]}</span>
      <span className="text-fg-tertiary">·</span>
      <span className="font-mono">{verification_level}</span>
    </span>
  )
}
