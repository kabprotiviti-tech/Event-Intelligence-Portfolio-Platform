'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  DashboardIcon, GapIcon, ConceptIcon, PortfolioIcon, StrategyIcon, FrameworkIcon,
} from '@/components/system/Icon'

const NAV = [
  { label: 'Dashboard',  href: '/dashboard', Icon: DashboardIcon },
  { label: 'Gap Finder', href: '/gaps',      Icon: GapIcon },
  { label: 'Concepts',   href: '/concepts',  Icon: ConceptIcon },
  { label: 'Portfolio',  href: '/portfolio', Icon: PortfolioIcon },
  { label: 'Strategy',   href: '/strategy',  Icon: StrategyIcon },
  { label: 'Framework',  href: '/framework', Icon: FrameworkIcon },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      aria-label="Primary navigation"
      className="w-60 shrink-0 border-r border-subtle bg-surface-card flex flex-col"
    >
      <Link
        href="/"
        className="px-6 py-5 border-b border-subtle block hover:bg-surface-inset transition-colors duration-ui ease-out"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-accent text-accent-ink flex items-center justify-center font-mono text-meta font-semibold">
            EI
          </div>
          <div className="min-w-0">
            <p className="text-eyebrow uppercase text-fg-tertiary">DCT Abu Dhabi</p>
            <p className="text-body-sm font-semibold text-fg-primary mt-0.5 truncate">
              Event Intelligence
            </p>
          </div>
        </div>
      </Link>

      <nav aria-label="Sections" className="flex-1 py-4 px-3">
        <p className="text-eyebrow uppercase text-fg-tertiary px-3 mb-2">Workspace</p>
        <ul className="space-y-1">
          {NAV.map(({ label, href, Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'flex items-center gap-3 px-3 h-9 rounded-sm text-body-sm transition-colors duration-ui ease-out',
                    active
                      ? 'bg-surface-inset text-fg-primary font-medium shadow-[inset_2px_0_0_0_rgb(var(--accent))]'
                      : 'text-fg-secondary hover:bg-surface-inset hover:text-fg-primary',
                  ].join(' ')}
                >
                  <Icon className={active ? 'text-accent' : 'text-fg-tertiary'} />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="px-6 py-4 border-t border-subtle">
        <div className="flex items-center gap-2 text-meta text-fg-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-positive inline-block" aria-hidden />
          <span>System Online</span>
        </div>
        <p className="text-eyebrow text-fg-tertiary mt-1">EIPP v0.3 · MVP</p>
      </div>
    </aside>
  )
}
