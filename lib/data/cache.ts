/**
 * Minimal TTL memoization. Module-level Map, survives within a single
 * server process. Loses cache on redeploy (acceptable for MVP).
 *
 * Key convention: `${connectorId}:${stableQuerySignature}`
 */

interface Entry<T> {
  expires: number
  data: T
}

declare global {
  // eslint-disable-next-line no-var
  var __eippDataCache: Map<string, Entry<any>> | undefined
}

function store() {
  if (!globalThis.__eippDataCache) {
    globalThis.__eippDataCache = new Map()
  }
  return globalThis.__eippDataCache
}

export async function memoize<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
): Promise<T> {
  const cache = store()
  const hit = cache.get(key)
  const now = Date.now()
  if (hit && hit.expires > now) return hit.data as T

  const data = await loader()
  cache.set(key, { expires: now + ttlMs, data })
  return data
}

export function invalidate(prefix?: string) {
  const cache = store()
  if (!prefix) {
    cache.clear()
    return
  }
  for (const k of cache.keys()) if (k.startsWith(prefix)) cache.delete(k)
}
