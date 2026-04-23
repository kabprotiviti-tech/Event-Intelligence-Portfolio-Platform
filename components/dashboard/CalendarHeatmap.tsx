'use client'
import type { GapReport } from '@/types'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const CATEGORIES = ['Family','Entertainment','Sports'] as const

const DENSITY_COLOR = {
  empty:    'bg-slate-100 text-slate-400',
  light:    'bg-blue-100 text-blue-600',
  moderate: 'bg-blue-300 text-blue-800',
  heavy:    'bg-[#0f2340] text-white',
}

export function CalendarHeatmap({ report }: { report: GapReport | null }) {
  if (!report) return <div className="h-40 animate-pulse bg-slate-100 rounded-lg" />

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="text-left text-slate-400 font-medium w-24 pb-1">Category</th>
            {MONTHS.map(m => (
              <th key={m} className="text-slate-400 font-medium text-center pb-1 w-10">{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.map(cat => (
            <tr key={cat}>
              <td className="text-slate-600 font-medium py-1 pr-2">{cat}</td>
              {MONTHS.map((_, i) => {
                const slot = report.slots.find(s => s.month === i + 1 && s.category === cat)
                const density = slot?.density ?? 'empty'
                const count = slot?.event_count ?? 0
                return (
                  <td key={i} className="text-center">
                    <div
                      className={`rounded w-9 h-8 flex items-center justify-center font-semibold mx-auto ${DENSITY_COLOR[density]}`}
                      title={`${cat} · ${MONTHS[i]}: ${count} event(s)`}
                    >
                      {count || '–'}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-4 mt-3 text-xs text-slate-400">
        {Object.entries(DENSITY_COLOR).map(([d, cls]) => (
          <span key={d} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded inline-block ${cls.split(' ')[0]}`} />
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </span>
        ))}
      </div>
    </div>
  )
}
