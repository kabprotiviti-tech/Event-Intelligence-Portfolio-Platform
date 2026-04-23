/**
 * Monoline icon set — single style, single stroke width.
 * No emoji, no decorative glyphs anywhere in the UI chrome.
 * All icons are 16×16 viewBox with currentColor, size via the `size` prop.
 */

import { SVGProps } from 'react'

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

function base(props: IconProps) {
  const { size = 16, className = '', ...rest } = props
  return {
    width: size,
    height: size,
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
    className,
    ...rest,
  }
}

export const DashboardIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2" y="2" width="5" height="6" rx="1" />
    <rect x="9" y="2" width="5" height="4" rx="1" />
    <rect x="9" y="8" width="5" height="6" rx="1" />
    <rect x="2" y="10" width="5" height="4" rx="1" />
  </svg>
)

export const GapIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="8" cy="8" r="6" />
    <path d="M8 2v12M2 8h12" strokeDasharray="1.5 1.5" />
  </svg>
)

export const ConceptIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M8 1.5l1.8 4.1 4.2.6-3.1 2.9.8 4.2L8 11.3 4.3 13.3l.8-4.2L2 6.2l4.2-.6z" />
  </svg>
)

export const PortfolioIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" />
    <path d="M1.5 6.5h13M5 10h3" />
  </svg>
)

export const FamilyIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="5" cy="5" r="2" />
    <circle cx="11" cy="5" r="2" />
    <path d="M2 13c0-2 1.5-3.5 3-3.5S8 11 8 13M8 13c0-2 1.5-3.5 3-3.5S14 11 14 13" />
  </svg>
)

export const EntertainmentIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 12V3l7-1v9" />
    <circle cx="5" cy="12" r="1.5" />
    <circle cx="12" cy="11" r="1.5" />
  </svg>
)

export const SportsIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="8" cy="8" r="6" />
    <path d="M8 2v12M2 8h12" />
  </svg>
)

export const AllIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="8" cy="8" r="6" />
    <circle cx="8" cy="8" r="2" fill="currentColor" />
  </svg>
)

export const CheckIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 8.5l3 3 7-7" />
  </svg>
)

export const ArrowRightIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
)

export const SettingsIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="8" cy="8" r="2" />
    <path d="M8 1v2M8 13v2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M1 8h2M13 8h2M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4" />
  </svg>
)

export const PulseIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M1 8h3l2-5 4 10 2-5h3" />
  </svg>
)

export const StrategyIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2 14V6l6-4 6 4v8" />
    <path d="M2 14h12M6 14V9h4v5" />
  </svg>
)

export const TrendUpIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2 11l4-4 3 3 5-6" />
    <path d="M11 4h3v3" />
  </svg>
)

export const TrendDownIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2 5l4 4 3-3 5 6" />
    <path d="M11 12h3V9" />
  </svg>
)

export const TrendFlatIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2 8h12" />
    <path d="M11 5l3 3-3 3" />
  </svg>
)

export const MenuIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2 4h12M2 8h12M2 12h12" />
  </svg>
)

export const CloseIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 3l10 10M13 3L3 13" />
  </svg>
)
