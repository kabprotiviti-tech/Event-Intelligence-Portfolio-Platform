'use client'
import type { GapReport } from '@/types'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const CATEGORIES = ['Family','Entertainment','Sports'] as const

export function GapMatrix({ reports }: { reports: GapReport[] }) {
  if (!reports.length) return <div className="h-40 animate-pulse bg-slate-100 rounded-lg" />

  return (
    <div className="space-y-6">
      {reports.map(report => (
        <div key={report.city}>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-sm font-semibold text-slate-700">{report.city}</p>
            <span className="text-xs text-slate-400">{report.summary.total_gaps} gap slots</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-separate border-spacing-1">
              <thead>
                <tr>
                  <th className="text-left text-slate-400 font-normal w-24" />
                  {MONTHS.map(m => <th key={m} className="text-center text-slate-400 font-normal w-10">{m}</th>)}
                </tr>
              </thead>
              <tbody>
                {CATEGORIES.map(cat => (
                  <tr key={cat}>
                    <td className="text-slate-500 pr-2 font-medium">{cat}</td>
                    {MONTHS.map((_, i) => {
                      const slot = report.slots.find(s => s.month === i + 1 && s.category === cat)
                      const count = slot?.event_count ?? 0
                      const gap = slot?.gap_score ?? 1
                      const bg = gap >= 0.9 ? 'bg-red-100' : gap >= 0.6 ? 'bg-amber-100' : gap >= 0.3 ? 'bg-blue-100' : 'bg-[#0f2340]'
                      const text = gap >= 0.9 ? 'text-red-600' : gap >= 0.6 ? 'text-amber-700' : gap >= 0.3 ? 'text-blue-700' : 'text-white'
                      return (
                        <td key={i} className="text-center">
                          <div className={`rounded w-9 h-8 flex items-center justify-center font-semibold mx-auto ${bg} ${text}`}>
                            {count || '–'}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      <div className="flex gap-5 text-xs text-slate-400 pt-2">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100" /> Empty (gap)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-100" /> Light</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-100" /> Moderate</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#0f2340]" /> Heavy</span>
      </div>
    </div>
  )
}
