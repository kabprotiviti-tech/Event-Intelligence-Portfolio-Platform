import type { Event, EventConcept } from '@/types'

/**
 * Lightweight in-memory persistence. Lives on the server process.
 * Good enough for MVP — survives across page navigations and API calls
 * within a single Node.js server instance. Loses state on redeploy.
 *
 * To promote to a real store later, swap the body of these functions for
 * a DB / KV / filesystem adapter — signatures stay identical.
 */

interface StoreShape {
  proposed: Event[]            // events created from approved concepts
  budget: number               // current simulation budget (AED)
  approvedConceptIds: Set<string>
}

// Using globalThis so hot-reload in dev doesn't wipe state.
declare global {
  // eslint-disable-next-line no-var
  var __eippStore: StoreShape | undefined
}

const DEFAULT_BUDGET = 250_000_000

function store(): StoreShape {
  if (!globalThis.__eippStore) {
    globalThis.__eippStore = {
      proposed: [],
      budget: DEFAULT_BUDGET,
      approvedConceptIds: new Set(),
    }
  }
  return globalThis.__eippStore
}

// ── Proposed events ─────────────────────────────────────────

export function getProposedEvents(): Event[] {
  return [...store().proposed]
}

export function addProposedEventFromConcept(concept: EventConcept): Event {
  const s = store()

  // Idempotent — approving the same concept twice is a no-op.
  if (s.approvedConceptIds.has(concept.id)) {
    const existing = s.proposed.find(e => e.id === `proposed-${concept.id}`)
    if (existing) return existing
  }

  const d = new Date()
  const year = d.getFullYear()
  const startDate = new Date(year, concept.suggested_month - 1, 15).toISOString().slice(0, 10)

  const event: Event = {
    id: `proposed-${concept.id}`,
    name: concept.title,
    category: concept.category,
    event_format: concept.event_format,
    city: concept.suggested_city,
    country: 'UAE',
    start_date: startDate,
    venue: 'TBD',
    estimated_attendance: concept.estimated_audience,
    ticket_price_range: { min: 0, max: 0, currency: 'AED' },
    source_type: 'government',
    verification_level: 'Tier 2',
    tourism_origin: 'Mixed',
    indoor_outdoor: 'Mixed',
    impact_weight: 3,
    min_budget_required: concept.estimated_budget,
    // Seed scores from the concept's confidence + gap score
    roi_score:            scoreFromConfidence(concept.confidence, 7),
    strategic_fit_score:  scoreFromConfidence(concept.confidence, 8),
    seasonality_score:    Math.round(concept.gap_score * 10),
    private_sector_score: scoreFromConfidence(concept.confidence, 6),
    tourism_impact_score: scoreFromConfidence(concept.confidence, 6),
  }

  s.proposed.push(event)
  s.approvedConceptIds.add(concept.id)
  return event
}

export function removeProposedByConceptId(conceptId: string): boolean {
  const s = store()
  const before = s.proposed.length
  s.proposed = s.proposed.filter(e => e.id !== `proposed-${conceptId}`)
  s.approvedConceptIds.delete(conceptId)
  return s.proposed.length < before
}

export function getApprovedConceptIds(): string[] {
  return Array.from(store().approvedConceptIds)
}

// ── Budget ──────────────────────────────────────────────────

export function getBudget(): number {
  return store().budget
}

export function setBudget(n: number): number {
  const clamped = Math.max(50_000_000, Math.min(1_000_000_000, Math.round(n)))
  store().budget = clamped
  return clamped
}

// ── Helpers ─────────────────────────────────────────────────

function scoreFromConfidence(c: EventConcept['confidence'], base: number): number {
  const mod = c === 'High' ? 0.5 : c === 'Medium' ? 0 : -1
  return Math.max(1, Math.min(10, base + mod))
}
