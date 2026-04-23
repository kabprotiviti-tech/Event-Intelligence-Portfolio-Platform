import Anthropic from '@anthropic-ai/sdk'

/**
 * Claude API wrapper for EIPP.
 *
 * Responsibilities:
 *   1. Create a singleton client (re-used across API routes — Vercel lambda
 *      warm starts reuse module state).
 *   2. Invoke claude-haiku-4-5 for fast, low-cost narrative generation.
 *   3. Apply prompt caching to the system prompt — every generator reuses
 *      the same EIPP context, so the cache hit rate is near 100%.
 *   4. Parse JSON safely. Strip accidental markdown fencing.
 *   5. Degrade gracefully when ANTHROPIC_API_KEY is missing.
 *
 * The wrapper never throws. On failure it returns null + logs with a tag
 * so every caller can fall back to deterministic text.
 */

const MODEL = 'claude-haiku-4-5'  // Latest Haiku — fastest tier for director-facing generation
const MAX_TOKENS = 800
const TIMEOUT_MS = 10_000

let client: Anthropic | null = null

function getClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  if (!client) {
    client = new Anthropic({
      apiKey: key,
      timeout: TIMEOUT_MS,
      maxRetries: 1,
    })
  }
  return client
}

export function isAiEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

export interface ClaudeCallResult {
  text: string
  model: string
  cached: boolean        // true if any block was served from cache
  latency_ms: number
}

/**
 * Low-level text call. `system` becomes a cacheable block so the same
 * instructional context across calls gets the discount.
 */
export async function callClaude(
  system: string,
  user: string,
  opts: { maxTokens?: number; temperature?: number } = {},
): Promise<ClaudeCallResult | null> {
  const anthropic = getClient()
  if (!anthropic) return null

  const t0 = Date.now()
  try {
    const res = await anthropic.messages.create({
      model: MODEL,
      max_tokens: opts.maxTokens ?? MAX_TOKENS,
      temperature: opts.temperature ?? 0.4,
      system: [
        {
          type: 'text',
          text: system,
          cache_control: { type: 'ephemeral' },   // cache the static EIPP context
        },
      ],
      messages: [{ role: 'user', content: user }],
    })

    const text = res.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('')

    const cacheRead = (res.usage as unknown as { cache_read_input_tokens?: number })?.cache_read_input_tokens ?? 0

    return {
      text,
      model: res.model,
      cached: cacheRead > 0,
      latency_ms: Date.now() - t0,
    }
  } catch (err) {
    console.error('[claude] call failed:', err instanceof Error ? err.message : err)
    return null
  }
}

/**
 * Parse Claude's JSON output. Tolerates markdown fences and leading/trailing prose.
 */
export function parseClaudeJson<T>(raw: string): T | null {
  let body = raw.trim()

  // Strip ```json ... ``` fences if Claude decided to add them
  if (body.startsWith('```')) {
    body = body.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
  }

  // Find the first { and the matching last } to tolerate prose around
  const first = body.indexOf('{')
  const last = body.lastIndexOf('}')
  if (first !== -1 && last !== -1 && last > first) {
    body = body.slice(first, last + 1)
  }

  try {
    return JSON.parse(body) as T
  } catch {
    return null
  }
}
