import { CalendarHeatmap } from '@/components/dashboard/CalendarHeatmap'
import { GapInsightsPanel } from '@/components/dashboard/GapInsightsPanel'
import { StatCard } from '@/components/ui/StatCard'
import { detectGaps } from '@/lib/gap-detector'
import { buildPortfolio } from '@/lib/scorer'
import { generateRecommendations } from '@/lib/recommender'
import { getEvents } from '@/lib/data-provider'
import { ConceptCard } from '@/components/concepts/ConceptCard'

export default async function DashboardPage() {
  const events = await getEvents({ year: 2025 })
  const adEvents = events.filter(e => e.city === 'Abu Dhabi')
  const adReport = detectGaps(events, 'Abu Dhabi', 2025)
  const dubaiReport = detectGaps(events, 'Dubai', 2025)
  const portfolio = buildPortfolio(adEvents)
  const concepts = generateRecommendations(adReport, dubaiReport, 3)
  const avgScore = portfolio.length
    ? Math.round((portfolio.reduce((s, e) => s + e.portfolio_score, 0) / portfolio.length) * 10) / 10
    : 0

  return (
    <div className="space-y-6">
      {/* Stat row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="AD Events (2025)" value={adEvents.length} sub="Active calendar" accent />
        <StatCard label="Calendar Gaps" value={adReport.summary.total_gaps} sub="Empty or light slots" />
        <StatCard label="Avg Portfolio Score" value={`${avgScore}/10`} sub="Weighted formula" />
        <StatCard label="Concepts Ready" value={concepts.length} sub="AI-generated ideas" />
      </div>

      {/* Heatmap */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-800">Abu Dhabi Event Calendar — 2025</h2>
          <span className="text-xs text-slate-400">Density by category & month</span>
        </div>
        <CalendarHeatmap report={adReport} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Gap Insights */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Top Gap Opportunities</h2>
          <GapInsightsPanel report={adReport} />
        </div>

        {/* Recommended Concepts */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Recommended Concepts</h2>
          <div className="space-y-3">
            {concepts.map(c => <ConceptCard key={c.id} concept={c} />)}
          </div>
        </div>
      </div>
    </div>
  )
}
