'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type {
  Category, City, EnrichedGapSlot, EventDecision, CreateDecision, PortfolioEvent,
} from '@/types'

/**
 * Every click-to-drill action on the dashboard resolves into one of these payloads.
 * A single slide-in panel reads the payload and renders the appropriate view.
 */
export type DrillPayload =
  | {
      kind: 'events'
      title: string                         // "All events in scope" / "Top performers"
      eyebrow: string                       // short context label
      events: PortfolioEvent[]
      sortHint?: string                     // "sorted by score" / "sorted by date"
    }
  | {
      kind: 'gaps'
      title: string
      eyebrow: string
      gaps: EnrichedGapSlot[]
      compare: City                         // the comparison city for cell-drill handoff
    }
  | {
      kind: 'cell'
      title: string
      eyebrow: string
      month: number
      category: Category
      compare: City
    }
  | {
      kind: 'event-decision'
      title: string
      eyebrow: string
      decision: EventDecision
    }
  | {
      kind: 'create-decision'
      title: string
      eyebrow: string
      decision: CreateDecision
    }
  | {
      kind: 'concepts'
      title: string
      eyebrow: string
      concepts: CreateDecision[]
    }

interface DrillState {
  payload: DrillPayload | null
  open: (p: DrillPayload) => void
  close: () => void
}

const DrillCtx = createContext<DrillState | null>(null)

export function DrillProvider({ children }: { children: ReactNode }) {
  const [payload, setPayload] = useState<DrillPayload | null>(null)

  // Escape closes
  useEffect(() => {
    if (!payload) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPayload(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [payload])

  // Lock body scroll while panel is open
  useEffect(() => {
    if (!payload) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [payload])

  return (
    <DrillCtx.Provider value={{
      payload,
      open: setPayload,
      close: () => setPayload(null),
    }}>
      {children}
    </DrillCtx.Provider>
  )
}

export function useDrill() {
  const ctx = useContext(DrillCtx)
  if (!ctx) throw new Error('useDrill must be used inside DrillProvider')
  return ctx
}
