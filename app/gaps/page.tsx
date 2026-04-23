import { GapMatrix } from '@/components/gaps/GapMatrix'
import { StatCard } from '@/components/ui/StatCard'
import { detectGaps, compareGaps } from '@/lib/gap-detector'
import { getEvents } from '@/lib/data-provider'

export default async function GapsPage() {
  const events = await getEvents({ year: 2025 })
  const adReport = detectGaps(events, 'Abu Dhabi', 2025)
  const dubaiReport = detectGaps(events, 'Dubai', 2025)
  const comparison = compareGaps(adReport, dubaiReport)
  const opportunities = comparison.filter(c => c.opportunity)

  const MONTH_NAMES = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="AD Total Gaps" value={adReport.summary.total_gaps} sub="Empty/light slots" accent />
        <StatCard label="Dubai Total Gaps" value={dubaiReport.summary.total_gaps} sub="For comparison" />
        <StatCard label="Cross-City Opportunities" value={opportunities.length} sub="AD gap, Dubai active" />
        <StatCard label="AD Emptiest Month" value={MONTH_NAMES[adReport.summary.emptiest_month]} sub="Lowest event density" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-800">Gap Matrix — Abu Dhabi vs Dubai</h2>
          <span className="text-xs text-slate-400">Red = gap opportunity · Dark = high density</span>
        </div>
        <GapMatrix reports={[adReport, dubaiReport]} />
      </div>

      {opportunities.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Cross-City Opportunities</h2>
          <div className="space-y-2">
            {opportunities.slice(0, 8).map((o, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 text-sm">
                <span className="font-medium text-amber-900">
                  {MONTH_NAMES[o.month]} · {o.category}
                </span>
                <span className="text-amber-700 text-xs">
                  AD: {o.ad_count} event{o.ad_count !== 1 ? 's' : ''} &nbsp;·&nbsp; Dubai: {o.dubai_count} event{o.dubai_count !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
