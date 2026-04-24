/**
 * Dashboard diff engine — computes what changed since the last visit.
 * Pure functions, no side effects. Inputs: two snapshots. Output: ChangeItem[].
 *
 * A snapshot is a stable fingerprint of the state the Chairman saw. The
 * fingerprint captures identity (event IDs, concept title-keys) so reruns
 * with new internal IDs don't register as spurious "new" items.
 */

import type {
  PortfolioBundle, EnrichedGapReport, EnrichedGapSlot,
  EventDecision, CreateDecision,
} from '@/types'

export const SNAPSHOT_VERSION = 1

export interface DashboardFingerprint {
  version: typeof SNAPSHOT_VERSION
  timestamp: number                 // ms since epoch when snapshot was taken
  event_ids: string[]               // all events in AD portfolio scope
  critical_gap_keys: string[]       // "M-Category" for severity === Critical
  medium_gap_keys: string[]         // "M-Category" for severity === Medium
  fund_ids: string[]
  scale_ids: string[]
  drop_ids: string[]
  create_keys: string[]             // title|city|month (concepts have unstable IDs)
  approved_concept_ids: string[]
  budget: number
  total_events: number
  avg_score: number
}

/** Build a fingerprint from the current dashboard state. */
export function buildFingerprint(args: {
  bundle: PortfolioBundle
  gapReport: EnrichedGapReport | null
  approvedConceptIds: string[]
}): DashboardFingerprint {
  const { bundle, gapReport, approvedConceptIds } = args

  const critical = gapReport?.slots.filter(s => s.severity === 'Critical') ?? []
  const medium   = gapReport?.slots.filter(s => s.severity === 'Medium')   ?? []

  return {
    version: SNAPSHOT_VERSION,
    timestamp: Date.now(),
    event_ids: bundle.events.map(e => e.id).sort(),
    critical_gap_keys: critical.map(slotKey).sort(),
    medium_gap_keys:   medium.map(slotKey).sort(),
    fund_ids:  bundle.decisions.fund.map(d => d.event.id).sort(),
    scale_ids: bundle.decisions.scale.map(d => d.event.id).sort(),
    drop_ids:  bundle.decisions.drop.map(d => d.event.id).sort(),
    create_keys: bundle.decisions.create.map(createKey).sort(),
    approved_concept_ids: [...approvedConceptIds].sort(),
    budget: bundle.budget,
    total_events: bundle.summary.total_events,
    avg_score: bundle.summary.avg_portfolio_score,
  }
}

function slotKey(s: Pick<EnrichedGapSlot, 'month' | 'category'>): string {
  return `${s.month}-${s.category}`
}

function createKey(d: CreateDecision): string {
  return `${d.concept.title}|${d.concept.suggested_city}|${d.concept.suggested_month}`
}

// ─── Diff ───────────────────────────────────────────────────

export type ChangeTone = 'positive' | 'negative' | 'neutral'
export type ChangeKind =
  | 'event-added'   | 'event-removed'
  | 'gap-escalated' | 'gap-resolved'
  | 'fund-new'      | 'fund-gone'
  | 'drop-new'
  | 'create-new'
  | 'concept-approved'
  | 'budget-changed'
  | 'score-moved'

export interface ChangeItem {
  kind: ChangeKind
  title: string       // one-line headline
  detail?: string     // optional secondary line
  tone: ChangeTone
  /** Opaque payload — the UI decides how to drill on click. */
  refs?: string[]
}

export interface ChangeSummary {
  changes: ChangeItem[]
  total: number
  positive: number
  negative: number
}

export function computeChanges(
  prev: DashboardFingerprint,
  curr: DashboardFingerprint,
): ChangeSummary {
  const items: ChangeItem[] = []

  // ── Events ──
  const addedEvents = diff(curr.event_ids, prev.event_ids)
  const removedEvents = diff(prev.event_ids, curr.event_ids)

  if (addedEvents.length > 0) {
    items.push({
      kind: 'event-added',
      title: `${addedEvents.length} new event${addedEvents.length === 1 ? '' : 's'} in the portfolio`,
      detail: addedEvents.length <= 3 ? addedEvents.join(', ') : undefined,
      tone: 'positive',
      refs: addedEvents,
    })
  }
  if (removedEvents.length > 0) {
    items.push({
      kind: 'event-removed',
      title: `${removedEvents.length} event${removedEvents.length === 1 ? '' : 's'} removed from the portfolio`,
      tone: 'neutral',
      refs: removedEvents,
    })
  }

  // ── Gaps ──
  const newCritical = diff(curr.critical_gap_keys, prev.critical_gap_keys)
  const resolvedCritical = diff(prev.critical_gap_keys, curr.critical_gap_keys)

  if (newCritical.length > 0) {
    items.push({
      kind: 'gap-escalated',
      title: `${newCritical.length} gap slot${newCritical.length === 1 ? '' : 's'} escalated to Critical`,
      detail: newCritical.slice(0, 3).map(formatSlotKey).join(' · '),
      tone: 'negative',
      refs: newCritical,
    })
  }
  if (resolvedCritical.length > 0) {
    items.push({
      kind: 'gap-resolved',
      title: `${resolvedCritical.length} critical gap${resolvedCritical.length === 1 ? '' : 's'} resolved`,
      detail: resolvedCritical.slice(0, 3).map(formatSlotKey).join(' · '),
      tone: 'positive',
      refs: resolvedCritical,
    })
  }

  // ── Decisions ──
  const newFund = diff(curr.fund_ids, prev.fund_ids)
  if (newFund.length > 0) {
    items.push({
      kind: 'fund-new',
      title: `${newFund.length} new Fund candidate${newFund.length === 1 ? '' : 's'}`,
      tone: 'positive',
      refs: newFund,
    })
  }
  const lostFund = diff(prev.fund_ids, curr.fund_ids)
  if (lostFund.length > 0) {
    items.push({
      kind: 'fund-gone',
      title: `${lostFund.length} event${lostFund.length === 1 ? '' : 's'} dropped out of Fund tier`,
      tone: 'negative',
      refs: lostFund,
    })
  }
  const newDrop = diff(curr.drop_ids, prev.drop_ids)
  if (newDrop.length > 0) {
    items.push({
      kind: 'drop-new',
      title: `${newDrop.length} new Drop candidate${newDrop.length === 1 ? '' : 's'}`,
      detail: 'Low-score events worth reviewing before budget cycle',
      tone: 'negative',
      refs: newDrop,
    })
  }

  // ── Create concepts ──
  const newConcepts = diff(curr.create_keys, prev.create_keys)
  if (newConcepts.length > 0) {
    items.push({
      kind: 'create-new',
      title: `${newConcepts.length} new event concept${newConcepts.length === 1 ? '' : 's'} proposed`,
      detail: newConcepts.slice(0, 2).map(k => k.split('|')[0]).join(' · '),
      tone: 'positive',
      refs: newConcepts,
    })
  }

  // ── Approved concepts (user-initiated action) ──
  const newlyApproved = diff(curr.approved_concept_ids, prev.approved_concept_ids)
  if (newlyApproved.length > 0) {
    items.push({
      kind: 'concept-approved',
      title: `${newlyApproved.length} concept${newlyApproved.length === 1 ? '' : 's'} approved to portfolio`,
      tone: 'positive',
      refs: newlyApproved,
    })
  }

  // ── Budget ──
  if (curr.budget !== prev.budget) {
    const delta = curr.budget - prev.budget
    const deltaM = Math.abs(delta / 1_000_000).toFixed(0)
    const tone: ChangeTone = delta > 0 ? 'positive' : 'neutral'
    items.push({
      kind: 'budget-changed',
      title: `Budget ${delta > 0 ? 'raised' : 'lowered'} by AED ${deltaM}M`,
      detail: `Now AED ${(curr.budget / 1_000_000).toFixed(0)}M total`,
      tone,
    })
  }

  // ── Score shift (≥ 0.3 point) ──
  const scoreDelta = curr.avg_score - prev.avg_score
  if (Math.abs(scoreDelta) >= 0.3) {
    items.push({
      kind: 'score-moved',
      title: `Avg portfolio score ${scoreDelta > 0 ? 'up' : 'down'} ${Math.abs(scoreDelta).toFixed(1)} to ${curr.avg_score.toFixed(1)}`,
      tone: scoreDelta > 0 ? 'positive' : 'negative',
    })
  }

  return {
    changes: items,
    total: items.length,
    positive: items.filter(i => i.tone === 'positive').length,
    negative: items.filter(i => i.tone === 'negative').length,
  }
}

// ─── Formatting ─────────────────────────────────────────────

const MONTHS = [
  '', 'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',
]

function formatSlotKey(key: string): string {
  const [m, cat] = key.split('-')
  return `${MONTHS[parseInt(m)]} ${cat}`
}

/** Returns items in A that are not in B. Both expected pre-sorted. */
function diff(a: string[], b: string[]): string[] {
  const setB = new Set(b)
  return a.filter(x => !setB.has(x))
}

// ─── Relative-time formatter ────────────────────────────────

export function relativeTimeFrom(timestamp: number, now: number = Date.now()): string {
  const diffMs = now - timestamp
  if (diffMs < 0) return 'just now'

  const mins = Math.round(diffMs / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`

  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`

  const days = Math.round(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`

  const months = Math.round(days / 30)
  return `${months} month${months === 1 ? '' : 's'} ago`
}
