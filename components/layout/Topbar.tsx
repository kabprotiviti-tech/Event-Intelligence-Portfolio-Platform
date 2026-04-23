'use client'
import { usePathname } from 'next/navigation'
import { CitySelector } from './CitySelector'

const TITLES: Record<string, { title: string; sub: string }> = {
  '/dashboard': { title: 'Event Intelligence Platform', sub: 'Director overview · 2025 calendar' },
  '/gaps':      { title: 'Gap Finder',                   sub: 'Cross-city calendar analysis' },
  '/concepts':  { title: 'Concept Generator',            sub: 'Gap-sourced event opportunities' },
  '/portfolio': { title: 'Portfolio Optimizer',          sub: 'Scoring, budgeting & prioritization' },
}

export function Topbar() {
  const pathname = usePathname()
  const meta = TITLES[pathname] ?? TITLES['/dashboard']

  return (
    <header
      role="banner"
      className="h-16 border-b border-subtle bg-surface-card flex items-center px-6 lg:px-8 justify-between shrink-0"
    >
      <div className="min-w-0">
        <h1 className="text-h3 font-semibold text-fg-primary leading-tight truncate">
          {meta.title}
        </h1>
        <p className="text-meta text-fg-tertiary mt-0.5 truncate">{meta.sub}</p>
      </div>

      <div className="flex items-center gap-4">
        <CitySelector />
        <div className="h-7 w-px bg-border-subtle" aria-hidden />
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-sm bg-surface-inset text-fg-primary flex items-center justify-center text-meta font-semibold"
            aria-hidden
          >
            DR
          </div>
          <div className="text-meta hidden md:block">
            <p className="font-medium text-fg-primary leading-tight">Director</p>
            <p className="text-fg-tertiary leading-tight mt-0.5">DCT Abu Dhabi</p>
          </div>
        </div>
      </div>
    </header>
  )
}
