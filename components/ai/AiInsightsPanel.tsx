'use client'
import { useAiSummary, useAiTrends } from '@/lib/hooks'
import { Skeleton, ErrorFallback } from '@/components/system/states'
import { AiBadge } from './AiBadge'
import type { City, Category } from '@/types'

/**
 * Dashboard "AI Insights" panel.
 * Two sections stacked: Strategic Summary + Trend Synthesis.
 * Both auto-load via SWR. 1-min dedupe on summary, 5-min on trends.
 */
export function AiInsightsPanel({
  city, category,
}: {
  city?: City
  category?: Category | 'All' | null
}) {
  return (
    <div className="space-y-6">
      <SummarySection city={city} category={category} />
      <div className="h-px bg-border-subtle" aria-hidden />
      <TrendsSection />
    </div>
  )
}

function SummarySection({ city, category }: { city?: City; category?: Category | 'All' | null }) {
  const { summary, isLoading, error, mutate } = useAiSummary({ city, category })

  if (error)     return <ErrorFallback error={error} onRetry={() => mutate()} compact />
  if (isLoading) return <Skeleton height="h-32" label="Generating strategic summary" />
  if (!summary)  return null

  const { data } = summary
  return (
    <div className="space-y-3">
      <header className="flex items-baseline justify-between gap-3">
        <p className="text-eyebrow uppercase text-fg-tertiary">Strategic Summary</p>
        <AiBadge confidence={summary.confidence} fallback={summary.fallback} />
      </header>
      <p className="text-body text-fg-primary leading-snug">{data.headline}</p>

      <Block term="Key gaps"               items={data.key_gaps} />
      <Block term="Portfolio weaknesses"   items={data.portfolio_weaknesses} />
      <Block term="Recommended focus"      items={data.recommended_focus_areas} />
    </div>
  )
}

function TrendsSection() {
  const { trends, isLoading, error, mutate } = useAiTrends()

  if (error)     return <ErrorFallback error={error} onRetry={() => mutate()} compact />
  if (isLoading) return <Skeleton height="h-28" label="Synthesizing trends" />
  if (!trends)   return null

  const { data } = trends
  return (
    <div className="space-y-3">
      <header className="flex items-baseline justify-between gap-3">
        <p className="text-eyebrow uppercase text-fg-tertiary">Trend Synthesis</p>
        <AiBadge confidence={trends.confidence} fallback={trends.fallback} />
      </header>

      {data.trending_categories.length > 0 && (
        <div>
          <p className="text-meta text-fg-tertiary mb-1.5">Trending categories</p>
          <ul className="space-y-1">
            {data.trending_categories.slice(0, 3).map((t, i) => (
              <li key={i} className="text-body-sm text-fg-secondary leading-snug">
                <span className="font-semibold text-fg-primary">{t.category}</span>
                <span className="text-fg-tertiary mx-2">·</span>
                {t.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.market_signals.length > 0 && (
        <div>
          <p className="text-meta text-fg-tertiary mb-1.5">Market signals</p>
          <ul className="space-y-0.5">
            {data.market_signals.slice(0, 3).map((s, i) => (
              <li key={i} className="text-meta text-fg-secondary leading-snug">— {s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function Block({ term, items }: { term: string; items: string[] }) {
  if (!items || items.length === 0) return null
  return (
    <div>
      <p className="text-meta text-fg-tertiary mb-1.5">{term}</p>
      <ul className="space-y-0.5">
        {items.slice(0, 4).map((x, i) => (
          <li key={i} className="text-meta text-fg-secondary leading-snug">— {x}</li>
        ))}
      </ul>
    </div>
  )
}
