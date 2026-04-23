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

export type DecisionKind = 'fund' | 'scale' | 'drop'

export interface DecisionEntry {
  event: PortfolioEvent
  reason: string
}

export interface DecisionPanel {
  fund: DecisionEntry[]
  scale: DecisionEntry[]
  drop: DecisionEntry[]
}

export interface PortfolioBundle {
  events: PortfolioEvent[]
  summary: PortfolioSummary
  decisions: DecisionPanel
  budget: number
}

export interface ApiResponse<T> {
  data: T
  meta: {
    count?: number
    generated_at: string
  }
}
