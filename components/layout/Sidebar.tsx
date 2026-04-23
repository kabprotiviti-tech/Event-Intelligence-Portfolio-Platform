'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const NAV = [
  { label: 'Dashboard',  href: '/',          icon: '▦' },
  { label: 'Gap Finder', href: '/gaps',       icon: '◎' },
  { label: 'Concepts',   href: '/concepts',   icon: '✦' },
  { label: 'Portfolio',  href: '/portfolio',  icon: '▤' },
]

export function Sidebar() {
  const path = usePathname()
  return (
    <aside className="w-56 bg-[#0f2340] flex flex-col text-white shrink-0">
      <div className="px-5 py-5 border-b border-white/10">
        <p className="text-[11px] text-white/50 uppercase tracking-widest">DCT Abu Dhabi</p>
        <p className="text-sm font-semibold mt-0.5 text-white">Event Intelligence</p>
      </div>
      <nav className="flex-1 py-4 space-y-0.5 px-2">
        {NAV.map(n => (
          <Link
            key={n.href}
            href={n.href}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
              path === n.href
                ? 'bg-white/10 text-white font-medium'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            )}
          >
            <span className="text-base">{n.icon}</span>
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-[11px] text-white/30">EIPP v0.1 — MVP</p>
      </div>
    </aside>
  )
}
