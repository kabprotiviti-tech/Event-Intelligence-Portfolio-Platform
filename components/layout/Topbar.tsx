'use client'
import { usePathname } from 'next/navigation'
import { CitySelector } from './CitySelector'

const TITLES: Record<string, { title: string, sub: string }> = {
  '/dashboard': { title: 'Event Intelligence Platform', sub: 'Director overview · 2025 calendar' },
  '/gaps':      { title: 'Gap Finder',                   sub: 'Cross-city calendar analysis' },
  '/concepts':  { title: 'Concept Generator',            sub: 'AI-surfaced event opportunities' },
  '/portfolio': { title: 'Portfolio Optimizer',          sub: 'Scoring, budgeting & prioritization' },
}

export function Topbar() {
  const path = usePathname()
  const meta = TITLES[path] ?? TITLES['/dashboard']

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center px-8 justify-between shrink-0">
      <div>
        <h1 className="text-[15px] font-semibold text-slate-900 leading-tight">{meta.title}</h1>
        <p className="text-xs text-slate-500 mt-0.5">{meta.sub}</p>
      </div>
      <div className="flex items-center gap-4">
        <CitySelector />
        <div className="h-7 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-[11px] font-semibold">
            DR
          </div>
          <div className="text-xs">
            <p className="font-medium text-slate-700 leading-tight">Director</p>
            <p className="text-slate-400 leading-tight mt-0.5">DCT Abu Dhabi</p>
          </div>
        </div>
      </div>
    </header>
  )
}
