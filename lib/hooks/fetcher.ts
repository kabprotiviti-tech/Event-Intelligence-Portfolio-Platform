export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

export const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) {
    let body = ''
    try { body = (await res.json()).error ?? '' } catch {}
    throw new ApiError(res.status, body || `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

/** Build a query string from a partial filter object, skipping empties. */
export function qs(params: Record<string, string | number | undefined | null>): string {
  const filtered = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== '' && v !== 'All'
  )
  if (filtered.length === 0) return ''
  return '?' + new URLSearchParams(filtered.map(([k, v]) => [k, String(v)])).toString()
}
