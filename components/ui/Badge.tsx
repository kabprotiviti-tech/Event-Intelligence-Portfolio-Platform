import type { Category } from '@/types'

/**
 * Outline-only badges — never filled. Color discipline:
 *   Category  → text color only, no background
 *   Confidence → border + matching text color
 * One visual language, works on any theme.
 */

interface BadgeProps {
  children: React.ReactNode
  className?: string
}

function Pill({ children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 h-5 rounded-sm border text-meta font-medium ${className}`}>
      {children}
    </span>
  )
}

export function CategoryBadge({ category }: { category: Category }) {
  // All categories render with the same neutral chrome — differentiation comes from icons elsewhere,
  // not from arbitrary color mapping. Discipline over decoration.
  return (
    <Pill className="border-subtle text-fg-secondary">
      {category}
    </Pill>
  )
}

export function ConfidenceBadge({ level }: { level: 'High' | 'Medium' | 'Low' }) {
  const cls =
    level === 'High'   ? 'border-positive/40 text-positive'
    : level === 'Medium' ? 'border-caution/40 text-caution'
    :                     'border-negative/40 text-negative'
  return <Pill className={cls}>{level}</Pill>
}

export function TierBadge({ tier }: { tier: 'Tier 1' | 'Tier 2' | 'Tier 3' }) {
  return <Pill className="border-subtle text-fg-tertiary font-mono">{tier}</Pill>
}
