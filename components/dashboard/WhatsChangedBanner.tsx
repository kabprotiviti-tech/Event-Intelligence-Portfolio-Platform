'use client'

import { useEffect, useMemo, useState } from 'react'
import type { PortfolioBundle, EnrichedGapReport } from '@/types'
import { useLastVisitSnapshot } from '@/lib/hooks'
import {
  buildFingerprint, computeChanges, relativeTimeFrom,
  type ChangeItem, type ChangeTone,
} from '@/lib/dashboard-diff'
import { CheckIcon, CloseIcon, SparkleIcon, PulseIcon } from '@/components/system/Icon'

/**
 * "What changed since your last visit" banner — top of dashboard.
 *
 * Three states:
 *   1. Loading — silent (no flicker)
 *   2. First visit — welcome + "Start tracking" button
 *   3. Return visit — diff summary with Mark as read
 *
 * Snapshot stored in localStorage via useLastVisitSnapshot(). Updates
 * only when the Chairman explicitly marks changes as read — never
 * silently behind their back.
 */

interface Props {
  bundle: PortfolioBundle | undefined
  gapReport: EnrichedGapReport | null | undefined
  approvedConceptIds: string[]
}

export function WhatsChangedBanner({ bundle, gapReport, approvedConceptIds }: Props) {
  const { status, snapshot, markAsRead, initialize } = useLastVisitSnapshot()
  const [dismissed, setDismissed] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const currentFingerprint = useMemo(() => {
    if (!bundle) return null
    return buildFingerprint({
      bundle,
      gapReport: gapReport ?? null,
      approvedConceptIds,
    })
  }, [bundle, gapReport, approvedConceptIds])

  const summary = useMemo(() => {
    if (!snapshot || !currentFingerprint) return null
    return computeChanges(snapshot, currentFingerprint)
  }, [snapshot, currentFingerprint])

  // Re-tick relative time label every 60s without re-rendering the world
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  // States ───────────────────────────────────────────────────

  // Nothing to show while loading data / localStorage
  if (!currentFingerprint || status === 'loading') return null
  if (dismissed) return null

  // First visit — welcome variant
  if (status === 'first-visit') {
    return (
      <section
        aria-label="Welcome"
        className="rounded-md border border-accent/30 bg-surface-card px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4"
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span aria-hidden className="shrink-0 w-8 h-8 rounded-sm bg-accent text-accent-ink flex items-center justify-center">
            <PulseIcon />
          </span>
          <div className="min-w-0">
            <p className="text-eyebrow uppercase text-fg-tertiary">First visit</p>
            <p className="text-body-sm text-fg-primary mt-1">
              Tracking{' '}
              <span className="font-semibold tnum" data-tabular>{currentFingerprint.total_events}</span>{' '}
              events,{' '}
              <span className="font-semibold tnum" data-tabular>{currentFingerprint.critical_gap_keys.length + currentFingerprint.medium_gap_keys.length}</span>{' '}
              active gaps, AED{' '}
              <span className="font-semibold tnum" data-tabular>{(currentFingerprint.budget / 1_000_000).toFixed(0)}M</span>{' '}
              budget. We'll flag changes on your next visit.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => initialize(currentFingerprint)}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-sm bg-accent text-accent-ink text-meta font-semibold hover:opacity-90 transition-opacity duration-ui ease-out shrink-0"
        >
          <CheckIcon /> Start tracking
        </button>
      </section>
    )
  }

  // Return visit ────────────────────────────────────────────
  const sinceLabel = snapshot ? relativeTimeFrom(snapshot.timestamp, now) : 'just now'

  if (!summary || summary.total === 0) {
    // Quiet state — no changes
    return (
      <section
        aria-label="No changes since last visit"
        className="rounded-md border border-subtle bg-surface-card px-5 py-3 flex items-center gap-3"
      >
        <span aria-hidden className="shrink-0 w-1.5 h-1.5 rounded-full bg-positive" />
        <p className="text-body-sm text-fg-secondary min-w-0 flex-1">
          <span className="font-medium text-fg-primary">No changes</span> since your last visit{' '}
          <span className="text-fg-tertiary">({sinceLabel})</span>.{' '}
          Portfolio stable at{' '}
          <span className="font-semibold text-fg-primary tnum" data-tabular>{currentFingerprint.total_events}</span>{' '}
          events,{' '}
          <span className="font-semibold text-fg-primary tnum" data-tabular>
            {currentFingerprint.critical_gap_keys.length + currentFingerprint.medium_gap_keys.length}
          </span>{' '}
          open gaps.
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="shrink-0 p-1 text-fg-tertiary hover:text-fg-primary transition-colors duration-ui ease-out"
        >
          <CloseIcon />
        </button>
      </section>
    )
  }

  // Return visit with changes — the actionable state
  const visibleChanges = expanded ? summary.changes : summary.changes.slice(0, 3)
  const hiddenCount = summary.changes.length - visibleChanges.length

  return (
    <section
      aria-label={`${summary.total} changes since last visit`}
      className="rounded-md border border-accent/30 bg-surface-card"
    >
      <header className="flex items-start justify-between gap-4 px-5 pt-4 pb-3">
        <div className="flex items-start gap-3 min-w-0">
          <span
            aria-hidden
            className="shrink-0 w-8 h-8 rounded-sm bg-accent/10 text-accent flex items-center justify-center"
          >
            <SparkleIcon />
          </span>
          <div className="min-w-0">
            <p className="text-eyebrow uppercase text-fg-tertiary">
              Since your last visit · {sinceLabel}
            </p>
            <p className="text-body-sm text-fg-primary mt-1">
              <span className="font-semibold">{summary.total}</span>{' '}
              change{summary.total === 1 ? '' : 's'} in the portfolio
              {summary.negative > 0 && (
                <>
                  {' '}·{' '}
                  <span className="text-negative font-medium">{summary.negative} requires attention</span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (currentFingerprint) markAsRead(currentFingerprint)
              setDismissed(true)
            }}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-sm border border-subtle hover:border-strong text-meta font-medium text-fg-secondary hover:text-fg-primary transition-colors duration-ui ease-out"
          >
            <CheckIcon /> Mark as read
          </button>
        </div>
      </header>

      <ul className="divide-y divide-subtle">
        {visibleChanges.map((item, i) => (
          <ChangeRow key={i} item={item} />
        ))}
      </ul>

      {hiddenCount > 0 && (
        <footer className="px-5 py-3 border-t border-subtle">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="text-meta font-medium text-fg-secondary hover:text-fg-primary transition-colors duration-ui ease-out"
          >
            Show {hiddenCount} more change{hiddenCount === 1 ? '' : 's'} →
          </button>
        </footer>
      )}
    </section>
  )
}

/* ── Row ───────────────────────────────────────────────────── */

const TONE_DOT: Record<ChangeTone, string> = {
  positive: 'bg-positive',
  negative: 'bg-negative',
  neutral:  'bg-fg-tertiary',
}

function ChangeRow({ item }: { item: ChangeItem }) {
  return (
    <li className="px-5 py-3 flex items-start gap-3">
      <span aria-hidden className={`shrink-0 mt-2 w-1.5 h-1.5 rounded-full ${TONE_DOT[item.tone]}`} />
      <div className="min-w-0 flex-1">
        <p className="text-body-sm text-fg-primary leading-snug">{item.title}</p>
        {item.detail && (
          <p className="text-meta text-fg-tertiary leading-snug mt-0.5">{item.detail}</p>
        )}
      </div>
    </li>
  )
}
