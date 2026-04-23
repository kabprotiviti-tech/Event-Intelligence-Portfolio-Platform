import type { Event } from '@/types'
import { CategoryBadge } from './Badge'

export function EventCard({ event }: { event: Event }) {
  const d = new Date(event.start_date)
  const month = d.toLocaleDateString('en-GB', { month: 'short' })
  const day = d.toLocaleDateString('en-GB', { day: '2-digit' })

  return (
    <div className="group flex items-center gap-4 rounded-xl bg-white border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all">
      <div className="shrink-0 w-14 h-14 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex flex-col items-center justify-center">
        <span className="text-[10px] text-slate-500 font-medium uppercase">{month}</span>
        <span className="text-lg font-bold text-slate-900 leading-none">{day}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800 truncate">{event.name}</p>
        </div>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
          <CategoryBadge category={event.category} />
          <span>·</span>
          <span>{event.city}</span>
          <span>·</span>
          <span>{event.estimated_attendance.toLocaleString()} guests</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[10px] text-slate-400 uppercase tracking-wide">Impact</p>
        <div className="flex items-center gap-0.5 mt-1">
          {[1, 2, 3, 4, 5].map(i => (
            <span
              key={i}
              className={`w-1.5 h-4 rounded-sm ${i <= event.impact_weight ? 'bg-[#c9a84c]' : 'bg-slate-200'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
