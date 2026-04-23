import Link from 'next/link'
import { getEvents } from '@/lib/data-provider'
import { detectGaps } from '@/lib/gap-detector'
import { ArrowRightIcon } from '@/components/system/Icon'

/**
 * Landing — editorial, typographic, data-first.
 * No gradients. No centered hero + 3-up cards. No marketing motion.
 * The hero visual IS a real, computed 2025 gap matrix for Abu Dhabi.
 */
export default async function LandingPage() {
  const events = await getEvents({ year: 2025 })
  const adReport = detectGaps(events, 'Abu Dhabi', 2025)
  const cities = new Set(events.map(e => e.city)).size

  return (
    <div className="min-h-screen bg-surface-canvas text-fg-primary">
      {/* Masthead */}
      <header className="border-b border-subtle">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-sm bg-accent text-accent-ink font-mono text-meta font-semibold">
              EI
            </span>
            <span className="flex items-baseline gap-2">
              <span className="text-body-sm font-semibold text-fg-primary">Event Intelligence Platform</span>
              <span className="text-eyebrow uppercase text-fg-tertiary hidden sm:inline">DCT Abu Dhabi</span>
            </span>
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-6 text-body-sm">
            <a href="#capabilities" className="text-fg-secondary hover:text-fg-primary transition-colors duration-ui ease-out hidden md:inline">Capabilities</a>
            <a href="#methodology" className="text-fg-secondary hover:text-fg-primary transition-colors duration-ui ease-out hidden md:inline">Methodology</a>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-sm bg-fg-primary text-surface-card text-meta font-semibold hover:opacity-90 transition-opacity duration-ui ease-out"
            >
              Open Dashboard <ArrowRightIcon />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-subtle">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <p className="text-eyebrow uppercase text-fg-tertiary mb-6">
              Abu Dhabi Events Bureau · 2025 portfolio review
            </p>
            <h1 className="text-[clamp(2rem,5vw,3.25rem)] leading-[1.1] tracking-tight font-semibold text-fg-primary">
              Where the next signature event should happen.
            </h1>
            <p className="mt-5 text-body text-fg-secondary leading-relaxed max-w-[58ch]">
              EIPP turns the Emirate's event calendar into a decision surface. It counts weighted
              density by month and category, surfaces true opportunity windows, and scores every
              event on a five-factor portfolio model a Director can defend line by line.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 h-10 px-5 rounded-sm bg-accent text-accent-ink text-body-sm font-semibold hover:opacity-90 transition-opacity duration-ui ease-out"
              >
                Open Dashboard <ArrowRightIcon />
              </Link>
              <Link
                href="/gaps"
                className="inline-flex items-center h-10 px-5 rounded-sm border border-subtle hover:border-strong text-body-sm font-medium text-fg-secondary hover:text-fg-primary transition-colors duration-ui ease-out"
              >
                View Gap Finder
              </Link>
            </div>

            {/* Inline metric strip, not cards */}
            <dl className="mt-12 grid grid-cols-3 gap-8 border-t border-subtle pt-6 max-w-lg">
              <MetricDefn term="Events tracked" value={events.length.toString()} />
              <MetricDefn term="Cities benchmarked" value={cities.toString()} />
              <MetricDefn term="Gap slots · 2025" value={adReport.summary.total_gaps.toString()} />
            </dl>
          </div>

          {/* Data-first hero — real Abu Dhabi gap matrix */}
          <div className="lg:col-span-5">
            <MiniGapMatrix />
          </div>
        </div>
      </section>

      {/* Capabilities — horizontal, typographic, not cards */}
      <section id="capabilities" className="border-b border-subtle">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid lg:grid-cols-12 gap-10 mb-12">
            <div className="lg:col-span-4">
              <p className="text-eyebrow uppercase text-fg-tertiary mb-4">Three decisions</p>
              <h2 className="text-h1 font-semibold text-fg-primary tracking-tight">
                Built for the three decisions leadership actually makes.
              </h2>
            </div>
            <div className="lg:col-span-8 lg:pt-8">
              <p className="text-body text-fg-secondary leading-relaxed max-w-[60ch]">
                Each module corresponds to one question. The data model, the scoring, and the UI
                collapse around that question — no general-purpose dashboards, no feature lists
                looking for a use case.
              </p>
            </div>
          </div>

          <ol className="divide-y divide-subtle border-y border-subtle">
            <Capability
              n="01"
              title="Gap Finder"
              question="Where are the holes in the calendar?"
              body="A month × category matrix across Abu Dhabi, Dubai, and GCC capitals. Density is weighted by impact, not raw count, so an empty month with one major event reads different from an empty month with three small ones."
              href="/gaps"
              cta="Detect gaps"
            />
            <Capability
              n="02"
              title="Concept Generator"
              question="What events should we create?"
              body="Each high-gap slot becomes a grounded concept: category, format, suggested month, estimated audience, and three reference events from comparable cities that prove demand exists."
              href="/concepts"
              cta="Generate concepts"
            />
            <Capability
              n="03"
              title="Portfolio Optimizer"
              question="Which events should we fund, scale, or drop?"
              body="Every event scored on ROI, strategic fit, seasonality, tourism impact, and private-sector potential — each weighted explicitly, tier-adjusted for source confidence, reranked live as budget scenarios shift."
              href="/portfolio"
              cta="Open optimizer"
            />
          </ol>
        </div>
      </section>

      {/* Methodology */}
      <section id="methodology" className="border-b border-subtle">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8 py-16 lg:py-20 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <p className="text-eyebrow uppercase text-fg-tertiary mb-4">Methodology</p>
            <h2 className="text-h1 font-semibold text-fg-primary tracking-tight mb-5">
              Deterministic. Explainable. Defensible.
            </h2>
            <p className="text-body text-fg-secondary leading-relaxed">
              Every recommendation traces to a counted gap, a weighted score, and a set of reference
              events. No black-box model, no prompt-engineered narrative. A decision a Director can
              sign, and a board member can audit.
            </p>
          </div>

          <div className="lg:col-span-7">
            {/* Score formula — typographic, no gradient, no card */}
            <div className="border border-subtle rounded-md p-6 bg-surface-card">
              <div className="flex items-baseline justify-between mb-5">
                <p className="text-eyebrow uppercase text-fg-tertiary">Portfolio score</p>
                <span className="text-eyebrow uppercase text-fg-tertiary">Weights</span>
              </div>
              <dl className="space-y-3">
                <WeightRow term="ROI"             weight={0.30} />
                <WeightRow term="Strategic fit"   weight={0.25} />
                <WeightRow term="Seasonality"     weight={0.20} />
                <WeightRow term="Tourism impact"  weight={0.15} />
                <WeightRow term="Private sector"  weight={0.10} />
              </dl>
              <div className="mt-5 pt-4 border-t border-subtle flex items-baseline justify-between text-meta">
                <span className="text-fg-tertiary">× tier modifier × impact weight</span>
                <span className="font-mono font-semibold text-fg-primary">= score / 10</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA — single line, no hero repeat */}
      <section className="border-b border-subtle">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8 py-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-h2 font-semibold text-fg-primary tracking-tight">
              Review the 2025 calendar.
            </h2>
            <p className="text-body text-fg-tertiary mt-1">
              Director dashboard with gap analysis, recommended concepts, and live portfolio scoring.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-sm bg-accent text-accent-ink text-body-sm font-semibold hover:opacity-90 transition-opacity duration-ui ease-out"
          >
            Open Dashboard <ArrowRightIcon />
          </Link>
        </div>
      </section>

      <footer>
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8 py-8 flex flex-wrap items-center justify-between gap-3 text-meta text-fg-tertiary">
          <p>EIPP · Abu Dhabi Events Bureau · v0.4 MVP</p>
          <p>© 2025 DCT Abu Dhabi · For internal director review</p>
        </div>
      </footer>
    </div>
  )
}

/* ───────────────────────────────────────────────────────────
   Sub-components
   ─────────────────────────────────────────────────────────── */

function MetricDefn({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="text-eyebrow uppercase text-fg-tertiary">{term}</dt>
      <dd className="text-h2 font-semibold text-fg-primary mt-1 tnum" data-tabular>{value}</dd>
    </div>
  )
}

function Capability({
  n, title, question, body, href, cta,
}: {
  n: string; title: string; question: string; body: string; href: string; cta: string
}) {
  return (
    <li>
      <Link
        href={href}
        className="block py-7 group hover:bg-surface-inset transition-colors duration-ui ease-out -mx-4 px-4 rounded-sm"
      >
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-1 font-mono text-meta text-fg-tertiary">{n}</div>
          <div className="lg:col-span-3">
            <p className="text-h3 font-semibold text-fg-primary">{title}</p>
            <p className="text-meta text-fg-tertiary mt-1 italic">{question}</p>
          </div>
          <div className="lg:col-span-6">
            <p className="text-body-sm text-fg-secondary leading-relaxed">{body}</p>
          </div>
          <div className="lg:col-span-2 lg:text-right">
            <span className="inline-flex items-center gap-1 text-body-sm font-medium text-fg-primary">
              {cta}
              <ArrowRightIcon className="transition-transform duration-ui ease-out group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </li>
  )
}

function WeightRow({ term, weight }: { term: string; weight: number }) {
  const pct = Math.round(weight * 100)
  return (
    <div className="flex items-center gap-4">
      <dt className="text-body-sm text-fg-secondary w-32 shrink-0">{term}</dt>
      <div className="flex-1 h-1 bg-surface-inset rounded-sm overflow-hidden">
        <div className="h-full bg-accent rounded-sm" style={{ width: `${pct * 3}%` }} />
      </div>
      <dd className="text-meta font-mono font-medium text-fg-primary w-10 text-right tnum" data-tabular>
        {weight.toFixed(2)}
      </dd>
    </div>
  )
}

/* Real-data mini gap matrix — no placeholder, no sample data. */
async function MiniGapMatrix() {
  const events = await getEvents({ year: 2025 })
  const report = detectGaps(events, 'Abu Dhabi', 2025)
  const MONTHS = ['J','F','M','A','M','J','J','A','S','O','N','D']
  const CATEGORIES = ['Family', 'Entertainment', 'Sports'] as const
  const DENSITY: Record<string, string> = {
    empty:    'bg-gap-empty',
    light:    'bg-gap-light',
    moderate: 'bg-gap-moderate',
    heavy:    'bg-gap-heavy',
  }

  return (
    <figure className="border border-subtle rounded-md bg-surface-card p-6" aria-label="Abu Dhabi gap matrix preview">
      <figcaption className="flex items-baseline justify-between mb-4">
        <div>
          <p className="text-eyebrow uppercase text-fg-tertiary">Live preview</p>
          <p className="text-body-sm font-semibold text-fg-primary mt-0.5">Abu Dhabi · 2025</p>
        </div>
        <p className="text-meta text-fg-tertiary tnum" data-tabular>
          {report.summary.total_gaps} gap slots
        </p>
      </figcaption>
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-1 text-meta" data-tabular>
          <thead>
            <tr>
              <th scope="col" className="w-20" />
              {MONTHS.map((m, i) => (
                <th key={i} scope="col" className="text-fg-tertiary font-medium text-center w-5">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map(cat => (
              <tr key={cat}>
                <th scope="row" className="text-left text-meta text-fg-secondary pr-2 font-medium">
                  {cat}
                </th>
                {MONTHS.map((_, i) => {
                  const slot = report.slots.find(s => s.month === i + 1 && s.category === cat)
                  const density = slot?.density ?? 'empty'
                  return (
                    <td key={i} className="text-center p-0">
                      <span
                        className={`block w-5 h-5 rounded-sm mx-auto ${DENSITY[density]}`}
                        aria-hidden
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 pt-3 border-t border-subtle flex flex-wrap gap-4 text-meta text-fg-tertiary">
        {(['empty','light','moderate','heavy'] as const).map(d => (
          <span key={d} className="inline-flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-sm ${DENSITY[d]}`} aria-hidden />
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </span>
        ))}
      </div>
    </figure>
  )
}
