'use client'
import { useCallback, useEffect, useState } from 'react'
import {
  type DashboardFingerprint, SNAPSHOT_VERSION,
} from '@/lib/dashboard-diff'

const KEY = 'eipp.dashboard.last_snapshot'

type SnapshotStatus = 'loading' | 'first-visit' | 'has-snapshot'

interface UseLastVisitSnapshot {
  status: SnapshotStatus
  snapshot: DashboardFingerprint | null
  /** Store a new baseline. Called when user clicks "Mark as read". */
  markAsRead: (current: DashboardFingerprint) => void
  /** Silent — e.g. first-visit auto-save. */
  initialize: (current: DashboardFingerprint) => void
}

/**
 * Persists the user's last dashboard fingerprint in localStorage so we can
 * diff "since last visit" on subsequent page loads.
 */
export function useLastVisitSnapshot(): UseLastVisitSnapshot {
  const [snapshot, setSnapshot] = useState<DashboardFingerprint | null>(null)
  const [status, setStatus] = useState<SnapshotStatus>('loading')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) {
        setStatus('first-visit')
        return
      }
      const parsed = JSON.parse(raw) as DashboardFingerprint
      if (parsed.version !== SNAPSHOT_VERSION) {
        // Future migration point — for now just treat as first visit
        setStatus('first-visit')
        return
      }
      setSnapshot(parsed)
      setStatus('has-snapshot')
    } catch {
      setStatus('first-visit')
    }
  }, [])

  const save = useCallback((fp: DashboardFingerprint) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(fp))
    } catch { /* quota / privacy modes — silent */ }
  }, [])

  const markAsRead = useCallback((current: DashboardFingerprint) => {
    save(current)
    setSnapshot(current)
    setStatus('has-snapshot')
  }, [save])

  const initialize = useCallback((current: DashboardFingerprint) => {
    save(current)
    setSnapshot(current)
    setStatus('has-snapshot')
  }, [save])

  return { status, snapshot, markAsRead, initialize }
}
