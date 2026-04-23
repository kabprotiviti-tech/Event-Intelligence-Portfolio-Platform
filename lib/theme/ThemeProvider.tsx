'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { DEFAULT_THEME, THEMES, type ThemeId } from './tokens'

const STORAGE_KEY = 'eipp.theme'

interface ThemeState {
  theme: ThemeId
  setTheme: (t: ThemeId) => void
  allThemes: typeof THEMES
}

const ThemeCtx = createContext<ThemeState | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initial value is the attribute that the no-FOUC inline script set on <html>.
  const [theme, setThemeState] = useState<ThemeId>(() => {
    if (typeof document === 'undefined') return DEFAULT_THEME
    const attr = document.documentElement.getAttribute('data-theme') as ThemeId | null
    return attr && attr in THEMES ? attr : DEFAULT_THEME
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem(STORAGE_KEY, theme) } catch {}
  }, [theme])

  return (
    <ThemeCtx.Provider value={{ theme, setTheme: setThemeState, allThemes: THEMES }}>
      {children}
    </ThemeCtx.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeCtx)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}

/**
 * Inline script — runs before React hydrates to set the theme on <html>,
 * preventing a flash of the default theme when the user's preference differs.
 * Kept as a string so Next can inject it as-is without bundling.
 */
export const NO_FOUC_SCRIPT = `
(function() {
  try {
    var t = localStorage.getItem('${STORAGE_KEY}');
    var valid = ${JSON.stringify(Object.keys(THEMES))};
    if (!t || valid.indexOf(t) === -1) t = '${DEFAULT_THEME}';
    document.documentElement.setAttribute('data-theme', t);
  } catch (_) {
    document.documentElement.setAttribute('data-theme', '${DEFAULT_THEME}');
  }
})();
`.trim()
