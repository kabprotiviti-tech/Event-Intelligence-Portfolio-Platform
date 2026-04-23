'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

/**
 * Responsive shell:
 *   md+   : sidebar sits permanently at w-60
 *   < md  : sidebar is an off-canvas drawer, opened by menu button in Topbar
 *
 * Closes on route change, locks body scroll while open, restores focus
 * to the menu button (handled by the button itself via aria-expanded cycle).
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()

  // Close drawer when the route changes
  useEffect(() => { setDrawerOpen(false) }, [pathname])

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (!drawerOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [drawerOpen])

  // Escape closes drawer
  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  return (
    <div className="flex h-screen overflow-hidden bg-surface-canvas text-fg-primary">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-30 bg-fg-primary/40 backdrop-blur-[2px]"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Primary navigation"
            className="fixed left-0 top-0 bottom-0 z-40 shadow-overlay animate-in"
          >
            <Sidebar />
          </aside>
        </div>
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar
          onMenuClick={() => setDrawerOpen(true)}
          menuOpen={drawerOpen}
        />
        <main role="main" className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
