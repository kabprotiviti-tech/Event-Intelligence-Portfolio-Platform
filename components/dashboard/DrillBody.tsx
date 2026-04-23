'use client'
import type {
  PortfolioEvent, EnrichedGapSlot, EventDecision, CreateDecision,
  GapSeverity, City, Category, FutureOpportunity, ScenarioResult, CompetitiveGap,
} from '@/types'
import { useDrill, type DrillPayload } from '@/context/DrillContext'
import { useGapCell } from '@/lib/hooks'
import { CategoryBadge } from '@/components/ui/Badge'
import { SourceBadge } from '@/components/ui/SourceBadge'
import { AiExplainButton } from '@/components/ai/AiExplainButton'
import { Skeleton, EmptyState } from '@/components/system/states'

const MONTHS = [
  '', 'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const MONTHS_SHORT = ['', 'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const SEVERITY_STYLE: Record<GapSeverity, string> = {
  Critical: 'border-negative/40 text-negative',
  Medium:   'border-caution/40 text-caution',
  Low:      'border-subtle text-fg-tertiary',
}

/**
 * Discriminated-union switch that renders the right sub-view per drill kind.
 */
export function DrillBody({ payload }: { payload: DrillPayload }) {
  switch (payload.kind) {
    case 'events':             return <EventsList events={payload.events} sortHint={payload.sortHint} />
    case 'event-detail':       return <EventDetail event={payload.event} />
    case 'gaps':               return <GapsList gaps={payload.gaps} compare={payload.compare} />
    case 'cell':               return <CellView month={payload.month} category={payload.category} compare={payload.compare} />
    case 'event-decision':     return <EventDecisionDetail decision={payload.decision} />
    case 'create-decision':    return <CreateDecisionDetail decision={payload.decision} />
    case 'concepts':           return <ConceptsList decisions={payload.concepts} />
    case 'future-opportunity': return <OpportunityDetail opportunity={payload.opportunity} />
    case 'scenario':           return <ScenarioDetail scenario={payload.scenario} />
    case 'competitive-gap':    return <CompetitiveGapDetail gap={payload.gap} />
  }
}

/* ═══════════════════════════════════════════════════════════════════
   Events list — for stat-card drills (all events / top / proposed)
   ═══════════════════════════════════════════════════════════════════ */

function EventsList({ events, sortHint }: { events: PortfolioEvent[]; sortHint?: string }) {
  if (events.length === 0) {
    return <EmptyState title="No events match this filter." hint="Widen the category or city scope." />
  }
  return (
    <div className="space-y-3">
      {sortHint && (
        <p className="text-meta text-fg-tertiary italic">{sortHint}</p>
      )}
      <ul className="space-y-2">
        {events.map(e => <EventRow key={e.id} event={e} />)}
      </ul>
    </div>
  )
}

function EventRow({ event }: { event: PortfolioEvent }) {
  const { open } = useDrill()
  const d = new Date(event.start_date)
  return (
    <li>
      <button
        type="button"
        onClick={() => open({
          kind: 'event-detail',
          eyebrow: 'Event detail',
          title: event.name,
          event,
        })}
        className="w-full text-left rounded-sm border border-subtle px-3 py-2.5 space-y-1.5 hover:border-strong transition-colors duration-ui ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-body-sm font-medium text-fg-primary leading-snug truncate">{event.name}</p>
          <span className="text-meta text-fg-tertiary tnum shrink-0" data-tabular>
            {d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
          </span>
        </div>
        <div className="flex items-center flex-wrap gap-2 text-meta text-fg-tertiary">
          <CategoryBadge category={event.category} />
          <SourceBadge
            source_type={event.source_type}
            verification_level={event.verification_level}
            source_label={event.source_label}
            compact
          />
          <span>{event.city}</span>
          <span aria-hidden>·</span>
          <span className="tnum" data-tabular>{event.estimated_attendance.toLocaleString()} guests</span>
        </div>
        <div className="flex items-center justify-between text-meta pt-1">
          <span className="text-fg-tertiary">
            Score <span className="font-semibold text-fg-primary tnum" data-tabular>{event.portfolio_score.toFixed(1)}</span>
          </span>
          <span className="text-fg-tertiary">
            {event.budget_allocated
              ? <>Budget <span className="font-semibold text-fg-primary tnum" data-tabular>AED {(event.budget_allocated / 1_000_000).toFixed(1)}M</span></>
              : ''}
          </span>
        </div>
      </button>
    </li>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Single event detail — full scoring breakdown + source
   ═══════════════════════════════════════════════════════════════════ */

function EventDetail({ event }: { event: PortfolioEvent }) {
  const d = new Date(event.start_date)
  const endDate = event.end_date ? new Date(event.end_date) : null
  const dateRange = endDate
    ? `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} – ${endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="space-y-5">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <CategoryBadge category={event.category} />
          <span className="text-meta text-fg-tertiary">{event.event_format}</span>
          <span aria-hidden className="text-fg-tertiary">·</span>
          <SourceBadge
            source_type={event.source_type}
            verification_level={event.verification_level}
            source_label={event.source_label}
          />
        </div>
        <dl className="grid grid-cols-2 gap-3 text-meta">
          <div>
            <dt className="text-fg-tertiary">Date</dt>
            <dd className="font-medium text-fg-primary mt-0.5 tnum" data-tabular>{dateRange}</dd>
          </div>
          <div>
            <dt className="text-fg-tertiary">Venue</dt>
            <dd className="font-medium text-fg-primary mt-0.5">{event.venue}</dd>
          </div>
          <div>
            <dt className="text-fg-tertiary">Attendance</dt>
            <dd className="font-medium text-fg-primary mt-0.5 tnum" data-tabular>
              {event.estimated_attendance.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-fg-tertiary">Tourism origin</dt>
            <dd className="font-medium text-fg-primary mt-0.5">{event.tourism_origin}</dd>
          </div>
        </dl>
      </div>

      <div>
        <p className="text-eyebrow uppercase text-fg-tertiary mb-2">Score breakdown</p>
        <dl className="space-y-2 text-meta">
          <Factor term="Portfolio score" value={event.portfolio_score} />
          <Factor term="ROI"              value={event.roi_score} />
          <Factor term="Strategic fit"    value={event.strategic_fit_score} />
          <Factor term="Seasonality"      value={event.seasonality_score} />
          <Factor term="Tourism impact"   value={event.tourism_impact_score} />
          <Factor term="Private sector"   value={event.private_sector_score} />
          <Factor term="Impact weight"    value={event.impact_weight} max={5} />
        </dl>
      </div>

      <div>
        <p className="text-eyebrow uppercase text-fg-tertiary mb-2">Budget</p>
        <dl className="grid grid-cols-2 gap-3 text-meta">
          <div>
            <dt className="text-fg-tertiary">Min required</dt>
            <dd className="font-semibold text-fg-primary tnum mt-0.5" data-tabular>
              AED {(event.min_budget_required / 1_000_000).toFixed(1)}M
            </dd>
          </div>
          <div>
            <dt className="text-fg-tertiary">Currently allocated</dt>
            <dd className="font-semibold text-fg-primary tnum mt-0.5" data-tabular>
              {event.budget_allocated
                ? `AED ${(event.budget_allocated / 1_000_000).toFixed(1)}M`
                : '—'}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <p className="text-eyebrow uppercase text-fg-tertiary mb-2">Ticket price range</p>
        <p className="text-body-sm font-medium text-fg-primary tnum" data-tabular>
          AED {event.ticket_price_range.min.toLocaleString()}
          {' – '}
          AED {event.ticket_price_range.max.toLocaleString()}
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Gaps list — for "Calendar Gaps" stat-card drill
   ═══════════════════════════════════════════════════════════════════ */

function GapsList({ gaps, compare }: { gaps: EnrichedGapSlot[]; compare: City }) {
  const { open } = useDrill()
  if (gaps.length === 0) {
    return <EmptyState title="No open gaps for this scope." hint="Portfolio coverage is healthy." />
  }

  const sorted = [...gaps].sort((a, b) => b.gap_score - a.gap_score)

  return (
    <ul className="space-y-2">
      {sorted.map(g => (
        <li key={`${g.month}-${g.category}-${g.city}`}>
          <button
            type="button"
            onClick={() => open({
              kind: 'cell',
              eyebrow: 'Calendar slot',
              title: `${MONTHS[g.month]} · ${g.category}`,
              month: g.month,
              category: g.category,
              compare,
            })}
            className="w-full text-left rounded-sm border border-subtle px-3 py-2.5 space-y-1.5 hover:border-strong transition-colors duration-ui ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-body-sm text-fg-primary">
                <span className="font-semibold">{MONTHS[g.month]}</span>
                <span className="text-fg-tertiary mx-2">·</span>
                {g.category}
              </p>
              <span
                className={`inline-flex items-center h-5 px-2 rounded-sm border text-eyebrow uppercase font-semibold shrink-0 ${SEVERITY_STYLE[g.severity]}`}
              >
                {g.severity}
              </span>
            </div>
            <p className="text-meta text-fg-secondary leading-snug">{g.competitor_context}</p>
            <p className="text-meta text-fg-tertiary italic leading-snug">{g.recommendation_hint}</p>
          </button>
        </li>
      ))}
    </ul>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Cell view — single month+category drill via /api/gaps/cell
   ═══════════════════════════════════════════════════════════════════ */

function CellView({
  month, category, compare,
}: { month: number; category: Category; compare: City }) {
  const { cell, isLoading, error } = useGapCell({ month, category, compare })

  if (isLoading) return <Skeleton height="h-48" label="Loading cell events" />
  if (error)     return <p role="alert" className="text-meta text-negative">{error.message}</p>
  if (!cell)     return null

  const { signal, ad_events, comp_events, comparison_city } = cell

  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-subtle bg-surface-inset px-4 py-3">
        <p className="text-body-sm text-fg-primary leading-snug">{signal.narrative}</p>
        <div className="flex flex-wrap items-center gap-4 mt-2 text-meta">
          <span className="inline-flex items-center gap-1.5">
            <span className="text-fg-tertiary">Abu Dhabi</span>
            <span className="font-mono font-semibold text-fg-primary tnum" data-tabular>{signal.ad_count}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-fg-tertiary">{comparison_city}</span>
            <span className="font-mono font-semibold text-fg-primary tnum" data-tabular>{signal.comp_count}</span>
          </span>
          {signal.severity !== 'None' && (
            <span className={`inline-flex items-center h-5 px-2 rounded-sm border text-eyebrow uppercase font-semibold ${
              signal.severity === 'Critical' ? 'border-negative/40 text-negative'
            : signal.severity === 'Medium'   ? 'border-caution/40 text-caution'
            :                                  'border-subtle text-fg-tertiary'
            }`}>
              {signal.severity}
            </span>
          )}
        </div>
      </div>

      <CellColumn title={`Abu Dhabi (${ad_events.length})`} events={ad_events}
        emptyHint={`No Abu Dhabi ${category} events — direct opportunity.`} />
      <CellColumn title={`${comparison_city} (${comp_events.length})`} events={comp_events}
        emptyHint={`${comparison_city} also has no ${category} events this month.`} />
    </div>
  )
}

function CellColumn({
  title, events, emptyHint,
}: { title: string; events: any[]; emptyHint: string }) {
  return (
    <div className="space-y-2">
      <p className="text-eyebrow uppercase text-fg-tertiary">{title}</p>
      {events.length === 0 ? (
        <p className="text-meta text-fg-tertiary italic">{emptyHint}</p>
      ) : (
        <ul className="space-y-2">
          {events.map(e => {
            const d = new Date(e.start_date)
            return (
              <li key={e.id} className="rounded-sm border border-subtle px-3 py-2 space-y-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-body-sm font-medium text-fg-primary truncate">{e.name}</p>
                  <span className="text-meta text-fg-tertiary tnum shrink-0" data-tabular>
                    {d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
                <div className="flex items-center flex-wrap gap-2 text-meta text-fg-tertiary">
                  <span>{e.venue}</span>
                  <span aria-hidden>·</span>
                  <span className="tnum" data-tabular>{e.estimated_attendance.toLocaleString()} guests</span>
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <SourceBadge
                    source_type={e.source_type}
                    verification_level={e.verification_level}
                    source_label={e.source_label}
                  />
                  {e.source_url && (
                    <a href={e.source_url} target="_blank" rel="noopener noreferrer"
                       className="text-eyebrow uppercase text-fg-tertiary hover:text-fg-primary transition-colors duration-ui ease-out">
                      Source ↗
                    </a>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Decision detail (Fund / Scale / Drop)
   ═══════════════════════════════════════════════════════════════════ */

function EventDecisionDetail({ decision }: { decision: EventDecision }) {
  const { event, reason, key_factors, confidence, kind } = decision
  const perM = event.budget_allocated ? `AED ${(event.budget_allocated / 1_000_000).toFixed(1)}M` : '—'

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-h3 font-semibold text-fg-primary">{event.name}</p>
          <ConfidencePill confidence={confidence} />
        </div>
        <div className="flex items-center flex-wrap gap-2 mt-2 text-meta text-fg-tertiary">
          <CategoryBadge category={event.category} />
          <SourceBadge
            source_type={event.source_type}
            verification_level={event.verification_level}
            source_label={event.source_label}
            compact
          />
          <span>{event.city}</span>
          <span aria-hidden>·</span>
          <span className="tnum" data-tabular>{perM}</span>
        </div>
      </div>

      <p className="text-body-sm text-fg-secondary leading-relaxed">{reason}</p>

      <div>
        <p className="text-eyebrow uppercase text-fg-tertiary mb-2">Key factors</p>
        <ul className="flex flex-wrap gap-1">
          {key_factors.map((f, i) => (
            <li
              key={i}
              className={`inline-flex items-center h-5 px-2 rounded-sm border text-eyebrow uppercase font-medium ${
                f.signal === 'positive' ? 'border-positive/30 text-positive'
              : f.signal === 'negative' ? 'border-negative/30 text-negative'
              :                           'border-subtle text-fg-tertiary'
              }`}
            >
              {f.label} <span className="ml-1 font-mono normal-case tnum" data-tabular>{f.value}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-eyebrow uppercase text-fg-tertiary mb-2">All scoring factors</p>
        <dl className="grid grid-cols-2 gap-2 text-meta">
          <Factor term="ROI"             value={event.roi_score} />
          <Factor term="Strategic fit"   value={event.strategic_fit_score} />
          <Factor term="Seasonality"     value={event.seasonality_score} />
          <Factor term="Tourism impact"  value={event.tourism_impact_score} />
          <Factor term="Private sector"  value={event.private_sector_score} />
          <Factor term="Impact weight"   value={event.impact_weight} max={5} />
        </dl>
      </div>

      <div className="pt-4 border-t border-subtle">
        <AiExplainButton event={event} decision={kind} />
      </div>
    </div>
  )
}

function Factor({ term, value, max = 10 }: { term: string; value: number; max?: number }) {
  const pct = (value / max) * 100
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <dt className="text-fg-tertiary">{term}</dt>
        <dd className="font-mono font-semibold text-fg-primary tnum" data-tabular>
          {value.toFixed(1)}<span className="text-fg-tertiary">/{max}</span>
        </dd>
      </div>
      <div className="h-1 rounded-sm bg-surface-inset overflow-hidden">
        <div className="h-full bg-accent rounded-sm" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function ConfidencePill({ confidence }: { confidence: string }) {
  const tone =
    confidence === 'High'   ? 'border-positive/40 text-positive'
  : confidence === 'Medium' ? 'border-caution/40 text-caution'
  :                           'border-subtle text-fg-tertiary'
  return (
    <span className={`inline-flex items-center h-5 px-2 rounded-sm border text-eyebrow uppercase font-semibold shrink-0 ${tone}`}>
      {confidence}
    </span>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Create-decision detail + Concepts list
   ═══════════════════════════════════════════════════════════════════ */

function CreateDecisionDetail({ decision }: { decision: CreateDecision }) {
  const { concept, reason, key_factors, confidence } = decision
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-h3 font-semibold text-fg-primary leading-snug">{concept.title}</p>
          <ConfidencePill confidence={confidence} />
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-2 text-meta text-fg-tertiary">
          <CategoryBadge category={concept.category} />
          <span>{concept.event_format}</span>
          <span aria-hidden>·</span>
          <span>{MONTHS[concept.suggested_month]} · {concept.suggested_city}</span>
        </div>
      </div>

      <p className="text-body-sm text-fg-secondary leading-relaxed">{reason}</p>

      <div>
        <p className="text-eyebrow uppercase text-fg-tertiary mb-2">Evidence</p>
        <ul className="flex flex-wrap gap-1">
          {key_factors.map((f, i) => (
            <li
              key={i}
              className={`inline-flex items-center h-5 px-2 rounded-sm border text-eyebrow uppercase font-medium ${
                f.signal === 'positive' ? 'border-positive/30 text-positive'
              : f.signal === 'negative' ? 'border-negative/30 text-negative'
              :                           'border-subtle text-fg-tertiary'
              }`}
            >
              {f.label} <span className="ml-1 font-mono normal-case tnum" data-tabular>{f.value}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-sm border border-subtle px-3 py-2">
        <p className="text-eyebrow uppercase text-fg-tertiary mb-1">Estimates</p>
        <dl className="grid grid-cols-2 gap-2 text-meta">
          <div>
            <dt className="text-fg-tertiary">Audience</dt>
            <dd className="font-semibold text-fg-primary tnum" data-tabular>
              {concept.estimated_audience.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-fg-tertiary">Budget</dt>
            <dd className="font-semibold text-fg-primary tnum" data-tabular>
              AED {(concept.estimated_budget / 1_000_000).toFixed(1)}M
            </dd>
          </div>
        </dl>
      </div>

      {concept.reference_events.length > 0 && (
        <div>
          <p className="text-eyebrow uppercase text-fg-tertiary mb-1.5">Reference events (regional precedent)</p>
          <div className="flex flex-wrap gap-1.5">
            {concept.reference_events.map(id => (
              <span key={id} className="inline-flex h-5 items-center px-2 rounded-sm bg-surface-inset text-meta font-mono text-fg-secondary">
                {id}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Future Opportunity detail (strategy page)
   ═══════════════════════════════════════════════════════════════════ */

function OpportunityDetail({ opportunity }: { opportunity: FutureOpportunity }) {
  const investMin = (opportunity.investment_range.min / 1_000_000).toFixed(0)
  const investMax = (opportunity.investment_range.max / 1_000_000).toFixed(0)
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-h3 font-semibold text-fg-primary leading-snug">{opportunity.title}</p>
        <ConfidencePill confidence={opportunity.confidence} />
      </div>
      <div className="flex flex-wrap gap-2">
        <CategoryBadge category={opportunity.category} />
        <span className="inline-flex items-center h-5 px-2 rounded-sm border border-subtle text-meta text-fg-tertiary">
          {opportunity.horizon}
        </span>
      </div>
      <div>
        <p className="text-eyebrow uppercase text-fg-tertiary mb-2">Reasoning</p>
        <p className="text-body-sm text-fg-secondary leading-relaxed">{opportunity.reasoning}</p>
      </div>
      {opportunity.evidence.length > 0 && (
        <div>
          <p className="text-eyebrow uppercase text-fg-tertiary mb-2">Evidence</p>
          <ul className="space-y-1">
            {opportunity.evidence.map((ev, i) => (
              <li key={i} className="text-meta text-fg-secondary leading-snug">— {ev}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="rounded-sm border border-subtle px-3 py-2">
        <p className="text-eyebrow uppercase text-fg-tertiary mb-1">Investment range</p>
        <p className="text-body-sm font-semibold text-fg-primary tnum" data-tabular>
          AED {investMin}M – {investMax}M
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Scenario detail (strategy page)
   ═══════════════════════════════════════════════════════════════════ */

function ScenarioDetail({ scenario }: { scenario: ScenarioResult }) {
  const p = scenario.projections
  const drill = useDrill()
  return (
    <div className="space-y-5">
      <div>
        <p className="text-eyebrow uppercase text-fg-tertiary">{scenario.config.risk_level}</p>
        <p className="text-h3 font-semibold text-fg-primary mt-1">{scenario.config.name}</p>
        <p className="text-meta text-fg-tertiary mt-1 tnum" data-tabular>
          AED {(scenario.config.total_budget / 1_000_000).toFixed(0)}M budget
        </p>
      </div>

      <div>
        <p className="text-eyebrow uppercase text-fg-tertiary mb-2">Projections</p>
        <dl className="grid grid-cols-2 gap-3 text-meta">
          <ProjRow label="Events"          value={p.events_count.toString()} />
          <ProjRow label="Avg score"       value={`${p.avg_portfolio_score.toFixed(1)} / 10`} />
          <ProjRow label="Total ROI"       value={p.total_roi_score.toFixed(0)} />
          <ProjRow label="Total attendance" value={p.total_attendance.toLocaleString()} />
          <ProjRow label="Gaps filled"     value={p.gaps_filled.toString()} />
          <ProjRow label="Budget used"     value={`${p.budget_utilization_pct}%`} />
        </dl>
      </div>

      <div>
        <p className="text-eyebrow uppercase text-fg-tertiary mb-2">Category distribution</p>
        <dl className="space-y-2 text-meta">
          <ProjRow label="Family"        value={p.category_distribution.Family.toString()} />
          <ProjRow label="Entertainment" value={p.category_distribution.Entertainment.toString()} />
          <ProjRow label="Sports"        value={p.category_distribution.Sports.toString()} />
        </dl>
      </div>

      <div>
        <button
          type="button"
          onClick={() => drill.open({
            kind: 'events',
            eyebrow: `${scenario.config.name} · selected portfolio`,
            title: `${scenario.portfolio.length} events`,
            events: scenario.portfolio,
            sortHint: 'Ranked by portfolio score',
          })}
          className="inline-flex items-center h-8 px-3 rounded-sm border border-subtle hover:border-strong text-meta font-medium text-fg-secondary hover:text-fg-primary transition-colors duration-ui ease-out"
        >
          See the {scenario.portfolio.length} selected events →
        </button>
      </div>
    </div>
  )
}

function ProjRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-fg-tertiary">{label}</dt>
      <dd className="font-semibold text-fg-primary tnum" data-tabular>{value}</dd>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Competitive gap detail (strategy page)
   ═══════════════════════════════════════════════════════════════════ */

function CompetitiveGapDetail({ gap }: { gap: CompetitiveGap }) {
  const drill = useDrill()
  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-negative/30 bg-surface-inset px-4 py-3">
        <p className="text-body-sm text-fg-primary leading-snug">
          <span className="font-semibold">{gap.city}</span> leads Abu Dhabi by{' '}
          <span className="font-semibold text-negative tnum" data-tabular>+{gap.their_lead}</span>{' '}
          {gap.category.toLowerCase()} event{gap.their_lead === 1 ? '' : 's'} in {MONTHS[gap.month]}.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-meta">
        <div>
          <dt className="text-fg-tertiary">Month</dt>
          <dd className="font-semibold text-fg-primary mt-0.5">{MONTHS[gap.month]}</dd>
        </div>
        <div>
          <dt className="text-fg-tertiary">Category</dt>
          <dd className="font-semibold text-fg-primary mt-0.5">{gap.category}</dd>
        </div>
        <div>
          <dt className="text-fg-tertiary">Competitor city</dt>
          <dd className="font-semibold text-fg-primary mt-0.5">{gap.city}</dd>
        </div>
        <div>
          <dt className="text-fg-tertiary">Lead size</dt>
          <dd className="font-semibold text-negative mt-0.5 tnum" data-tabular>+{gap.their_lead} events</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={() => drill.open({
          kind: 'cell',
          eyebrow: 'Calendar slot',
          title: `${MONTHS[gap.month]} · ${gap.category}`,
          month: gap.month,
          category: gap.category,
          compare: gap.city as City,
        })}
        className="inline-flex items-center h-8 px-3 rounded-sm border border-subtle hover:border-strong text-meta font-medium text-fg-secondary hover:text-fg-primary transition-colors duration-ui ease-out"
      >
        See the actual events in this slot →
      </button>
    </div>
  )
}

function ConceptsList({ decisions }: { decisions: CreateDecision[] }) {
  const { open } = useDrill()
  if (decisions.length === 0) {
    return <EmptyState title="No create-bucket concepts yet." hint="Widen the scope to see opportunities." />
  }
  return (
    <ul className="space-y-2">
      {decisions.map((d, i) => (
        <li key={d.concept.id}>
          <button
            type="button"
            onClick={() => open({
              kind: 'create-decision',
              eyebrow: 'New opportunity',
              title: d.concept.title,
              decision: d,
            })}
            className="w-full text-left rounded-sm border border-subtle px-3 py-2.5 space-y-1.5 hover:border-strong transition-colors duration-ui ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-body-sm font-semibold text-fg-primary truncate">
                <span className="text-fg-tertiary mr-2 font-mono tnum" data-tabular>{i + 1}</span>
                {d.concept.title}
              </p>
              <ConfidencePill confidence={d.confidence} />
            </div>
            <p className="text-meta text-fg-tertiary">
              {MONTHS_SHORT[d.concept.suggested_month]} · {d.concept.suggested_city} · {d.concept.category}
            </p>
          </button>
        </li>
      ))}
    </ul>
  )
}
