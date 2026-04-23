export type Category = 'Family' | 'Entertainment' | 'Sports'

export type City = 'Abu Dhabi' | 'Dubai' | 'Riyadh' | 'Doha' | 'Muscat'

export type CityGroup = 'Abu Dhabi' | 'Dubai' | 'GCC'

export type SourceType = 'government' | 'marketplace' | 'news'

export type VerificationLevel = 'Tier 1' | 'Tier 2' | 'Tier 3'

export type TourismOrigin =
  | 'Domestic'
  | 'GCC'
  | 'South Asia'
  | 'Europe'
  | 'North America'
  | 'East Asia'
  | 'Mixed'

export type IndoorOutdoor = 'Indoor' | 'Outdoor' | 'Mixed'

export type EventStatus = 'Active' | 'Proposed' | 'Under Review' | 'Dropped' | 'Approved'

export type EventFormat = 'Festival' | 'Concert' | 'Tournament' | 'Exhibition' | 'Conference'

export interface TicketPriceRange {
  min: number
  max: number
  currency: 'AED'
}

export interface Event {
  id: string
  name: string
  category: Category
  event_format: EventFormat
  city: City
  country: string
  start_date: string
  end_date?: string
  venue: string
  estimated_attendance: number
  ticket_price_range: TicketPriceRange
  source_type: SourceType
  verification_level: VerificationLevel
  tourism_origin: TourismOrigin
  indoor_outdoor: IndoorOutdoor
  impact_weight: 1 | 2 | 3 | 4 | 5
  min_budget_required: number
  roi_score: number
  strategic_fit_score: number
  seasonality_score: number
  private_sector_score: number
  tourism_impact_score: number
  portfolio_score?: number
}

export interface GapSlot {
  month: number
  year: number
  category: Category
  city: City
  event_count: number
  weighted_density: number
  density: 'empty' | 'light' | 'moderate' | 'heavy'
  gap_score: number
}

export interface GapReport {
  city: City
  year: number
  slots: GapSlot[]
  summary: {
    emptiest_month: number
    emptiest_category: Category
    total_gaps: number
  }
}

export type GapSeverity = 'Critical' | 'Medium' | 'Low'

export interface EnrichedGapSlot extends GapSlot {
  severity: GapSeverity
  competitor_context: string
  recommendation_hint: string
}

export interface EnrichedGapReport extends Omit<GapReport, 'slots'> {
  slots: EnrichedGapSlot[]
}

export interface EventConcept {
  id: string
  title: string
  category: Category
  event_format: EventFormat
  suggested_month: number
  suggested_city: City
  estimated_audience: number
  estimated_budget: number
  reason: string
  reference_events: string[]
  gap_score: number
  confidence: 'High' | 'Medium' | 'Low'
}

export interface PortfolioEvent extends Event {
  portfolio_score: number
  budget_allocated?: number
  status: EventStatus
}

export interface PortfolioSummary {
  total_events: number
  total_budget: number
  avg_portfolio_score: number
  by_category: Record<Category, number>
  by_city: Record<string, number>
}

export type DecisionKind = 'fund' | 'scale' | 'drop' | 'create'

export type DecisionConfidence = 'High' | 'Medium' | 'Low'

export type FactorSignal = 'positive' | 'negative' | 'neutral'

export interface KeyFactor {
  label: string
  value: string
  signal: FactorSignal
}

interface DecisionBase {
  reason: string
  key_factors: KeyFactor[]
  confidence: DecisionConfidence
}

export interface EventDecision extends DecisionBase {
  kind: 'fund' | 'scale' | 'drop'
  event: PortfolioEvent
}

export interface CreateDecision extends DecisionBase {
  kind: 'create'
  concept: EventConcept
}

/** @deprecated use EventDecision — kept for callers that still read .event + .reason */
export type DecisionEntry = EventDecision

export interface DecisionConstraints {
  category_balance: Record<Category, { count: number; below_min: boolean }>
  seasonality: {
    peak_months: number[]
    low_months: number[]
  }
  budget: {
    total: number
    allocated: number
    within_limit: boolean
    utilization_pct: number
  }
  competition: {
    target_city: string
    comparison_city: string
    ad_deficit_slots: number   // number of month/category slots where target lags comparison
  }
}

export interface DecisionPanel {
  fund: EventDecision[]
  scale: EventDecision[]
  drop: EventDecision[]
  create: CreateDecision[]
  constraints: DecisionConstraints
}

export interface PortfolioBundle {
  events: PortfolioEvent[]
  summary: PortfolioSummary
  decisions: DecisionPanel
  budget: number
}

// ─── Scenario engine ────────────────────────────────────────

export type RiskLevel = 'conservative' | 'balanced' | 'aggressive'

export interface ScenarioConfig {
  id: string
  name: string
  total_budget: number
  category_focus?: Category | 'All'
  target_audience?: TourismOrigin | 'All'
  risk_level: RiskLevel
  year?: number
}

export interface ScenarioProjections {
  total_roi_score: number           // sum of roi_score across picked events
  total_attendance: number
  avg_portfolio_score: number
  category_distribution: Record<Category, number>
  gaps_filled: number
  budget_utilization_pct: number
  events_count: number
}

export interface ScenarioResult {
  config: ScenarioConfig
  portfolio: PortfolioEvent[]
  projections: ScenarioProjections
}

export interface ScenarioComparison {
  scenarios: ScenarioResult[]
  leader_by_metric: {
    roi: string
    attendance: string
    balance: string
    seasonality: string
  }
  recommendation: string
}

// ─── Trend intelligence ─────────────────────────────────────

export type TrendDirection = 'rising' | 'declining' | 'stable'

export interface TrendSignal {
  category: Category
  direction: TrendDirection
  momentum: number            // -1 → +1
  evidence: string[]
}

export interface EmergingFormat {
  format: EventFormat
  growth: number              // -1 → +1
  sample_events: string[]
}

export interface TrendReport {
  signals: TrendSignal[]
  emerging_formats: EmergingFormat[]
  recommended_focus: Array<{ category: Category; reason: string }>
}

// ─── Strategic outlook ──────────────────────────────────────

export type CompetitivePosition = 'leading' | 'matching' | 'lagging'

export interface YearlyOutlook {
  year: number
  projected_events: number
  category_mix: Record<Category, number>
  gap_count: number
  competitive_position: CompetitivePosition
}

export interface CompetitiveGap {
  city: string
  month: number
  category: Category
  their_lead: number          // count difference
}

export interface UnderdevelopedCategory {
  category: Category
  avg_share_pct: number
  severity: 'High' | 'Medium' | 'Low'
  reason: string
}

export interface StrategicOutlook {
  horizon_years: number
  yearly: YearlyOutlook[]
  underdeveloped_categories: UnderdevelopedCategory[]
  competitive_gaps: CompetitiveGap[]
  long_term_recommendations: string[]
}

// ─── Future opportunities ───────────────────────────────────

export type OpportunityHorizon = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Next year' | 'Multi-year'

export interface FutureOpportunity {
  id: string
  title: string
  category: Category
  horizon: OpportunityHorizon
  reasoning: string
  evidence: string[]
  confidence: DecisionConfidence
  investment_range: { min: number; max: number }
}

// ─── Chairman brief (top-level bundle) ──────────────────────

export type PortfolioHealthLabel = 'Strong' | 'Solid' | 'At risk' | 'Weak'
export type HealthTrajectory = 'improving' | 'stable' | 'declining'

export interface PortfolioHealth {
  score: number               // 0–10
  label: PortfolioHealthLabel
  trajectory: HealthTrajectory
  factors: Array<{ label: string; signal: 'positive' | 'negative' | 'neutral' }>
}

export interface ChairmanBrief {
  generated_at: string
  target_city: City
  portfolio_health: PortfolioHealth
  key_gaps: EnrichedGapSlot[]            // top 5
  recommended_actions: DecisionPanel
  strategic_outlook: StrategicOutlook
  trends: TrendReport
  future_opportunities: FutureOpportunity[]
  scenarios: ScenarioComparison           // 3 preset scenarios auto-run
}

export interface ApiResponse<T> {
  data: T
  meta: {
    count?: number
    generated_at: string
  }
}
