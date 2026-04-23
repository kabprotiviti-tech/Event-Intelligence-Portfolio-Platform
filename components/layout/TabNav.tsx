'use client'
import { useFilters } from '@/context/FilterContext'
import type { Category } from '@/types'
import { AllIcon, FamilyIcon, EntertainmentIcon, SportsIcon } from '@/components/system/Icon'

const TABS: Array<{ id: Category | 'All'; Icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'All',           Icon: AllIcon },
  { id: 'Family',        Icon: FamilyIcon },
  { id: 'Entertainment', Icon: EntertainmentIcon },
  { id: 'Sports',        Icon: SportsIcon },
]

export function TabNav() {
  const { category, setCategory } = useFilters()

  return (
    <div role="tablist" aria-label="Category filter" className="flex items-end border-b border-subtle">
      {TABS.map(({ id, Icon }) => {
        const selected = category === id
        return (
          <button
            key={id}
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => setCategory(id)}
            className={[
              'flex items-center gap-2 px-5 h-10 text-body-sm font-medium transition-colors duration-ui ease-out relative -mb-px',
              selected
                ? 'text-fg-primary border-b-2 border-accent'
                : 'text-fg-tertiary hover:text-fg-primary border-b-2 border-transparent',
            ].join(' ')}
          >
            <Icon className={selected ? 'text-accent' : 'text-fg-tertiary'} />
            {id}
          </button>
        )
      })}
    </div>
  )
}
