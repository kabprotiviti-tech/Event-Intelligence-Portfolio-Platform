/**
 * EIPP design tokens — semantic, theme-agnostic surface for the whole app.
 * Hex values here are the source of truth; app/globals.css mirrors them
 * as space-separated RGB CSS variables so Tailwind's `/<alpha-value>` works.
 *
 * Never import hex from here at runtime. Components read via Tailwind
 * classes that resolve against CSS variables (bg-surface-card, text-fg,
 * border-subtle, bg-accent, etc.).
 */

export const THEME_IDS = [
  'dct-executive',
  'dark-executive',
  'desert-premium',
  'abu-dhabi-strategic',
  'modern-orange-tech',
  'monochrome-premium',
  'data-command',
  'luxury-gold',
] as const

export type ThemeId = (typeof THEME_IDS)[number]

export interface ThemeTokens {
  id: ThemeId
  label: string
  mode: 'light' | 'dark'
  scenario: string        // one line on when to use this theme

  surface:  { canvas: string; card: string; inset: string }
  border:   { subtle: string; strong: string }
  text:     { primary: string; secondary: string; tertiary: string }
  accent:   { base: string; ink: string }
  focus:    string
  status:   {
    positive: string; caution: string; negative: string
    info: string;     neutral: string
  }
  /** Gap-matrix color ramp, empty → heavy. Four steps, single-hue per theme. */
  gapScale: [string, string, string, string]
}

export const THEMES: Record<ThemeId, ThemeTokens> = {
  'dct-executive': {
    id: 'dct-executive',
    label: 'DCT Executive',
    mode: 'light',
    scenario: 'Default. Internal director review, board packs, ministerial briefings.',
    surface:  { canvas: '#FAFAF7', card: '#FFFFFF', inset: '#F4F2EC' },
    border:   { subtle: '#E8E4DA', strong: '#B8AE98' },
    text:     { primary: '#1A1A17', secondary: '#4A463E', tertiary: '#8A8476' },
    accent:   { base: '#C9A646', ink: '#1A1A17' },
    focus:    '#1A3A6B',
    status:   { positive: '#0A7D5E', caution: '#B8821C', negative: '#B91C1C', info: '#1A3A6B', neutral: '#8A8476' },
    gapScale: ['#F4F2EC', '#E8D9A8', '#C9A646', '#1A3A6B'],
  },
  'dark-executive': {
    id: 'dark-executive',
    label: 'Dark Executive',
    mode: 'dark',
    scenario: 'Late-evening command reviews, projector presentations, dim-room briefings.',
    surface:  { canvas: '#0B0E14', card: '#12161F', inset: '#0E1219' },
    border:   { subtle: '#1F2533', strong: '#2E3647' },
    text:     { primary: '#E8EAED', secondary: '#A9AEBA', tertiary: '#6B7280' },
    accent:   { base: '#C9A646', ink: '#0B0E14' },
    focus:    '#9FB4D8',
    status:   { positive: '#4FD1A3', caution: '#E0B94A', negative: '#F87171', info: '#9FB4D8', neutral: '#8FA0B3' },
    gapScale: ['#0E1219', '#3A3220', '#7A6530', '#C9A646'],
  },
  'desert-premium': {
    id: 'desert-premium',
    label: 'Desert Premium',
    mode: 'light',
    scenario: 'Cultural-heritage programming, Liwa / Al Ain briefs, tourism-minister decks.',
    surface:  { canvas: '#F5EEE2', card: '#FBF6EC', inset: '#EDE4D2' },
    border:   { subtle: '#D9CBB0', strong: '#9B7A4F' },
    text:     { primary: '#2A1F15', secondary: '#5B4A35', tertiary: '#8A7556' },
    accent:   { base: '#B8552B', ink: '#FBF6EC' },
    focus:    '#7A4220',
    status:   { positive: '#2F6B3E', caution: '#A36015', negative: '#A33128', info: '#5B4A35', neutral: '#8A7556' },
    gapScale: ['#EDE4D2', '#E0C89A', '#B8552B', '#5B4A35'],
  },
  'abu-dhabi-strategic': {
    id: 'abu-dhabi-strategic',
    label: 'Abu Dhabi Strategic',
    mode: 'light',
    scenario: 'National-day programming, cross-Emirate coordination, public-facing decks.',
    surface:  { canvas: '#FFFFFF', card: '#FFFFFF', inset: '#F6F6F6' },
    border:   { subtle: '#E3E3E3', strong: '#A8A8A8' },
    text:     { primary: '#0E0E0E', secondary: '#3C3C3C', tertiary: '#7A7A7A' },
    accent:   { base: '#C8102E', ink: '#FFFFFF' },
    focus:    '#0E0E0E',
    status:   { positive: '#0F7A4C', caution: '#B8821C', negative: '#C8102E', info: '#0E0E0E', neutral: '#7A7A7A' },
    gapScale: ['#F6F6F6', '#F5C7CC', '#E04F62', '#C8102E'],
  },
  'modern-orange-tech': {
    id: 'modern-orange-tech',
    label: 'Modern Orange Tech',
    mode: 'light',
    scenario: 'Innovation / GITEX / ADIPEC-adjacent briefings. Use sparingly.',
    surface:  { canvas: '#FAFAFA', card: '#FFFFFF', inset: '#F3F3F3' },
    border:   { subtle: '#E5E5E5', strong: '#A8A8A8' },
    text:     { primary: '#0A0A0A', secondary: '#404040', tertiary: '#737373' },
    accent:   { base: '#EA580C', ink: '#FFFFFF' },
    focus:    '#0A0A0A',
    status:   { positive: '#15803D', caution: '#B45309', negative: '#B91C1C', info: '#1D4ED8', neutral: '#737373' },
    gapScale: ['#F3F3F3', '#FDD9B5', '#F97316', '#9A3412'],
  },
  'monochrome-premium': {
    id: 'monochrome-premium',
    label: 'Monochrome Premium',
    mode: 'light',
    scenario: 'Printed board packs, archival exports, PDF-first deliverables. Most durable.',
    surface:  { canvas: '#F7F7F6', card: '#FFFFFF', inset: '#EEEDEB' },
    border:   { subtle: '#DEDCD8', strong: '#6E6C68' },
    text:     { primary: '#111111', secondary: '#3F3E3C', tertiary: '#7A7874' },
    accent:   { base: '#111111', ink: '#FFFFFF' },
    focus:    '#111111',
    status:   { positive: '#111111', caution: '#3F3E3C', negative: '#8A1515', info: '#111111', neutral: '#7A7874' },
    gapScale: ['#FFFFFF', '#E6E5E2', '#8A8784', '#111111'],
  },
  'data-command': {
    id: 'data-command',
    label: 'Data Command',
    mode: 'dark',
    scenario: 'Crisis coordination, live-event monitoring, multi-screen war-rooms.',
    surface:  { canvas: '#07090E', card: '#0D121B', inset: '#0A0D14' },
    border:   { subtle: '#19202C', strong: '#2B3647' },
    text:     { primary: '#EAF0F6', secondary: '#8FA0B3', tertiary: '#5A6B7E' },
    accent:   { base: '#4FD1C5', ink: '#07090E' },
    focus:    '#4FD1C5',
    status:   { positive: '#4FD1A3', caution: '#E0B94A', negative: '#F87171', info: '#7FB1FF', neutral: '#8FA0B3' },
    gapScale: ['#0A0D14', '#1A3230', '#2E6862', '#4FD1C5'],
  },
  'luxury-gold': {
    id: 'luxury-gold',
    label: 'Luxury Gold',
    mode: 'dark',
    scenario: 'Gala-level external decks, Ministry / Royal hand-offs. Not for analytical work.',
    surface:  { canvas: '#13100A', card: '#1A160E', inset: '#0F0C07' },
    border:   { subtle: '#2A2316', strong: '#6B5A34' },
    text:     { primary: '#F1EAD3', secondary: '#B8A878', tertiary: '#7A6E48' },
    accent:   { base: '#E6C97A', ink: '#13100A' },
    focus:    '#E6C97A',
    status:   { positive: '#B8A878', caution: '#E6C97A', negative: '#D47B5C', info: '#B8A878', neutral: '#7A6E48' },
    gapScale: ['#0F0C07', '#2A2316', '#6B5A34', '#E6C97A'],
  },
}

export const DEFAULT_THEME: ThemeId = 'dct-executive'

/** Convert #RRGGBB to the "r g b" triplet format used by our CSS vars. */
export function hexToRgbTriplet(hex: string): string {
  const h = hex.replace('#', '')
  const n = parseInt(h, 16)
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`
}
