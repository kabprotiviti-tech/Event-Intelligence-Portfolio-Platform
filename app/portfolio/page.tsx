'use client'
import { useState } from 'react'
import { PortfolioTable } from '@/components/portfolio/PortfolioTable'
import { StatCard } from '@/components/ui/StatCard'
import { buildPortfolio, simulateBudget } from '@/lib/scorer'
import { allEvents } from '@/data'
import type { PortfolioEvent, Category } from '@/types'

const BUDGET_OPTIONS = [
  { label: 'No Budget', value: 0 },
  { label: 'AED 50M',   value: 50_000_000 },
  { label: 'AED 100M',  value: 100_000_000 },
  { label: 'AED 200M',  value: 200_000_000 },
  { label: 'AED 500M',  value: 500_000_000 },
]

const CATEGORIES: Array<Category | 'All'> = ['All', 'Family', 'Entertainment', 'Sports']

export default function PortfolioPage() {
  const [budget, setBudget] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All')

  const base = buildPortfolio(allEvents)
  const withBudget: PortfolioEvent[] = budget > 0 ? simulateBudget(base, budget) : base
  const filtered = categoryFilter === 'All'
    ? withBudget
    : withBudget.filter(e => e.category === categoryFilter)

  const avgScore = filtered.length
    ? Math.round((filtered.reduce((s, e) => s + e.portfolio_score, 0) / filtered.length) * 10) / 10
    : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Events" value={filtered.length} sub="In portfolio" accent />
        <StatCard label="Avg Score" value={`${avgScore}/10`} sub="Weighted formula" />
        <StatCard label="Family" value={withBudget.filter(e => e.category === 'Family').length} />
        <StatCard label="Sports" value={withBudget.filter(e => e.category === 'Sports').length} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-slate-800">Event Portfolio</h2>
          <div className="flex items-center gap-3">
            {/* Category filter */}
            <div className="flex gap-1">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                    categoryFilter === c
                      ? 'bg-[#0f2340] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            {/* Budget simulator */}
            <select
              value={budget}
              onChange={e => setBudget(parseInt(e.target.value))}
              className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f2340]/20"
            >
              {BUDGET_OPTIONS.map(b => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>
        </div>

        {budget > 0 && (
          <div className="mb-4 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700">
            Budget simulation active — AED {(budget/1_000_000).toFixed(0)}M allocated proportionally by portfolio score.
          </div>
        )}

        <PortfolioTable events={filtered} />
      </div>
    </div>
  )
}
