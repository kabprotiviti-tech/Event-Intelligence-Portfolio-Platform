import type { Config } from 'tailwindcss'

/**
 * All colors resolve against CSS variables defined in app/globals.css
 * per `[data-theme="..."]`. Switching themes re-evaluates every class
 * without a single layout shift.
 */
const withVar = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // Disable defaults that carry opinions we don't want
    // (e.g., rounded-full everywhere is still available when explicit).
    extend: {
      colors: {
        surface: {
          canvas: withVar('surface-canvas'),
          card:   withVar('surface-card'),
          inset:  withVar('surface-inset'),
        },
        border: {
          DEFAULT: withVar('border-subtle'),
          subtle:  withVar('border-subtle'),
          strong:  withVar('border-strong'),
        },
        fg: {
          DEFAULT:   withVar('text-primary'),
          primary:   withVar('text-primary'),
          secondary: withVar('text-secondary'),
          tertiary:  withVar('text-tertiary'),
        },
        accent: {
          DEFAULT: withVar('accent'),
          ink:     withVar('accent-ink'),
        },
        focus: withVar('focus-ring'),

        // Semantic status (same tokens, re-themed per mode)
        positive: withVar('status-positive'),
        caution:  withVar('status-caution'),
        negative: withVar('status-negative'),
        info:     withVar('status-info'),
        neutral:  withVar('status-neutral'),

        // Gap matrix ramp — single hue per theme
        gap: {
          empty:    withVar('gap-empty'),
          light:    withVar('gap-light'),
          moderate: withVar('gap-moderate'),
          heavy:    withVar('gap-heavy'),
        },
      },

      // 8-tier type scale — no in-between sizes
      fontSize: {
        eyebrow:  ['11px',  { lineHeight: '16px', letterSpacing: '0.08em' }],
        meta:     ['12px',  { lineHeight: '18px' }],
        'body-sm':['13px',  { lineHeight: '20px' }],
        body:     ['14px',  { lineHeight: '22px' }],
        h3:       ['16px',  { lineHeight: '24px', letterSpacing: '-0.005em' }],
        h2:       ['20px',  { lineHeight: '28px', letterSpacing: '-0.01em' }],
        h1:       ['28px',  { lineHeight: '36px', letterSpacing: '-0.015em' }],
        display:  ['40px',  { lineHeight: '48px', letterSpacing: '-0.02em' }],
      },

      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },

      // Two radii. Period.
      borderRadius: {
        sm: '4px',
        md: '8px',
      },

      // Three elevations, all near-imperceptible
      boxShadow: {
        flat:    'inset 0 0 0 1px rgb(var(--border-subtle))',
        raised:  '0 1px 2px rgb(0 0 0 / 0.04), 0 0 0 1px rgb(var(--border-subtle))',
        overlay: '0 8px 24px rgb(0 0 0 / 0.08), 0 0 0 1px rgb(var(--border-subtle))',
      },

      transitionDuration: {
        ui:     '160ms',
        layout: '240ms',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.2, 0, 0, 1)',
      },
    },
  },
  plugins: [],
}

export default config
