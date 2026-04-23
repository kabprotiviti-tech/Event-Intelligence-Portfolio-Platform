'use client'
import { useEffect, useState, useCallback } from 'react'

const KEY = 'eipp.approved_concepts'

/**
 * Client-side persistence of which concept IDs the director has approved.
 * Source of truth for the server-side Proposed events is the in-memory
 * portfolio store — this mirrors it so UI re-highlight survives reload.
 */
export function useApprovedConcepts() {
  const [ids, setIds] = useState<Set<string>>(new Set())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setIds(new Set(JSON.parse(raw)))
    } catch {}
    setReady(true)
  }, [])

  const persist = useCallback((next: Set<string>) => {
    try { localStorage.setItem(KEY, JSON.stringify(Array.from(next))) } catch {}
  }, [])

  const toggle = useCallback((id: string) => {
    setIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      persist(next)
      return next
    })
  }, [persist])

  const add = useCallback((id: string) => {
    setIds(prev => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      persist(next)
      return next
    })
  }, [persist])

  const remove = useCallback((id: string) => {
    setIds(prev => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      persist(next)
      return next
    })
  }, [persist])

  return { ids, ready, toggle, add, remove, has: (id: string) => ids.has(id) }
}
