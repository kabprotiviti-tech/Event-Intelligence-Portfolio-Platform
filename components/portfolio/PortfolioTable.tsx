'use client'
import type { PortfolioEvent } from '@/types'
import { CategoryBadge } from '@/components/ui/Badge'

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 10) * 100
  const color = score >= 8 ? 'bg-emerald-500' : score >= 6 ? 'bg-blue-500' : score >= 4 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-slate-100">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-600 font-medium w-6">{score}</span>
    </div>
  )
}

export function PortfolioTable({ events }: { events: PortfolioEvent[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {['Event','Category','City','Date','Attendance','Score','Budget'].map(h => (
              <th key={h} className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide pb-2 pr-4">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {events.map(e => (
            <tr key={e.id} className="hover:bg-slate-50 transition-colors">
              <td className="py-2.5 pr-4 font-medium text-slate-800 max-w-[200px] truncate">{e.name}</td>
              <td className="py-2.5 pr-4"><CategoryBadge category={e.category} /></td>
              <td className="py-2.5 pr-4 text-slate-600">{e.city}</td>
              <td className="py-2.5 pr-4 text-slate-500 text-xs">{new Date(e.start_date).toLocaleDateString('en-GB',{day:'2-digit',month:'short'})}</td>
              <td className="py-2.5 pr-4 text-slate-600">{e.estimated_attendance.toLocaleString()}</td>
              <td className="py-2.5 pr-4"><ScoreBar score={e.portfolio_score} /></td>
              <td className="py-2.5 text-slate-600 text-xs">
                {e.budget_allocated ? `AED ${(e.budget_allocated/1000000).toFixed(1)}M` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
