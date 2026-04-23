'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from '@/lib/theme/ThemeProvider'
import { THEME_IDS, THEMES, type ThemeId } from '@/lib/theme/tokens'
import { CheckIcon } from './Icon'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const current = THEMES[theme]

  // Close on outside click + Escape
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-2 h-7 px-2.5 rounded-sm border border-subtle bg-surface-card text-meta text-fg-secondary hover:text-fg-primary hover:border-strong transition-colors duration-ui ease-out"
      >
        <ThemeSwatch id={theme} />
        <span className="hidden md:inline">{current.label}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Theme"
          className="absolute right-0 mt-2 w-[320px] rounded-md bg-surface-card shadow-overlay z-40 py-1 max-h-[70vh] overflow-y-auto"
        >
          <p className="text-eyebrow uppercase text-fg-tertiary px-3 pt-2 pb-1">Presentation mode</p>
          {THEME_IDS.map(id => {
            const t = THEMES[id]
            const selected = id === theme
            return (
              <button
                key={id}
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => { setTheme(id); setOpen(false) }}
                className={[
                  'w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors duration-ui ease-out',
                  selected ? 'bg-surface-inset' : 'hover:bg-surface-inset',
                ].join(' ')}
              >
                <ThemeSwatch id={id} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-body-sm font-medium text-fg-primary">{t.label}</span>
                    <span className="text-eyebrow uppercase text-fg-tertiary">
                      {t.mode === 'dark' ? 'Dark' : 'Light'}
                    </span>
                  </div>
                  <p className="text-meta text-fg-tertiary leading-snug mt-0.5 line-clamp-2">
                    {t.scenario}
                  </p>
                </div>
                {selected && <CheckIcon className="mt-1 text-accent shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** Five-square swatch showing canvas / card / text / accent / focus for a theme. */
function ThemeSwatch({ id }: { id: ThemeId }) {
  const t = THEMES[id]
  const swatches = [t.surface.canvas, t.surface.card, t.text.primary, t.accent.base, t.focus]
  return (
    <span
      aria-hidden
      className="shrink-0 inline-flex h-5 rounded-sm border border-subtle overflow-hidden"
    >
      {swatches.map((color, i) => (
        <span key={i} className="w-2 h-full" style={{ backgroundColor: color }} />
      ))}
    </span>
  )
}
