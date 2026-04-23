export type Category = 'Family' | 'Entertainment' | 'Sports'

export type City = 'Abu Dhabi' | 'Dubai' | 'Riyadh' | 'Doha' | 'Muscat'

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

export type EventStatus = 'Active' | 'Proposed' | 'Under Review' | 'Dropped'

export interface TicketPriceRange {
  min: number
  max: number
  currency: 'AED'
}

export interface Event {
  id: string
  name: string
  category: Category
  city: City
  country: string
  date: string
  endDate?: string
  venue: string
  estimated_attendance: number
  ticket_price_range: TicketPriceRange
  source_type: SourceType
  verification_level: VerificationLevel
  tourism_origin: TourismOrigin
  indoor_outdoor: IndoorOutdoor
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

export interface EventConcept {
  id: string
  title: string
  category: Category
  suggested_month: number
  suggested_city: City
  estimated_audience: number
  reason: string
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

export interface ApiResponse<T> {
  data: T
  meta: {
    count?: number
    generated_at: string
  }
}
