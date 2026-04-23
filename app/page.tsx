import Link from 'next/link'
import { getEvents } from '@/lib/data-provider'
import { detectGaps } from '@/lib/gap-detector'

export default async function LandingPage() {
  const events = await getEvents({ year: 2025 })
  const adReport = detectGaps(events, 'Abu Dhabi', 2025)
  const stats = {
    tracked: events.length,
    gaps: adReport.summary.total_gaps,
    cities: new Set(events.map(e => e.city)).size,
  }

  return (
    <div className="min-h-screen bg-[#05101f] text-white relative overflow-hidden">
      {/* Ambient gradient + grid */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-[#1a3a6b] rounded-full blur-[160px] opacity-40" />
        <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] bg-[#c9a84c] rounded-full blur-[180px] opacity-10" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* NAV */}
      <header className="relative z-10 px-8 lg:px-16 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#c9a84c] to-[#b8962f] flex items-center justify-center text-[#05101f] font-bold">
            EI
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium">DCT Abu Dhabi</p>
            <p className="text-sm font-semibold leading-tight">Event Intelligence Platform</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#capabilities" className="hover:text-white transition">Capabilities</a>
          <a href="#pulse" className="hover:text-white transition">Live Pulse</a>
          <a href="#methodology" className="hover:text-white transition">Methodology</a>
          <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-white text-[#05101f] font-medium hover:bg-white/90 transition">
            Open Dashboard →
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative z-10 px-8 lg:px-16 pt-16 lg:pt-24 pb-24 max-w-7xl mx-auto">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-white/70 uppercase tracking-widest font-medium">Director-Level · MVP · 2025</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
            Where the next
            <span className="block bg-gradient-to-r from-[#c9a84c] via-[#e0c978] to-[#c9a84c] bg-clip-text text-transparent">
              signature event
            </span>
            should happen.
          </h1>

          <p className="text-lg lg:text-xl text-white/60 leading-relaxed max-w-2xl mb-10">
            EIPP turns the Abu Dhabi event calendar into a decision surface. Spot the gaps.
            Surface the concepts. Score the portfolio. One platform for the three questions
            that matter to leadership.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard" className="group px-6 py-3.5 rounded-lg bg-[#c9a84c] text-[#05101f] font-semibold text-sm hover:bg-[#d9b95c] transition flex items-center gap-2">
              Enter Dashboard
              <span className="transition group-hover:translate-x-0.5">→</span>
            </Link>
            <Link href="/portfolio" className="px-6 py-3.5 rounded-lg bg-white/5 border border-white/10 font-medium text-sm text-white/80 hover:bg-white/10 transition">
              View Portfolio
            </Link>
            <Link href="/gaps" className="px-6 py-3.5 rounded-lg font-medium text-sm text-white/60 hover:text-white transition">
              Explore Gap Finder
            </Link>
          </div>
        </div>

        {/* Floating stat strip */}
        <div className="mt-20 lg:mt-24 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl">
          <HeroStat value={stats.tracked} label="Events tracked" sub="across UAE + GCC" />
          <HeroStat value={stats.gaps} label="Calendar gaps detected" sub="Abu Dhabi · 2025" highlight />
          <HeroStat value={stats.cities} label="Cities benchmarked" sub="AD · Dubai · Riyadh · Doha" />
          <HeroStat value="5" label="Category × time axes" sub="weighted density model" />
        </div>
      </section>

      {/* CAPABILITIES */}
      <section id="capabilities" className="relative z-10 px-8 lg:px-16 py-24 border-t border-white/5 bg-[#050b18]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-14">
            <div>
              <p className="text-[11px] text-[#c9a84c] uppercase tracking-[0.2em] font-semibold mb-3">Three pillars</p>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight max-w-2xl">
                Built for the three decisions leadership actually makes.
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <Capability
              n="01"
              title="Gap Finder"
              desc="A month × category matrix across Abu Dhabi, Dubai and GCC. Uses weighted density — scaled by event impact — to surface true opportunity windows, not just empty cells."
              href="/gaps"
              cta="Detect gaps"
            />
            <Capability
              n="02"
              title="Concept Generator"
              desc="Turns each high-gap slot into a grounded event concept, with category, timing, audience estimate and reference events that prove regional demand."
              href="/concepts"
              cta="Generate concepts"
              accent
            />
            <Capability
              n="03"
              title="Portfolio Optimizer"
              desc="Every event scored on a five-factor model — ROI, strategic fit, seasonality, tourism impact, private-sector potential. Simulate the budget and watch priorities re-rank."
              href="/portfolio"
              cta="Open optimizer"
            />
          </div>
        </div>
      </section>

      {/* LIVE PULSE */}
      <section id="pulse" className="relative z-10 px-8 lg:px-16 py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[11px] text-[#c9a84c] uppercase tracking-[0.2em] font-semibold mb-3">Live pulse</p>
              <h2 className="text-4xl font-bold tracking-tight mb-5">
                Deterministic. Explainable. Defensible.
              </h2>
              <p className="text-white/60 leading-relaxed mb-6">
                Every recommendation traces to a counted gap, a weighted score, and a reference event.
                No black-box ML, no prompt-engineered guesses. A decision a director can sign off on.
              </p>
              <ul className="space-y-3">
                {[
                  'Verification tiered — Gov / Marketplace / News with score modifiers',
                  'Weighted density uses impact_weight, not raw count',
                  'Every concept cites reference events by ID',
                  'Budget simulator re-ranks in real time',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/70">
                    <span className="shrink-0 mt-1.5 w-1 h-1 rounded-full bg-[#c9a84c]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#c9a84c]/20 via-transparent to-[#1a3a6b]/30 rounded-2xl blur-3xl" />
              <div className="relative rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 p-8 backdrop-blur">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Portfolio Score Formula</p>
                  <span className="text-[10px] text-emerald-400 uppercase">Live</span>
                </div>
                <div className="space-y-3 font-mono text-sm">
                  <Row label="ROI"             weight="0.30" />
                  <Row label="Strategic Fit"   weight="0.25" />
                  <Row label="Seasonality"     weight="0.20" />
                  <Row label="Tourism Impact"  weight="0.15" />
                  <Row label="Private Sector"  weight="0.10" />
                </div>
                <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-white/40">× tier modifier × impact weight</span>
                  <span className="text-sm font-semibold text-[#c9a84c]">= score</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="relative z-10 px-8 lg:px-16 py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Ready to see the 2025 calendar?
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Open the director dashboard for a full view of gaps, concepts and portfolio scores.
          </p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-[#c9a84c] text-[#05101f] font-semibold hover:bg-[#d9b95c] transition">
            Open Dashboard →
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 px-8 lg:px-16 py-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-white/40">
          <p>EIPP · Abu Dhabi Events Bureau · v0.2 MVP</p>
          <p>© 2025 DCT Abu Dhabi · For internal director review</p>
        </div>
      </footer>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────
function HeroStat({ value, label, sub, highlight }: { value: string | number; label: string; sub: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-5 border ${highlight ? 'bg-[#c9a84c]/5 border-[#c9a84c]/20' : 'bg-white/[0.03] border-white/10'}`}>
      <p className={`text-3xl font-bold tracking-tight ${highlight ? 'text-[#c9a84c]' : 'text-white'}`}>{value}</p>
      <p className="text-sm font-medium text-white/80 mt-1">{label}</p>
      <p className="text-xs text-white/40 mt-0.5">{sub}</p>
    </div>
  )
}

function Capability({ n, title, desc, href, cta, accent }: { n: string; title: string; desc: string; href: string; cta: string; accent?: boolean }) {
  return (
    <Link
      href={href}
      className={`group relative rounded-2xl p-7 border transition-all hover:-translate-y-0.5 ${
        accent
          ? 'bg-gradient-to-b from-[#c9a84c]/10 to-transparent border-[#c9a84c]/20 hover:border-[#c9a84c]/40'
          : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05] hover:border-white/20'
      }`}
    >
      <div className="flex items-start justify-between mb-8">
        <span className={`text-xs font-mono font-semibold ${accent ? 'text-[#c9a84c]' : 'text-white/40'}`}>{n}</span>
        <span className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition">→</span>
      </div>
      <h3 className="text-2xl font-semibold mb-3 tracking-tight">{title}</h3>
      <p className="text-sm text-white/60 leading-relaxed mb-6">{desc}</p>
      <span className={`text-xs font-semibold uppercase tracking-widest ${accent ? 'text-[#c9a84c]' : 'text-white/70'}`}>{cta}</span>
    </Link>
  )
}

function Row({ label, weight }: { label: string; weight: string }) {
  const pct = parseFloat(weight) * 100
  return (
    <div className="flex items-center gap-4">
      <span className="text-white/50 w-32">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-[#c9a84c] to-[#e0c978]" style={{ width: `${pct * 3}%` }} />
      </div>
      <span className="text-white/70 w-12 text-right">{weight}</span>
    </div>
  )
}
