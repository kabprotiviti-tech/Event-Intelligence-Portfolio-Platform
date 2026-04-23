'use client'
import type { StrategicOutlook, YearlyOutlook, CompetitivePosition } from '@/types'
import { useDrill } from '@/context/DrillContext'

const POSITION_TONE: Record<CompetitivePosition, string> = {
  leading:  'text-positive',
  matching: 'text-fg-primary',
  lagging:  'text-negative',
}

const POSITION_LABEL: Record<CompetitivePosition, string> = {
  leading:  'Leading',
  matching: 'Matching',
  lagging:  'Lagging',
}

const MONTH_SHORT = ['', 'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function StrategicOutlookPanel({ outlook }: { outlook: StrategicOutlook }) {
  const { open } = useDrill()

  return (
    <section
      aria-label="Strategic outlook"
      className="rounded-md border border-subtle bg-surface-card p-6 space-y-6"
    >
      <header className="flex items-baseline justify-between">
        <div>
          <h3 className="text-h3 font-semibold text-fg-primary">Strategic Outlook</h3>
          <p className="text-meta text-fg-tertiary mt-0.5">{outlook.horizon_years}-year horizon</p>
        </div>
        <span className="text-eyebrow uppercase text-fg-tertiary">Long-term</span>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        {outlook.yearly.map(y => <YearCard key={y.year} year={y} />)}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 pt-4 border-t border-subtle">
        <div>
          <p className="text-eyebrow uppercase text-fg-tertiary mb-3">Underdeveloped categories</p>
          {outlook.underdeveloped_categories.length === 0 ? (
            <p className="text-meta text-fg-tertiary">All categories at healthy share.</p>
          ) : (
            <ul className="space-y-2">
              {outlook.underdeveloped_categories.map(u => (
                <li key={u.category} className="rounded-sm border border-subtle px-3 py-2">
                  <div className="flex items-baseline justify-between">
                    <p className="text-body-sm font-medium text-fg-primary">{u.category}</p>
                    <span
                      className={`text-eyebrow uppercase font-semibold ${u.severity === 'High' ? 'text-negative' : 'text-caution'}`}
                    >
                      {u.severity} severity
                    </span>
                  </div>
                  <p className="text-meta text-fg-secondary mt-1">{u.reason}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="text-eyebrow uppercase text-fg-tertiary mb-3">
            Where we're losing (top 5 · click to drill)
          </p>
          {outlook.competitive_gaps.length === 0 ? (
            <p className="text-meta text-fg-tertiary">No significant competitive deficits.</p>
          ) : (
            <ul className="space-y-1.5">
              {outlook.competitive_gaps.map(g => (
                <li key={`${g.month}-${g.category}`}>
                  <button
                    type="button"
                    onClick={() => open({
                      kind: 'competitive-gap',
                      eyebrow: 'Competitive deficit',
                      title: `${MONTH_SHORT[g.month]} · ${g.category} · vs ${g.city}`,
                      gap: g,
                    })}
                    className="w-full flex items-baseline justify-between rounded-sm border border-subtle hover:border-strong px-3 py-2 text-meta transition-colors duration-ui ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span className="text-fg-secondary">
                      <span className="font-medium text-fg-primary">{g.city}</span>
                      <span className="text-fg-tertiary mx-2">·</span>
                      {g.category}
                      <span className="text-fg-tertiary mx-2">·</span>
                      {MONTH_SHORT[g.month]}
                    </span>
                    <span className="text-negative font-mono tnum" data-tabular>
                      +{g.their_lead}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-subtle">
        <p className="text-eyebrow uppercase text-fg-tertiary mb-3">Long-term recommendations</p>
        <ol className="space-y-2">
          {outlook.long_term_recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-3 text-body-sm text-fg-secondary leading-relaxed">
              <span
                className="font-mono text-meta text-fg-tertiary tnum mt-1 w-4 shrink-0"
                data-tabular
              >{i + 1}</span>
              <span>{rec}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function YearCard({ year }: { year: YearlyOutlook }) {
  return (
    <div className="rounded-sm border border-subtle px-4 py-3">
      <div className="flex items-baseline justify-between">
        <p className="text-h3 font-semibold text-fg-primary tnum" data-tabular>{year.year}</p>
        <span className={`text-eyebrow uppercase font-semibold ${POSITION_TONE[year.competitive_position]}`}>
          {POSITION_LABEL[year.competitive_position]}
        </span>
      </div>
      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-body-sm font-medium text-fg-primary tnum" data-tabular>
          {year.projected_events}
        </span>
        <span className="text-meta text-fg-tertiary">events</span>
      </div>
      <p className="text-meta text-fg-tertiary mt-1 tnum" data-tabular>
        F {year.category_mix.Family} · E {year.category_mix.Entertainment} · S {year.category_mix.Sports}
      </p>
      <p className="text-meta text-fg-tertiary mt-0.5 tnum" data-tabular>
        {year.gap_count} gap slots
      </p>
    </div>
  )
}
