import type { EventConcept } from '@/types'
import { CategoryBadge, ConfidenceBadge } from '@/components/ui/Badge'

const MONTH_NAMES = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function ConceptCard({ concept }: { concept: EventConcept }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-slate-800 text-sm leading-snug">{concept.title}</p>
        <ConfidenceBadge level={concept.confidence} />
      </div>

      <div className="flex flex-wrap gap-2">
        <CategoryBadge category={concept.category} />
        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
          {MONTH_NAMES[concept.suggested_month]} 2025
        </span>
        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
          {concept.suggested_city}
        </span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">{concept.reason}</p>

      {concept.reference_events.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium mr-1">Refs:</span>
          {concept.reference_events.slice(0, 3).map(id => (
            <span key={id} className="inline-flex px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-500">
              {id}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-400">
        <span>Est. Audience: <span className="font-semibold text-slate-700">{concept.estimated_audience.toLocaleString()}</span></span>
        <span>Gap Score: <span className="font-semibold text-slate-700">{Math.round(concept.gap_score * 100)}%</span></span>
      </div>
    </div>
  )
}
