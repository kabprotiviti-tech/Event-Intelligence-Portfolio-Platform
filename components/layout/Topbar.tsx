'use client'
import { usePathname } from 'next/navigation'

const TITLES: Record<string, string> = {
  '/':          'Dashboard Overview',
  '/gaps':      'Gap Finder',
  '/concepts':  'Event Concept Generator',
  '/portfolio': 'Portfolio Optimizer',
}

export function Topbar() {
  const path = usePathname()
  const title = TITLES[path] ?? 'EIPP'
  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center px-6 justify-between shrink-0">
      <h1 className="text-sm font-semibold text-slate-800">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400">2025 Fiscal Year</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          Live Mock Data
        </span>
      </div>
    </header>
  )
}
