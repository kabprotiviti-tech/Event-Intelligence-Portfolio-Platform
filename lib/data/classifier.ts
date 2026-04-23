import type { Category, City, VerificationLevel } from '@/types'

/**
 * Deterministic, fast, testable keyword classifier.
 * No LLM on the critical path — director tools need reproducibility.
 */

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  Sports: [
    'marathon','race','racing','grand prix',' gp ','tournament','championship',
    'tennis','golf','football','padel','cup','swim','regatta','cycling','cricket',
    'triathlon','boxing','mma','ufc','olympics','league','derby','match','fixture',
    'f1','formula 1','formula-1','formula e','fitness challenge','fighting',
  ],
  Entertainment: [
    'concert','festival','film','art','gallery','exhibition','comedy','theatre',
    'theater','conference','expo','summit','adipec','gitex','jazz','music','gig',
    'opera','symphony','rock','dj','live performance','airshow','show','stand-up',
  ],
  Family: [
    'family','kids','children','heritage','cultural','food','date festival',
    'carnival','national day','eid','ramadan','book fair','children festival',
    'playtime','camping',
  ],
}

export function classifyCategory(text: string, fallback: Category = 'Entertainment'): Category {
  const t = ` ${text.toLowerCase()} `
  let best: { cat: Category; score: number } = { cat: fallback, score: 0 }
  for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS) as [Category, string[]][]) {
    let score = 0
    for (const w of words) if (t.includes(w)) score += 1
    if (score > best.score) best = { cat, score }
  }
  return best.cat
}

const CITY_KEYWORDS: Array<[string, City]> = [
  ['abu dhabi',       'Abu Dhabi'],
  ['yas island',      'Abu Dhabi'],
  ['al ain',          'Abu Dhabi'],
  ['saadiyat',        'Abu Dhabi'],
  ['adnec',           'Abu Dhabi'],
  ['dubai',           'Dubai'],
  ['riyadh',          'Riyadh'],
  ['jeddah',          'Riyadh'],       // collapse Saudi cities to Riyadh for our GCC grouping
  ['doha',            'Doha'],
  ['qatar',           'Doha'],
  ['muscat',          'Muscat'],
  ['oman',            'Muscat'],
]

export function extractCity(text: string): City | null {
  const t = text.toLowerCase()
  for (const [kw, city] of CITY_KEYWORDS) {
    if (t.includes(kw)) return city
  }
  return null
}

const COUNTRY_MAP: Record<string, string> = {
  'Abu Dhabi': 'UAE', 'Dubai': 'UAE',
  'Riyadh': 'Saudi Arabia', 'Doha': 'Qatar', 'Muscat': 'Oman',
}

export function cityToCountry(city: City): string {
  return COUNTRY_MAP[city] ?? 'UAE'
}

export function defaultImpactForTier(tier: VerificationLevel): 1 | 2 | 3 | 4 | 5 {
  return ({ 'Tier 1': 4, 'Tier 2': 3, 'Tier 3': 2 } as const)[tier]
}

/**
 * Remove publisher/source suffixes commonly appended to Google News headlines:
 *   "Event X kicks off - The National"   →  "Event X kicks off"
 *   "Event Y at ADNEC | Gulf News"       →  "Event Y at ADNEC"
 */
export function cleanHeadline(s: string): string {
  return s
    .replace(/\s*[-–—|]\s*[^-–—|]{3,}$/, '')  // strip " - Publisher" tails
    .replace(/\s+/g, ' ')
    .trim()
}
