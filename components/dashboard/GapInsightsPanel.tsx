import type { GapReport } from '@/types'

const MONTH_NAMES = ['','January','February','March','April','May','June','July','August','September','October','November','December']

export function GapInsightsPanel({ report }: { report: GapReport | null }) {
  if (!report) return <div className="h-24 animate-pulse bg-slate-100 rounded-lg" />

  const { summary } = report
  const topGaps = report.slots
    .filter(s => s.density === 'empty' || s.density === 'light')
    .sort((a, b) => b.gap_score - a.gap_score)
    .slice(0, 4)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
          <p className="text-xs text-amber-600 font-medium">Emptiest Month</p>
          <p className="font-semibold text-amber-900 mt-0.5">{MONTH_NAMES[summary.emptiest_month]}</p>
        </div>
        <div className="rounded-lg bg-red-50 border border-red-100 p-3">
          <p className="text-xs text-red-600 font-medium">Weakest Category</p>
          <p className="font-semibold text-red-900 mt-0.5">{summary.emptiest_category}</p>
        </div>
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
          <p className="text-xs text-slate-500 font-medium">Total Gaps</p>
          <p className="font-semibold text-slate-800 mt-0.5">{summary.total_gaps} slots</p>
        </div>
      </div>

      <div className="space-y-2">
        {topGaps.map((s, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm">
            <span className="text-slate-700">
              <span className="font-medium">{MONTH_NAMES[s.month]}</span>
              <span className="text-slate-400 mx-1.5">·</span>
              {s.category}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full bg-red-400"
                  style={{ width: `${s.gap_score * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-400 w-8 text-right">{Math.round(s.gap_score * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
