'use client'
import { useMemo, useState } from 'react'
import { useFilters } from '@/context/FilterContext'
import { allEvents } from '@/data'
import { detectGaps } from '@/lib/gap-detector'
import { generateRecommendations } from '@/lib/recommender'
import { TabNav } from '@/components/layout/TabNav'
import { CategoryBadge, ConfidenceBadge } from '@/components/ui/Badge'
import type { City, CityGroup, EventConcept } from '@/types'

const MONTH_NAMES = ['','January','February','March','April','May','June','July','August','September','October','November','December']

const GROUP_CITIES: Record<CityGroup, City[]> = {
  'Abu Dhabi': ['Abu Dhabi'],
  'Dubai': ['Dubai'],
  'GCC': ['Riyadh', 'Doha'],
}

export default function ConceptsPage() {
  const { cityGroup, category } = useFilters()
  const [approved, setApproved] = useState<Set<string>>(new Set())

  const concepts = useMemo(() => {
    const focus = GROUP_CITIES[cityGroup][0]
    const scoped = category === 'All' ? allEvents : allEvents.filter(e => e.category === category)
    const report = detectGaps(scoped, focus, 2025)
    return generateRecommendations(report, allEvents, 12)
  }, [cityGroup, category])

  function toggleApprove(id: string) {
    setApproved(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto">
      <TabNav />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">
            {concepts.length} concept{concepts.length === 1 ? '' : 's'} generated ·
            {' '}<span className="text-emerald-600 font-medium">{approved.size} approved</span>
          </p>
        </div>
        <button className="text-xs font-medium text-slate-500 hover:text-slate-700 transition">
          Export to Portfolio →
        </button>
      </div>

      {concepts.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-sm text-slate-400">
          No gaps detected for this filter combination.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {concepts.map(c => (
          <ConceptFull key={c.id} concept={c} approved={approved.has(c.id)} onApprove={() => toggleApprove(c.id)} />
        ))}
      </div>
    </div>
  )
}

function ConceptFull({ concept, approved, onApprove }: { concept: EventConcept; approved: boolean; onApprove: () => void }) {
  return (
    <div className={`relative bg-white border rounded-xl p-6 space-y-4 transition-all ${approved ? 'border-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.08)]' : 'border-slate-200 hover:border-slate-300'}`}>
      {approved && (
        <div className="absolute top-4 right-4 text-[10px] font-semibold uppercase text-emerald-600 tracking-widest">
          ✓ Approved
        </div>
      )}

      <div>
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <h3 className="font-semibold text-slate-900 text-base leading-snug pr-8">{concept.title}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={concept.category} />
          <span className="text-xs text-slate-400">{concept.event_format}</span>
          <span className="text-slate-300">·</span>
          <ConfidenceBadge level={concept.confidence} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-100">
        <Stat label="Timing" value={MONTH_NAMES[concept.suggested_month]} />
        <Stat label="City" value={concept.suggested_city} />
        <Stat label="Est. Audience" value={concept.estimated_audience.toLocaleString()} />
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">{concept.reason}</p>

      {concept.reference_events.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Reference events</p>
          <div className="flex flex-wrap gap-1.5">
            {concept.reference_events.map(id => (
              <span key={id} className="inline-flex px-2 py-0.5 rounded bg-slate-100 text-[11px] font-mono text-slate-600">
                {id}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-slate-500">
          Gap Score <span className="font-semibold text-slate-800">{Math.round(concept.gap_score * 100)}%</span>
          <span className="mx-2 text-slate-300">·</span>
          Budget <span className="font-semibold text-slate-800">AED {(concept.estimated_budget / 1_000_000).toFixed(1)}M</span>
        </div>
        <button
          onClick={onApprove}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
            approved
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'bg-[#0a1a33] text-white hover:bg-[#152f57]'
          }`}
        >
          {approved ? 'Approved · Undo' : 'Approve Concept'}
        </button>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">{label}</p>
      <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
    </div>
  )
}
