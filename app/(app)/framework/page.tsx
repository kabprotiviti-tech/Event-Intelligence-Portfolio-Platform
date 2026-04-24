'use client'

/**
 * EIPP Framework & Methodology — comprehensive reference document.
 *
 * Every formula, threshold, source, and data flow documented on one page
 * so a Chairman can defend any number on the platform in a ministerial
 * meeting. Print-friendly. Anchored sections. Matches the actual code.
 *
 * If the code changes, this page must be updated. The source pointers
 * at each section tell the maintainer exactly which file to edit.
 */

const SECTIONS = [
  { id: 'scoring',    label: '1. Event Scoring' },
  { id: 'pricing',    label: '2. Pricing & Budget' },
  { id: 'gaps',       label: '3. Gap Detection' },
  { id: 'decisions',  label: '4. Decision Engine' },
  { id: 'confidence', label: '5. Confidence' },
  { id: 'sources',    label: '6. Source Tiers' },
  { id: 'data',       label: '7. Data Sources' },
  { id: 'trends',     label: '8. Trend Intelligence' },
  { id: 'ai',         label: '9. AI Layer' },
  { id: 'governance', label: '10. Governance' },
]

export default function FrameworkPage() {
  return (
    <div className="mx-auto max-w-[1000px] space-y-12 pb-16">

      <header className="space-y-3">
        <p className="text-eyebrow uppercase text-fg-tertiary">Reference document</p>
        <h1 className="text-h1 font-semibold text-fg-primary">EIPP Framework & Methodology</h1>
        <p className="text-body text-fg-secondary leading-relaxed max-w-[70ch]">
          Every formula, threshold, and data source the platform uses to score events,
          detect gaps, and generate decisions. This page is the single source of truth.
          If something on another screen looks wrong, compare to this — and if the Chairman
          asks <em>"where does 8.5 come from?"</em>, the answer is one of the sections below.
        </p>
        <p className="text-meta text-fg-tertiary pt-2 border-t border-subtle">
          Last reviewed against code: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
          {' · '}
          Platform version v0.5 MVP
        </p>
      </header>

      {/* Table of contents */}
      <nav aria-label="Sections" className="rounded-md border border-subtle bg-surface-card p-5" data-print-hide>
        <p className="text-eyebrow uppercase text-fg-tertiary mb-3">Contents</p>
        <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
          {SECTIONS.map(s => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="text-body-sm text-fg-secondary hover:text-fg-primary transition-colors duration-ui ease-out"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* ─── 1. SCORING ─── */}
      <Section id="scoring" n="1" title="Event Scoring Framework" source="lib/scorer.ts · scoreEvent()">
        <p className="text-body text-fg-secondary leading-relaxed">
          Every event in the portfolio receives a single <strong>portfolio score</strong> on a 0–10 scale.
          Five underlying factors each also 0–10, weighted by strategic importance, then modified by
          source quality and impact size.
        </p>

        <Formula>
          portfolio_score = Σ(factor × weight) × tier_modifier × impact_modifier
        </Formula>

        <SubsectionTitle>Factor weights</SubsectionTitle>
        <Table
          headers={['Factor', 'Weight', 'What it measures', 'Data origin']}
          rows={[
            ['ROI',             '30%', 'Revenue ÷ public investment',            'Tourism Economics model · TBD real data'],
            ['Strategic fit',   '25%', 'Alignment with DCT Vision 2030',         'Internal rubric · DCT strategy team'],
            ['Seasonality',     '20%', 'Fits tourism arrivals calendar',         'SCAD arrivals data · TBD'],
            ['Tourism impact',  '15%', 'International arrivals driven',          'Hotel + Etihad data · TBD'],
            ['Private sector',  '10%', 'Sponsorship + partner commitment',       'Procurement records · TBD'],
          ]}
        />

        <SubsectionTitle>Modifiers</SubsectionTitle>
        <dl className="grid md:grid-cols-2 gap-4">
          <Definition
            term="Tier modifier"
            def="Penalises unverified sources"
            rule="Tier 1 × 1.00 · Tier 2 × 0.90 · Tier 3 × 0.80"
          />
          <Definition
            term="Impact modifier"
            def="Scales around impact weight 3"
            rule="1 + (impact_weight − 3) × 0.025 — so ±5% across 1–5"
          />
        </dl>

        <SubsectionTitle>Example computation</SubsectionTitle>
        <Example>
          <p><strong>Abu Dhabi Grand Prix</strong> (Tier 1, impact 5)</p>
          <CodeBlock>
{`ROI             10.0 × 0.30 = 3.00
strategic_fit   10.0 × 0.25 = 2.50
seasonality     10.0 × 0.20 = 2.00
tourism_impact  10.0 × 0.15 = 1.50
private_sector  10.0 × 0.10 = 1.00
                             ─────
weighted_sum                 10.00

tier_mod (Tier 1)           × 1.000
impact_mod (5/5)            × 1.050

raw score                   = 10.50
clamped to 10                 10.0 / 10`}
          </CodeBlock>
        </Example>

        <SubsectionTitle>Assumptions</SubsectionTitle>
        <Bullets>
          <li>Factor inputs are 0–10 scores, currently mock. Real deployment replaces with measured outcomes (see section 7).</li>
          <li>Weights are fixed in code — changing them ripples through every Fund/Scale/Drop decision. Proposed changes go to the governance log.</li>
          <li>Output is rounded to 1 decimal and clamped to [0, 10]. An event scoring 10.5 raw caps at 10.0.</li>
        </Bullets>
      </Section>

      {/* ─── 2. PRICING ─── */}
      <Section id="pricing" n="2" title="Pricing & Budget Framework" source="lib/scorer.ts · simulateBudget()">
        <p className="text-body text-fg-secondary leading-relaxed">
          Every event carries a <strong>min_budget_required</strong> (AED). The portfolio simulator
          allocates across events proportional to portfolio score, capped by the total envelope set
          by the Director on the Portfolio page slider.
        </p>

        <SubsectionTitle>Budget fields</SubsectionTitle>
        <Table
          headers={['Field', 'Meaning', 'Origin']}
          rows={[
            ['min_budget_required', 'Floor cost to run the event at MVP scale', 'Event owner · procurement estimate'],
            ['budget_allocated',    'What the simulator assigns given total envelope', 'Computed live in lib/scorer.ts'],
            ['ticket_price_range',  'Min/max ticket price (AED)',               'Ticketing platform or government cap'],
            ['estimated_attendance','Expected guests',                          'Historical + capacity estimate'],
          ]}
        />

        <SubsectionTitle>Allocation logic</SubsectionTitle>
        <Formula>
          budget_allocated[i] = (portfolio_score[i] / Σ portfolio_score) × total_budget
        </Formula>
        <p className="text-body-sm text-fg-secondary leading-relaxed">
          Higher-scoring events get proportionally more. Total never exceeds the director-set envelope.
          The simulator re-allocates live when the slider moves — every event's share updates immediately.
        </p>

        <SubsectionTitle>Per-guest metrics</SubsectionTitle>
        <Formula>
          per_guest_spend = budget_allocated ÷ estimated_attendance
        </Formula>
        <p className="text-body-sm text-fg-secondary leading-relaxed">
          Used by the Scale decision bucket (section 4). Events significantly below the portfolio median
          per-guest spend are flagged as underfunded growth opportunities.
        </p>

        <SubsectionTitle>Constraint buffer</SubsectionTitle>
        <Definition
          term="Budget overrun buffer"
          def="3% tolerance above total before flagging"
          rule="allocated ≤ total × 1.03 is treated as within limit"
        />
      </Section>

      {/* ─── 3. GAPS ─── */}
      <Section id="gaps" n="3" title="Gap Detection Framework" source="lib/gap-detector.ts · detectGaps()">
        <p className="text-body text-fg-secondary leading-relaxed">
          The calendar is sliced into 36 cells: 12 months × 3 categories (Family, Entertainment, Sports).
          Each cell's <strong>weighted density</strong> is the sum of impact_weight for all events that
          land in it. Density buckets into four classes.
        </p>

        <SubsectionTitle>Density bands</SubsectionTitle>
        <Table
          headers={['Band', 'Rule', 'Gap score', 'Meaning']}
          rows={[
            ['Empty',    'weighted_density = 0',        '1.00',  'No events — direct opportunity'],
            ['Light',    'weighted_density ≤ 3',        '0.70',  'Single low-impact event — underserved'],
            ['Moderate', '3 < weighted_density ≤ 8',    '0.30',  'Adequate coverage'],
            ['Heavy',    'weighted_density > 8',        '0.00',  'Saturated — no opportunity'],
          ]}
        />

        <SubsectionTitle>Severity classification</SubsectionTitle>
        <Table
          headers={['Severity', 'Rule', 'UI treatment']}
          rows={[
            ['Critical', 'gap_score > 0.80',              'Red pill · top of drill lists'],
            ['Medium',   '0.50 ≤ gap_score ≤ 0.80',       'Amber pill'],
            ['Low',      'gap_score < 0.50',              'Grey pill · suppressed from dashboards'],
          ]}
        />

        <SubsectionTitle>Why weighted, not raw count</SubsectionTitle>
        <p className="text-body-sm text-fg-secondary leading-relaxed">
          A cell with one marquee event (Grand Prix, impact 5) is not the same as a cell with three
          small community events (impact 1 each). Weighting protects against gaming the metric by
          stuffing the calendar with low-effort filler.
        </p>
      </Section>

      {/* ─── 4. DECISIONS ─── */}
      <Section id="decisions" n="4" title="Decision Engine Framework" source="lib/decision-engine.ts · generateDecisions()">
        <p className="text-body text-fg-secondary leading-relaxed">
          The engine outputs four decision buckets for the Chairman: <strong>Fund</strong>,
          <strong> Scale</strong>, <strong> Drop</strong>, <strong> Create</strong>. Rules are rule-based,
          not ML — every entry traces to a specific numeric comparison.
        </p>

        <SubsectionTitle>Thresholds</SubsectionTitle>
        <Table
          headers={['Bucket', 'Primary rule', 'Ranking signal', 'Limit']}
          rows={[
            ['Fund',   'portfolio_score > 7.0 AND strategic_fit ≥ 7.5', 'portfolio_score desc', 'Top 3'],
            ['Scale',  '5.0 ≤ portfolio_score ≤ 7.0',                   'underfunding ratio',   'Top 3'],
            ['Drop',   'portfolio_score < 4.0',                          'portfolio_score asc', 'Bottom 3'],
            ['Create', 'gap_score > 0.7',                                'gap × trend boost',   'Top 4'],
          ]}
        />

        <SubsectionTitle>Strategic constraints (non-blocking warnings)</SubsectionTitle>
        <Table
          headers={['Constraint', 'Threshold', 'Flag']}
          rows={[
            ['Category min count',   '< 2 events in any category',        'Category imbalance warning'],
            ['Seasonality peak',     '≥ 5 events in a single month',      'Peak month alert'],
            ['Seasonality low',      '≤ 1 event in a single month',       'Low month alert'],
            ['Budget overrun',       'allocated > total × 1.03',           'Over-budget flag'],
            ['Competition deficit',  'AD < comparison in a month×cat slot', 'Counted; surfaces in panel'],
          ]}
        />
      </Section>

      {/* ─── 5. CONFIDENCE ─── */}
      <Section id="confidence" n="5" title="Confidence Framework" source="lib/decision-engine.ts · confidenceFor*()">
        <p className="text-body text-fg-secondary leading-relaxed">
          Every decision ships with a confidence badge so the Chairman knows how much to trust the inputs.
          Rules differ between <strong>event decisions</strong> (Fund/Scale/Drop) and <strong>create decisions</strong>.
        </p>

        <SubsectionTitle>Event decision confidence</SubsectionTitle>
        <Table
          headers={['Confidence', 'Rule']}
          rows={[
            ['High',   'Tier 1 source AND stddev(sub_scores) < 1.5'],
            ['Medium', 'Tier 1 (any variance) · OR · Tier 2 + stddev < 2.0'],
            ['Low',    'Tier 3 source · OR · unstable sub-scores'],
          ]}
        />

        <SubsectionTitle>Create (concept) confidence</SubsectionTitle>
        <Table
          headers={['Confidence', 'Rule']}
          rows={[
            ['High',   'gap_score ≥ 0.85 AND ≥ 2 regional reference events'],
            ['Medium', 'gap_score ≥ 0.65 · OR · ≥ 1 reference event'],
            ['Low',    'Weaker gap or no regional precedent'],
          ]}
        />

        <p className="text-body-sm text-fg-secondary leading-relaxed">
          Variance catches events that score OK on average but hide a big weakness
          (e.g. strong ROI but weak strategic fit). A Tier 3 ceiling prevents news-signal
          data from ever showing High confidence regardless of score coherence.
        </p>
      </Section>

      {/* ─── 6. SOURCE TIERS ─── */}
      <Section id="sources" n="6" title="Source Tier Framework" source="types/index.ts · VerificationLevel">
        <p className="text-body text-fg-secondary leading-relaxed">
          Every event carries a <strong>verification_level</strong> that tells the scoring engine (and
          the Chairman) how much to trust the data. Tiers map directly to the tier modifier in section 1.
        </p>

        <Table
          headers={['Tier', 'Source type', 'Examples', 'Score modifier']}
          rows={[
            ['Tier 1', 'Government / official',   'DCT Official Calendar · Visit Dubai · RAK Tourism',     '× 1.00'],
            ['Tier 2', 'Marketplace / ticketing', 'Ticketmaster · Platinumlist · Fever',                   '× 0.90'],
            ['Tier 3', 'News / signal',           'NewsAPI · Google News RSS',                             '× 0.80'],
          ]}
        />

        <p className="text-body-sm text-fg-secondary leading-relaxed">
          When multiple sources describe the same event (same name + city + date ±2 days), the
          highest-tier wins in deduplication — Tier 1 beats Tier 2 beats Tier 3. See{' '}
          <code className="font-mono text-fg-primary">lib/data/provider-registry.ts · dedupe()</code>.
        </p>
      </Section>

      {/* ─── 7. DATA SOURCES ─── */}
      <Section id="data" n="7" title="Data Sources" source="lib/data/connectors/*">
        <p className="text-body text-fg-secondary leading-relaxed">
          The platform ingests from multiple connectors. Each one returns raw data that's normalized
          into the canonical Event shape through{' '}
          <code className="font-mono text-fg-primary">lib/data/normalize.ts</code>.
        </p>

        <SubsectionTitle>Currently integrated</SubsectionTitle>
        <Table
          headers={['Source', 'Tier', 'Endpoint', 'Status', 'Env flag']}
          rows={[
            ['Editorial mock',     'Mixed',  'data/mock-events-*.ts',                               'Always on',              'n/a'],
            ['Google News RSS',    'Tier 3', 'news.google.com/rss/search',                          'Live when enabled',      'EIPP_DATA_MODE=live'],
            ['NewsAPI.org',        'Tier 3', 'newsapi.org/v2/everything',                           'Live when key present',  'NEWS_API_KEY'],
            ['Ticketmaster',       'Tier 2', 'app.ticketmaster.com/discovery/v2/events.json',       'Live when key present',  'TICKETMASTER_API_KEY'],
          ]}
        />

        <SubsectionTitle>Planned integrations</SubsectionTitle>
        <Table
          headers={['Source', 'Tier', 'What it gives us']}
          rows={[
            ['SCAD (Abu Dhabi Stats)',           'Tier 1', 'Real tourist arrivals, tourism GDP contribution'],
            ['STR / ADTCA',                       'Tier 1', 'Hotel occupancy, ADR, RevPAR correlated to event dates'],
            ['Etihad booking pipeline',           'Tier 1', '30/60/90-day forward flight capacity + seats sold'],
            ['Tourism Economics',                 'Tier 1', 'Standardized economic impact modeling'],
            ['DCT Tourism Performance System',    'Tier 1', 'Post-event NPS, media value, nationality mix'],
            ['Brandwatch / Talkwalker',           'Tier 2', 'Real-time social sentiment per event'],
            ['Platinumlist',                      'Tier 2', 'UAE-specific ticketing volume'],
            ['Fever',                             'Tier 2', 'Experiential / niche event inventory'],
          ]}
        />

        <SubsectionTitle>Caching & freshness</SubsectionTitle>
        <Table
          headers={['Layer', 'TTL', 'Behavior']}
          rows={[
            ['Live connector cache',  '15 minutes',  'Per-URL memoize in lib/data/cache.ts'],
            ['Portfolio store',       'Session',     'In-memory; survives hot-reload via globalThis'],
            ['Client SWR cache',      '2–10 seconds', 'Deduped re-fetches, revalidates on mutation'],
            ['AI response cache',     '60 seconds',  'Prompt-caching discount on Anthropic side'],
          ]}
        />

        <SubsectionTitle>Degradation policy</SubsectionTitle>
        <Bullets>
          <li>If a connector throws, its slot is skipped. Other sources keep flowing.</li>
          <li>If <em>every</em> live connector fails, system falls back to mock. UI never shows an empty dashboard.</li>
          <li>If <code className="font-mono">ANTHROPIC_API_KEY</code> is missing, AI endpoints return deterministic fallback text with a "Rule-based" badge.</li>
        </Bullets>
      </Section>

      {/* ─── 8. TRENDS ─── */}
      <Section id="trends" n="8" title="Trend Intelligence" source="lib/trend-analyzer.ts · lib/trend-intelligence.ts">
        <p className="text-body text-fg-secondary leading-relaxed">
          Category momentum is computed from source-weighted event counts over rolling 90-day windows
          (last 90 days vs prior 90 days). Higher weights go to <em>demand signals</em> — real tickets
          beat general news coverage.
        </p>

        <SubsectionTitle>Source weights for trend signal</SubsectionTitle>
        <Table
          headers={['Source', 'Weight', 'Rationale']}
          rows={[
            ['Marketplace (Ticketmaster, etc.)',  '2.0', 'Real tickets = real intent to attend'],
            ['News (NewsAPI, Google News)',       '1.2', 'Coverage = demand hint but not yet action'],
            ['Government (official calendars)',   '0.6', 'Structural baseline, not incremental signal'],
          ]}
        />

        <SubsectionTitle>Classification</SubsectionTitle>
        <Table
          headers={['Direction', 'Rule']}
          rows={[
            ['Rising',    'momentum > +15%'],
            ['Stable',    '−15% ≤ momentum ≤ +15%'],
            ['Declining', 'momentum < −15%'],
          ]}
        />

        <SubsectionTitle>Emerging formats</SubsectionTitle>
        <p className="text-body-sm text-fg-secondary leading-relaxed">
          Event formats (Festival / Concert / Tournament / Exhibition / Conference) that show &gt; 20%
          growth across tracked sources qualify as emerging and surface in the Chairman brief.
        </p>
      </Section>

      {/* ─── 9. AI LAYER ─── */}
      <Section id="ai" n="9" title="AI Layer" source="lib/ai/* · Claude haiku-4-5">
        <p className="text-body text-fg-secondary leading-relaxed">
          The Chairman sees AI-generated narrative in several places (Dashboard AI Insights, Explain
          buttons on decisions, Alternative concepts). <strong>AI is strictly assistive</strong> — it
          never computes scores, gap scores, or decisions.
        </p>

        <SubsectionTitle>What AI does</SubsectionTitle>
        <Bullets>
          <li><strong>Generates concept titles + narratives</strong> for gap slots (alternative to rule-based templates)</li>
          <li><strong>Explains decisions</strong> in plain English — given an event + decision kind, writes a 1-line headline + 2–3 bullet reasons</li>
          <li><strong>Summarizes strategy</strong> — composes a director brief from gaps + portfolio + trends</li>
          <li><strong>Synthesizes trends</strong> — narrates trend signals and emerging formats</li>
        </Bullets>

        <SubsectionTitle>What AI never does</SubsectionTitle>
        <Bullets>
          <li>Compute portfolio scores (section 1 is rule-based)</li>
          <li>Compute gap scores or severity (section 3)</li>
          <li>Decide Fund / Scale / Drop / Create (section 4)</li>
          <li>Set confidence tiers (section 5)</li>
          <li>Invent numbers — prompts explicitly instruct Claude to use pre-computed values verbatim</li>
        </Bullets>

        <SubsectionTitle>Provenance</SubsectionTitle>
        <Bullets>
          <li>Every AI surface shows an <code className="font-mono text-fg-primary">AI · High/Medium/Low</code> badge or a <code className="font-mono text-fg-primary">Rule-based</code> fallback badge</li>
          <li>Confidence on AI outputs is derived from input data quality (Tier 1 inputs → High, Tier 3 → Low)</li>
          <li>Model: <code className="font-mono text-fg-primary">claude-haiku-4-5</code>. System prompts use prompt caching so shared context is ~90% cheaper after first call.</li>
        </Bullets>
      </Section>

      {/* ─── 10. GOVERNANCE ─── */}
      <Section id="governance" n="10" title="Governance & Change Control" source="This page">
        <SubsectionTitle>When numbers refresh</SubsectionTitle>
        <Table
          headers={['Data', 'Refresh trigger']}
          rows={[
            ['Mock events',                     'Module load (cold start)'],
            ['Live connector fetches',          'On-demand, cached 15 min'],
            ['Portfolio scores',                'Per API call — stateless'],
            ['Gap detection',                   'Per API call — stateless'],
            ['Decision buckets',                'Per API call — stateless'],
            ['Approved concepts + budget',      'Persisted in in-memory store; resets on redeploy'],
          ]}
        />

        <SubsectionTitle>Changing formulas</SubsectionTitle>
        <Bullets>
          <li>Scoring weights: <code className="font-mono text-fg-primary">lib/scorer.ts · WEIGHTS</code></li>
          <li>Tier modifiers: <code className="font-mono text-fg-primary">lib/scorer.ts · TIER_MODIFIER</code></li>
          <li>Gap thresholds: <code className="font-mono text-fg-primary">lib/gap-detector.ts · WEIGHTED_THRESHOLDS</code></li>
          <li>Decision cutoffs: <code className="font-mono text-fg-primary">lib/decision-engine.ts · T = {'{...}'}</code></li>
          <li>Confidence rules: <code className="font-mono text-fg-primary">lib/decision-engine.ts · confidenceForEvent() + confidenceForCreate()</code></li>
          <li>Trend source weights: <code className="font-mono text-fg-primary">lib/trend-intelligence.ts · SOURCE_WEIGHT</code></li>
        </Bullets>

        <SubsectionTitle>Who can change what</SubsectionTitle>
        <Table
          headers={['Change', 'Who authorises']}
          rows={[
            ['Adjust factor weights',         'DCT strategy team + Chairman sign-off'],
            ['Add a new source connector',    'Head of Data Engineering'],
            ['Tune decision thresholds',      'Portfolio review committee'],
            ['Add / remove categories',       'Chairman (structural change)'],
            ['Upgrade AI model',              'Head of Platform'],
          ]}
        />

        <SubsectionTitle>Open items (documented honestly)</SubsectionTitle>
        <Bullets>
          <li><strong>Factor scores are currently mock.</strong> Real values need SCAD + Tourism Economics integration.</li>
          <li><strong>No historical year-over-year</strong> yet — only current year in scope.</li>
          <li><strong>No outcomes layer</strong> — the platform projects but doesn't yet track realized results.</li>
          <li><strong>Private-sector scores are mock</strong> — need procurement + sponsorship data.</li>
          <li><strong>Arabic language support declared but not implemented.</strong></li>
        </Bullets>
      </Section>

    </div>
  )
}

/* ───────────────────────────────────────────────────────────
   Presentation primitives — kept local so this page is self-contained
   ─────────────────────────────────────────────────────────── */

function Section({
  id, n, title, source, children,
}: {
  id: string
  n: string
  title: string
  source: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-5">
      <header className="flex items-baseline justify-between gap-4 pb-3 border-b border-subtle">
        <div>
          <p className="text-eyebrow uppercase text-fg-tertiary">Section {n}</p>
          <h2 className="text-h2 font-semibold text-fg-primary mt-1">{title}</h2>
        </div>
        <p className="text-meta font-mono text-fg-tertiary shrink-0">{source}</p>
      </header>
      {children}
    </section>
  )
}

function SubsectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-eyebrow uppercase text-fg-tertiary pt-4 first:pt-0">{children}</h3>
  )
}

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-subtle bg-surface-inset px-4 py-3">
      <p className="font-mono text-body-sm text-fg-primary leading-snug whitespace-pre-wrap break-words">
        {children}
      </p>
    </div>
  )
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-sm border border-subtle">
      <table className="w-full text-body-sm">
        <thead className="bg-surface-inset">
          <tr>
            {headers.map((h, i) => (
              <th key={i} scope="col" className="text-left text-eyebrow uppercase text-fg-tertiary px-3 py-2 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-subtle">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-fg-secondary align-top">
                  {j === 0 ? <span className="font-medium text-fg-primary">{cell}</span> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Definition({ term, def, rule }: { term: string; def: string; rule: string }) {
  return (
    <div className="rounded-sm border border-subtle px-4 py-3 space-y-1">
      <dt className="text-body-sm font-semibold text-fg-primary">{term}</dt>
      <dd className="text-meta text-fg-secondary">{def}</dd>
      <dd className="text-meta font-mono text-fg-tertiary">{rule}</dd>
    </div>
  )
}

function Example({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-accent/30 bg-surface-card px-4 py-3 space-y-2 text-body-sm text-fg-secondary">
      {children}
    </div>
  )
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="font-mono text-meta text-fg-primary bg-surface-inset rounded-sm px-3 py-2 overflow-x-auto leading-snug">
      {children}
    </pre>
  )
}

function Bullets({ children }: { children: React.ReactNode }) {
  return (
    <ul className="space-y-2 text-body-sm text-fg-secondary leading-relaxed list-disc pl-5 marker:text-fg-tertiary">
      {children}
    </ul>
  )
}
