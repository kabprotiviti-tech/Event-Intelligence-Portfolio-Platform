interface Options {
  timeout_ms?: number
  retries?: number
  headers?: Record<string, string>
}

/**
 * Robust fetch with timeout + single retry.
 * Never throws opaque errors — always labels the upstream host for log triage.
 */
export async function fetchText(url: string, opts: Options = {}): Promise<string> {
  const { timeout_ms = 6000, retries = 1, headers } = opts
  const host = safeHost(url)

  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeout_ms)
    try {
      const res = await fetch(url, {
        signal: ctrl.signal,
        cache: 'no-store',
        headers: {
          'User-Agent': 'EIPP/0.5 (+https://events.abudhabi)',
          ...headers,
        },
      })
      clearTimeout(timer)
      if (!res.ok) throw new Error(`HTTP ${res.status} from ${host}`)
      return await res.text()
    } catch (err) {
      clearTimeout(timer)
      if (attempt === retries) {
        throw new Error(`[${host}] ${err instanceof Error ? err.message : 'fetch failed'}`)
      }
      // Brief backoff before retry
      await new Promise(r => setTimeout(r, 250))
    }
  }
  throw new Error('unreachable')
}

export async function fetchJson<T = unknown>(url: string, opts: Options = {}): Promise<T> {
  const text = await fetchText(url, {
    ...opts,
    headers: { Accept: 'application/json', ...(opts.headers ?? {}) },
  })
  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error(`[${safeHost(url)}] invalid JSON response`)
  }
}

function safeHost(url: string): string {
  try { return new URL(url).host } catch { return url }
}
