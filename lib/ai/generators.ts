/**
 * AI generators — Claude-powered narrative for gaps, decisions, strategy, trends.
 * Each function returns an AiResult<T> with provenance (model, cached, fallback, confidence).
 */

import { callClaude, parseClaudeJson, isAiEnabled } from './claude'
import {
  SYSTEM_CONCEPT, SYSTEM_EXPLAIN, SYSTEM_SUMMARY, SYSTEM_TRENDS,
} from './prompts'
import {
  fallbackConcept, fallbackExplanation, fallbackSummary, fallbackTrends,
} from './fallbacks'
import type {
  AiResult, AiConceptPayload, AiExplanationPayload,
  AiSummaryPayload, AiTrendsPayload,
} from './types'
import type {
  EnrichedGapSlot, PortfolioEvent, EventDecision,
  TrendReport, DecisionConfidence,
} from '@/types'

const MONTHS = [
  '', 'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

// ── Confidence scoring for AI outputs ───────────────────────

function confidenceFromGap(gap: EnrichedGapSlot): DecisionConfidence {
  if (gap.severity === 'Critical' && gap.competitor_context) return 'High'
  if (gap.severity === 'Medium') return 'Medium'
  return 'Low'
}

function confidenceFromEvent(event: PortfolioEvent): DecisionConfidence {
  if (event.verification_level === 'Tier 1') return 'High'
  if (event.verification_level === 'Tier 2') return 'Medium'
  return 'Low'
}

function confidenceFromPortfolio(events: PortfolioEvent[]): DecisionConfidence {
  if (events.length === 0) return 'Low'
  const tier1Count = events.filter(e => e.verification_level === 'Tier 1').length
  const share = tier1Count / events.length
  if (share >= 0.7) return 'High'
  if (share >= 0.4) return 'Medium'
  return 'Low'
}

// ── Step 2: Event concept generation ────────────────────────

export async function generateEventConcept(gap: EnrichedGapSlot): Promise<AiResult<AiConceptPayload>> {
  const confidence = confidenceFromGap(gap)

  if (!isAiEnabled()) {
    return { data: fallbackConcept(gap), confidence, model: 'fallback', cached: false, fallback: true }
  }

  const userMsg = buildConceptPrompt(gap)
  const res = await callClaude(SYSTEM_CONCEPT, userMsg, { maxTokens: 400 })
  if (!res) {
    return { data: fallbackConcept(gap), confidence, model: 'fallback', cached: false, fallback: true }
  }

  const parsed = parseClaudeJson<AiConceptPayload>(res.text)
  if (!parsed || !parsed.title || !parsed.format) {
    return { data: fallbackConcept(gap), confidence: 'Low', model: res.model, cached: res.cached, fallback: true, latency_ms: res.latency_ms }
  }

  return { data: parsed, confidence, model: res.model, cached: res.cached, fallback: false, latency_ms: res.latency_ms }
}

function buildConceptPrompt(gap: EnrichedGapSlot): string {
  return `Propose an event concept for the following calendar gap.

Gap signal (pre-computed upstream, do not recompute):
- City: ${gap.city}
- Month: ${MONTHS[gap.month]}
- Category: ${gap.category}
- Severity: ${gap.severity}
- Gap score: ${Math.round(gap.gap_score * 100)}%
- Competitor context: ${gap.competitor_context}
- Current hint: ${gap.recommendation_hint}

Generate one concept that realistically fills this gap. Respond with the JSON schema from the system prompt. No prose outside the JSON.`
}

// ── Step 3: Decision explanation ────────────────────────────

export async function explainDecision(
  event: PortfolioEvent,
  decision: EventDecision['kind'],
): Promise<AiResult<AiExplanationPayload>> {
  const confidence = confidenceFromEvent(event)

  if (!isAiEnabled()) {
    return { data: fallbackExplanation(event, decision), confidence, model: 'fallback', cached: false, fallback: true }
  }

  const userMsg = buildExplainPrompt(event, decision)
  const res = await callClaude(SYSTEM_EXPLAIN, userMsg, { maxTokens: 350 })
  if (!res) {
    return { data: fallbackExplanation(event, decision), confidence, model: 'fallback', cached: false, fallback: true }
  }

  const parsed = parseClaudeJson<AiExplanationPayload>(res.text)
  if (!parsed || !parsed.explanation) {
    return { data: fallbackExplanation(event, decision), confidence: 'Low', model: res.model, cached: res.cached, fallback: true, latency_ms: res.latency_ms }
  }

  return { data: parsed, confidence, model: res.model, cached: res.cached, fallback: false, latency_ms: res.latency_ms }
}

function buildExplainPrompt(event: PortfolioEvent, decision: EventDecision['kind']): string {
  return `Explain this portfolio decision to a director. Do not recompute scores; they are final inputs.

Event:
- Name: ${event.name}
- City: ${event.city}
- Category: ${event.category}
- Format: ${event.event_format}
- Portfolio score: ${event.portfolio_score.toFixed(1)} / 10
- ROI: ${event.roi_score.toFixed(1)} · Strategic fit: ${event.strategic_fit_score.toFixed(1)} · Seasonality: ${event.seasonality_score.toFixed(1)} · Tourism impact: ${event.tourism_impact_score.toFixed(1)} · Private sector: ${event.private_sector_score.toFixed(1)}
- Impact weight: ${event.impact_weight}/5
- Verification: ${event.verification_level}
- Budget allocated: AED ${event.budget_allocated ? (event.budget_allocated / 1_000_000).toFixed(1) + 'M' : 'unset'}
- Estimated attendance: ${event.estimated_attendance.toLocaleString()}

Decision: ${decision.toUpperCase()}

Write the explanation in the JSON schema from the system prompt.`
}

// ── Step 4: Strategic summary ───────────────────────────────

export async function generateStrategicSummary(
  gaps: EnrichedGapSlot[],
  portfolio: PortfolioEvent[],
): Promise<AiResult<AiSummaryPayload>> {
  const confidence = confidenceFromPortfolio(portfolio)

  if (!isAiEnabled()) {
    return { data: fallbackSummary(gaps, portfolio), confidence, model: 'fallback', cached: false, fallback: true }
  }

  const userMsg = buildSummaryPrompt(gaps, portfolio)
  const res = await callClaude(SYSTEM_SUMMARY, userMsg, { maxTokens: 600 })
  if (!res) {
    return { data: fallbackSummary(gaps, portfolio), confidence, model: 'fallback', cached: false, fallback: true }
  }

  const parsed = parseClaudeJson<AiSummaryPayload>(res.text)
  if (!parsed || !parsed.headline) {
    return { data: fallbackSummary(gaps, portfolio), confidence: 'Low', model: res.model, cached: res.cached, fallback: true, latency_ms: res.latency_ms }
  }

  return { data: parsed, confidence, model: res.model, cached: res.cached, fallback: false, latency_ms: res.latency_ms }
}

function buildSummaryPrompt(gaps: EnrichedGapSlot[], portfolio: PortfolioEvent[]): string {
  const topGaps = gaps
    .filter(g => g.severity !== 'Low')
    .sort((a, b) => b.gap_score - a.gap_score)
    .slice(0, 5)
    .map(g => `- ${MONTHS[g.month]} ${g.category} · ${g.severity} · ${g.competitor_context}`)
    .join('\n')

  const topEvents = [...portfolio]
    .sort((a, b) => b.portfolio_score - a.portfolio_score)
    .slice(0, 5)
    .map(e => `- ${e.name} · score ${e.portfolio_score.toFixed(1)} · ${e.category} · ${e.verification_level}`)
    .join('\n')

  const lowEvents = [...portfolio]
    .sort((a, b) => a.portfolio_score - b.portfolio_score)
    .slice(0, 3)
    .map(e => `- ${e.name} · score ${e.portfolio_score.toFixed(1)}`)
    .join('\n')

  const avgScore = portfolio.length
    ? (portfolio.reduce((s, e) => s + e.portfolio_score, 0) / portfolio.length).toFixed(1)
    : '—'

  return `Write a strategic summary for a director briefing.

Current portfolio
- Events: ${portfolio.length}
- Average score: ${avgScore}/10

Top gaps (severity ranked)
${topGaps || '- none above Low severity'}

Top portfolio events
${topEvents || '- no events in scope'}

Weakest portfolio events
${lowEvents || '- none'}

Respond with the JSON schema from the system prompt.`
}

// ── Step 5: Trend analysis ──────────────────────────────────

export async function analyzeTrends(
  trends: TrendReport,
  recentEventTitles: string[] = [],
): Promise<AiResult<AiTrendsPayload>> {
  const confidence: DecisionConfidence =
    trends.signals.length >= 3 ? 'High'
  : trends.signals.length >= 1 ? 'Medium'
  : 'Low'

  if (!isAiEnabled()) {
    return { data: fallbackTrends(trends), confidence, model: 'fallback', cached: false, fallback: true }
  }

  const userMsg = buildTrendsPrompt(trends, recentEventTitles)
  const res = await callClaude(SYSTEM_TRENDS, userMsg, { maxTokens: 500 })
  if (!res) {
    return { data: fallbackTrends(trends), confidence, model: 'fallback', cached: false, fallback: true }
  }

  const parsed = parseClaudeJson<AiTrendsPayload>(res.text)
  if (!parsed || !Array.isArray(parsed.trending_categories)) {
    return { data: fallbackTrends(trends), confidence: 'Low', model: res.model, cached: res.cached, fallback: true, latency_ms: res.latency_ms }
  }

  return { data: parsed, confidence, model: res.model, cached: res.cached, fallback: false, latency_ms: res.latency_ms }
}

function buildTrendsPrompt(trends: TrendReport, recentTitles: string[]): string {
  const signals = trends.signals
    .map(s => `- ${s.category}: ${s.direction} (momentum ${(s.momentum * 100).toFixed(0)}%) — ${s.evidence.join('; ')}`)
    .join('\n')

  const formats = trends.emerging_formats
    .map(f => `- ${f.format}: +${Math.round(f.growth * 100)}% — examples: ${f.sample_events.slice(0, 2).join(', ')}`)
    .join('\n') || '- none'

  const titles = recentTitles.slice(0, 15).map(t => `- ${t}`).join('\n') || '- none'

  return `Synthesize trend intelligence for the director brief.

Pre-computed category momentum (do not recompute, use verbatim):
${signals}

Emerging formats (pre-computed):
${formats}

Recent event / article titles (for flavour only, no score derivation):
${titles}

Respond with the JSON schema from the system prompt.`
}
