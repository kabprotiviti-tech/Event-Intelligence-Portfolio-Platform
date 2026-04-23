'use client'
import { useFilters } from '@/context/FilterContext'
import type { Category } from '@/types'
import clsx from 'clsx'

const TABS: Array<Category | 'All'> = ['All', 'Family', 'Entertainment', 'Sports']

const ICON: Record<string, string> = {
  All: '◉',
  Family: '◐',
  Entertainment: '♪',
  Sports: '◆',
}

export function TabNav() {
  const { category, setCategory } = useFilters()
  return (
    <div className="flex items-end gap-0 border-b border-slate-200 -mb-px">
      {TABS.map(t => (
        <button
          key={t}
          onClick={() => setCategory(t)}
          className={clsx(
            'px-5 py-3 text-[13px] font-medium transition-colors relative -mb-px',
            category === t
              ? 'text-slate-900 border-b-2 border-[#0a1a33]'
              : 'text-slate-500 hover:text-slate-700 border-b-2 border-transparent'
          )}
        >
          <span className="mr-1.5 opacity-50">{ICON[t]}</span>
          {t}
        </button>
      ))}
    </div>
  )
}
