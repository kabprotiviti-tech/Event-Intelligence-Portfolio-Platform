import type { Event, Category, City, SourceType, VerificationLevel } from '@/types'

export type ConnectorKind = 'government' | 'marketplace' | 'news'

export interface ConnectorMeta {
  id: string
  kind: ConnectorKind
  label: string
  default_tier: VerificationLevel
  enabled: boolean
}

export interface EventFilters {
  city?: City | City[]
  category?: Category
  year?: number
  month?: number
  verification_level?: VerificationLevel
}

export interface DataProvider {
  readonly meta: ConnectorMeta
  getEvents(filters?: EventFilters): Promise<Event[]>
  healthCheck?(): Promise<boolean>
}

export interface NormalizerContext {
  sourceId: string
  sourceType: SourceType
  defaultTier: VerificationLevel
}

/** Raw untyped data at the external boundary — we normalize before anything else touches it. */
export type RawEvent = Record<string, any>
