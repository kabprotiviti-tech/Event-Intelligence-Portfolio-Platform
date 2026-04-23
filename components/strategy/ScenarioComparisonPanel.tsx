import type { ScenarioComparison, ScenarioResult, Category } from '@/types'
import { EmptyState } from '@/components/system/states'

const CATS: Category[] = ['Family', 'Entertainment', 'Sports']

export function ScenarioComparisonPanel({ data }: { data: ScenarioComparison }) {
  if (data.scenarios.length === 0) {
    return <EmptyState title="No scenarios computed yet." hint="System will auto-run 3 presets on load." />
  }

  return (
    <div className="space-y-4">
      {/* Recommendation — single line, executive-friendly */}
      <div className="rounded-md border border-accent/30 bg-surface-card px-5 py-4">
        <p className="text-eyebrow uppercase text-fg-tertiary mb-1">Leadership recommendation</p>
        <p className="text-body-sm text-fg-primary leading-snug">{data.recommendation}</p>
      </div>

      {/* Scenario cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {data.scenarios.map(s => (
          <ScenarioCard
            key={s.config.id}
            scenario={s}
            isLeader={{
              roi:         data.leader_by_metric.roi === s.config.id,
              attendance:  data.leader_by_metric.attendance === s.config.id,
              balance:     data.leader_by_metric.balance === s.config.id,
              seasonality: data.leader_by_metric.seasonality === s.config.id,
            }}
          />
        ))}
      </div>
    </div>
  )
}

function ScenarioCard({
  scenario, isLeader,
}: {
  scenario: ScenarioResult
  isLeader: { roi: boolean; attendance: boolean; balance: boolean; seasonality: boolean }
}) {
  const p = scenario.projections
  const dist = p.category_distribution
  const total = dist.Family + dist.Entertainment + dist.Sports || 1

  return (
    <article className="rounded-md border border-subtle bg-surface-card p-5 space-y-4">
      <header>
        <p className="text-eyebrow uppercase text-fg-tertiary">{scenario.config.risk_level}</p>
        <h4 className="text-h3 font-semibold text-fg-primary mt-1">{scenario.config.name}</h4>
        <p className="text-meta text-fg-tertiary mt-1 tnum" data-tabular>
          AED {(scenario.config.total_budget / 1_000_000).toFixed(0)}M budget
        </p>
      </header>

      <dl className="space-y-2 text-meta">
        <Row label="Events"         value={p.events_count.toString()} leader={false} />
        <Row label="Total ROI"      value={p.total_roi_score.toFixed(0)} leader={isLeader.roi} />
        <Row label="Attendance"     value={p.total_attendance.toLocaleString()} leader={isLeader.attendance} />
        <Row label="Avg score"      value={`${p.avg_portfolio_score.toFixed(1)} / 10`} leader={false} />
        <Row label="Gaps filled"    value={p.gaps_filled.toString()} leader={false} />
        <Row label="Budget used"    value={`${p.budget_utilization_pct}%`} leader={false} />
      </dl>

      {/* Category mix bar */}
      <div>
        <p className="text-eyebrow uppercase text-fg-tertiary mb-2">Category mix</p>
        <div className="flex h-1.5 rounded-sm overflow-hidden bg-surface-inset">
          {CATS.map(cat => (
            <div
              key={cat}
              className={
                cat === 'Family'        ? 'bg-info'
              : cat === 'Entertainment' ? 'bg-accent'
              :                           'bg-positive'
              }
              style={{ width: `${(dist[cat] / total) * 100}%` }}
              aria-label={`${cat}: ${dist[cat]} events`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 mt-2 text-meta text-fg-tertiary tnum" data-tabular>
          <span>F {dist.Family}</span>
          <span>E {dist.Entertainment}</span>
          <span>S {dist.Sports}</span>
          {isLeader.balance && (
            <span className="text-positive text-eyebrow uppercase ml-auto">Best balance</span>
          )}
          {isLeader.seasonality && (
            <span className="text-positive text-eyebrow uppercase ml-auto">Best spread</span>
          )}
        </div>
      </div>
    </article>
  )
}

function Row({ label, value, leader }: { label: string; value: string; leader: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-fg-tertiary">{label}</dt>
      <dd className={`font-semibold tnum ${leader ? 'text-positive' : 'text-fg-primary'}`} data-tabular>
        {value}{leader && <span className="ml-1.5 text-eyebrow uppercase">lead</span>}
      </dd>
    </div>
  )
}
