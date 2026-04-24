'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type {
  Category, City, EnrichedGapSlot, EventDecision, CreateDecision,
  PortfolioEvent, FutureOpportunity, ScenarioResult, CompetitiveGap,
} from '@/types'
import type { MethodologyEntry } from '@/lib/methodology'
import type { SourceDetail } from '@/lib/source-details'

/**
 * Every click-to-drill action in the app resolves into one of these payloads.
 * Rendered by a single DrillPanel mounted at the (app) layout.
 */
export type DrillPayload =
  | { kind: 'events';             title: string; eyebrow: string; events: PortfolioEvent[]; sortHint?: string }
  | { kind: 'event-detail';       title: string; eyebrow: string; event: PortfolioEvent }
  | { kind: 'gaps';               title: string; eyebrow: string; gaps: EnrichedGapSlot[]; compare: City }
  | { kind: 'cell';               title: string; eyebrow: string; month: number; category: Category; compare: City }
  | { kind: 'event-decision';     title: string; eyebrow: string; decision: EventDecision }
  | { kind: 'create-decision';    title: string; eyebrow: string; decision: CreateDecision }
  | { kind: 'concepts';           title: string; eyebrow: string; concepts: CreateDecision[] }
  | { kind: 'future-opportunity'; title: string; eyebrow: string; opportunity: FutureOpportunity }
  | { kind: 'scenario';           title: string; eyebrow: string; scenario: ScenarioResult }
  | { kind: 'competitive-gap';    title: string; eyebrow: string; gap: CompetitiveGap }
  | { kind: 'methodology';        title: string; eyebrow: string; entry: MethodologyEntry }
  | { kind: 'source-detail';      title: string; eyebrow: string; detail: SourceDetail }

interface DrillState {
  payload: DrillPayload | null
  open: (p: DrillPayload) => void
  close: () => void
}

const DrillCtx = createContext<DrillState | null>(null)

export function DrillProvider({ children }: { children: ReactNode }) {
  const [payload, setPayload] = useState<DrillPayload | null>(null)

  useEffect(() => {
    if (!payload) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPayload(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [payload])

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
