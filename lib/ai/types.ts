import type { DecisionConfidence } from '@/types'

/**
 * Every AI result carries provenance — the UI shows whether a narrative
 * came from Claude or from a deterministic fallback, and how confident we are.
 */
export interface AiResult<T> {
  data: T
  confidence: DecisionConfidence
  model: string               // "claude-haiku-4-5" or "fallback"
  cached: boolean             // prompt-cache hit on the Anthropic side
  fallback: boolean           // true when Claude wasn't used (key missing / error)
  latency_ms?: number
}

export interface AiConceptPayload {
  title: string
  format: 'Festival' | 'Concert' | 'Tournament' | 'Exhibition' | 'Conference'
  audience_estimate: number
  reason: string              // plain English, 1–2 sentences
  risks?: string[]
}

export interface AiExplanationPayload {
  explanation: string         // single-sentence headline
  bullet_reasons: string[]    // 2–3 crisp bullets
  caveats?: string[]
}

export interface AiSummaryPayload {
  headline: string            // one-sentence leadership read
  key_gaps: string[]
  portfolio_weaknesses: string[]
  recommended_focus_areas: string[]
}

export interface AiTrendsPayload {
  trending_categories: Array<{ category: string; reason: string }>
  emerging_formats: Array<{ format: string; reason: string }>
  market_signals: string[]
}
