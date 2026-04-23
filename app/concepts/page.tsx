import { ConceptCard } from '@/components/concepts/ConceptCard'
import { StatCard } from '@/components/ui/StatCard'
import { detectGaps } from '@/lib/gap-detector'
import { generateRecommendations } from '@/lib/recommender'
import { getEvents } from '@/lib/data-provider'

export default async function ConceptsPage() {
  const events = await getEvents({ year: 2025 })
  const adReport = detectGaps(events, 'Abu Dhabi', 2025)
  const dubaiReport = detectGaps(events, 'Dubai', 2025)
  const concepts = generateRecommendations(adReport, dubaiReport, 12)

  const byCategory = {
    Family: concepts.filter(c => c.category === 'Family').length,
    Entertainment: concepts.filter(c => c.category === 'Entertainment').length,
    Sports: concepts.filter(c => c.category === 'Sports').length,
  }
  const highConf = concepts.filter(c => c.confidence === 'High').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Concepts Generated" value={concepts.length} sub="Based on gap analysis" accent />
        <StatCard label="High Confidence" value={highConf} sub="Strongly recommended" />
        <StatCard label="Family" value={byCategory.Family} />
        <StatCard label="Sports" value={byCategory.Sports} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-800">Recommended Event Concepts</h2>
          <p className="text-xs text-slate-400">Ranked by gap score — highest priority first</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {concepts.map(c => <ConceptCard key={c.id} concept={c} />)}
        </div>
      </div>
    </div>
  )
}
