'use client'

import type { SourceType, VerificationLevel } from '@/types'
import { useDrill } from '@/context/DrillContext'
import { getSourceDetail } from '@/lib/source-details'

/**
 * Source attribution pill — tells the Director where a data point
 * came from and how verified it is. Click opens a source-detail drill
 * with provider dossier: description, endpoint, cache TTL, strengths,
 * limitations, and a link to the provider's homepage.
 */

const SOURCE_LABEL: Record<SourceType, string> = {
  government:  'Gov',
  marketplace: 'Market',
  news:        'News',
}

const SOURCE_TITLE: Record<SourceType, string> = {
  government:  'Government / official calendar — click for details',
  marketplace: 'Ticketing / marketplace — click for details',
  news:        'News signal — click for details',
}

const TIER_TONE: Record<VerificationLevel, string> = {
  'Tier 1': 'text-positive border-positive/40 hover:bg-positive/5',
  'Tier 2': 'text-fg-primary border-subtle hover:border-strong',
  'Tier 3': 'text-fg-tertiary border-subtle hover:border-strong',
}

interface Props {
  source_type: SourceType
  verification_level: VerificationLevel
  source_label?: string
  source_url?: string
  compact?: boolean
}

export function SourceBadge({
  source_type, verification_level, source_label, source_url, compact = false,
}: Props) {
  const { open } = useDrill()
  const labelOrProvider = source_label
    ? SOURCE_TITLE[source_type].replace(' — click for details', ` · ${source_label} — click for details`)
    : SOURCE_TITLE[source_type]

  const handleClick = (e: React.MouseEvent) => {
    // Don't bubble into parent click-drills (portfolio table rows, etc.)
    e.stopPropagation()
    const detail = getSourceDetail({ source_type, verification_level, source_label, source_url })
    open({
      kind: 'source-detail',
      eyebrow: 'Data source',
      title: detail.title,
      detail,
    })
  }

  const baseCls = 'inline-flex items-center rounded-sm border cursor-pointer transition-colors duration-ui ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={labelOrProvider}
        className={`${baseCls} h-4 px-1.5 text-eyebrow uppercase font-mono ${TIER_TONE[verification_level]}`}
      >
        {SOURCE_LABEL[source_type]}·{verification_level.slice(5)}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={labelOrProvider}
      className={`${baseCls} gap-1 h-5 px-2 text-eyebrow uppercase ${TIER_TONE[verification_level]}`}
    >
      <span>{SOURCE_LABEL[source_type]}</span>
      <span className="text-fg-tertiary">·</span>
      <span className="font-mono">{verification_level}</span>
      {source_label && (
        <>
          <span className="text-fg-tertiary">·</span>
          <span className="font-normal normal-case">{source_label}</span>
        </>
      )}
    </button>
  )
}
