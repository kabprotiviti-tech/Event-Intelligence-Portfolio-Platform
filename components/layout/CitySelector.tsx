'use client'
import { useFilters } from '@/context/FilterContext'
import type { CityGroup } from '@/types'

const OPTIONS: CityGroup[] = ['Abu Dhabi', 'Dubai', 'GCC']

export function CitySelector() {
  const { cityGroup, setCityGroup } = useFilters()

  return (
    <div
      role="radiogroup"
      aria-label="City scope"
      className="inline-flex items-center gap-0.5 bg-surface-inset rounded-sm p-0.5 border border-subtle"
    >
      {OPTIONS.map(opt => {
        const selected = cityGroup === opt
        return (
          <button
            key={opt}
            role="radio"
            aria-checked={selected}
            onClick={() => setCityGroup(opt)}
            className={[
              'px-3 h-7 text-meta font-medium rounded-sm transition-colors duration-ui ease-out',
              selected
                ? 'bg-surface-card text-fg-primary shadow-flat'
                : 'text-fg-secondary hover:text-fg-primary',
            ].join(' ')}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}
