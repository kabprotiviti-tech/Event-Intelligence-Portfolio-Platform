'use client'
import { createContext, useContext, useState, ReactNode } from 'react'
import type { Category, CityGroup } from '@/types'

interface FilterState {
  cityGroup: CityGroup
  category: Category | 'All'
  setCityGroup: (c: CityGroup) => void
  setCategory: (c: Category | 'All') => void
}

const FilterContext = createContext<FilterState | null>(null)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [cityGroup, setCityGroup] = useState<CityGroup>('Abu Dhabi')
  const [category, setCategory] = useState<Category | 'All'>('All')

  return (
    <FilterContext.Provider value={{ cityGroup, category, setCityGroup, setCategory }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters() {
  const ctx = useContext(FilterContext)
  if (!ctx) throw new Error('useFilters must be used inside FilterProvider')
  return ctx
}
