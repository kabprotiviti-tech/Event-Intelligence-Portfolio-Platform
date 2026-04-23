'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const NAV = [
  { label: 'Dashboard',  href: '/dashboard', icon: DashboardIcon },
  { label: 'Gap Finder', href: '/gaps',      icon: GapIcon },
  { label: 'Concepts',   href: '/concepts',  icon: ConceptIcon },
  { label: 'Portfolio',  href: '/portfolio', icon: PortfolioIcon },
]

export function Sidebar() {
  const path = usePathname()
  return (
    <aside className="w-60 bg-[#0a1a33] flex flex-col text-white shrink-0">
      <Link href="/" className="px-6 py-5 border-b border-white/5 block hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c9a84c] to-[#b8962f] flex items-center justify-center text-[#0a1a33] font-bold text-xs">
            EI
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.15em] font-medium">DCT Abu Dhabi</p>
            <p className="text-[13px] font-semibold text-white leading-tight mt-0.5">Event Intelligence</p>
          </div>
        </div>
      </Link>
      <nav className="flex-1 py-5 space-y-1 px-3">
        <p className="text-[10px] text-white/30 uppercase tracking-widest font-medium px-3 mb-2">Workspace</p>
        {NAV.map(n => {
          const Icon = n.icon
          const active = path.startsWith(n.href)
          return (
            <Link
              key={n.href}
              href={n.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all',
                active
                  ? 'bg-white/10 text-white font-medium shadow-[inset_3px_0_0_0_#c9a84c]'
                  : 'text-white/55 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon className={clsx('w-4 h-4', active ? 'text-[#c9a84c]' : '')} />
              {n.label}
            </Link>
          )
        })}
      </nav>
      <div className="px-6 py-4 border-t border-white/5 space-y-2">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
          <span className="text-white/60">System Online</span>
        </div>
        <p className="text-[10px] text-white/25">EIPP v0.2 · MVP</p>
      </div>
    </aside>
  )
}

// ── Icons ────────────────────────────────────────────────────
function DashboardIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}><path d="M4 4h6v8H4zM14 4h6v5h-6zM14 13h6v7h-6zM4 15h6v5H4z" stroke="currentColor" strokeWidth="1.5"/></svg>
  )
}
function GapIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/></svg>
  )
}
function ConceptIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}><path d="M12 3l2 5 5 1-4 4 1 5-4-3-4 3 1-5-4-4 5-1 2-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
  )
}
function PortfolioIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 10h18M8 14h4" stroke="currentColor" strokeWidth="1.5"/></svg>
  )
}
