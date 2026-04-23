'use client'
import { useFilters } from '@/context/FilterContext'
import type { CityGroup } from '@/types'
import clsx from 'clsx'

const OPTIONS: CityGroup[] = ['Abu Dhabi', 'Dubai', 'GCC']

export function CitySelector() {
  const { cityGroup, setCityGroup } = useFilters()
  return (
    <div className="inline-flex items-center gap-1 bg-slate-100 rounded-lg p-1">
      {OPTIONS.map(opt => (
        <button
          key={opt}
          onClick={() => setCityGroup(opt)}
          className={clsx(
            'px-3.5 py-1.5 text-xs font-medium rounded-md transition-all',
            cityGroup === opt
              ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
