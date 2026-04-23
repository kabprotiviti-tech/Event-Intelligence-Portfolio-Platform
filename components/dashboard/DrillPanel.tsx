'use client'
import { useDrill, type DrillPayload } from '@/context/DrillContext'
import { CloseIcon } from '@/components/system/Icon'
import { DrillBody } from './DrillBody'

/**
 * Slide-in right panel rendered at the top of the dashboard page.
 * Consumes the current DrillPayload and delegates rendering to DrillBody.
 */
export function DrillPanel() {
  const { payload, close } = useDrill()
  if (!payload) return null

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label={payload.title}>
      {/* Backdrop */}
      <button
        type="button"
        onClick={close}
        aria-label="Close drill-down"
        className="absolute inset-0 bg-fg-primary/30 animate-fade-in"
      />

      {/* Panel */}
      <aside className="absolute right-0 top-0 bottom-0 w-full sm:w-[540px] bg-surface-card border-l border-subtle shadow-overlay overflow-hidden flex flex-col animate-in-right">
        <header className="shrink-0 border-b border-subtle px-6 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-eyebrow uppercase text-fg-tertiary">{payload.eyebrow}</p>
            <h2 className="text-h3 font-semibold text-fg-primary mt-1 leading-snug">
              {payload.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="p-1 -mr-1 text-fg-secondary hover:text-fg-primary transition-colors duration-ui ease-out"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <DrillBody payload={payload} />
        </div>
      </aside>
    </div>
  )
}
