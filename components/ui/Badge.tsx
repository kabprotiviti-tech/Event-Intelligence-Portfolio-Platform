import clsx from 'clsx'
import type { Category } from '@/types'

const CATEGORY_COLORS: Record<Category, string> = {
  Family:        'bg-blue-50 text-blue-700',
  Entertainment: 'bg-purple-50 text-purple-700',
  Sports:        'bg-orange-50 text-orange-700',
}

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className={clsx('inline-flex px-2 py-0.5 rounded text-xs font-medium', CATEGORY_COLORS[category])}>
      {category}
    </span>
  )
}

export function ConfidenceBadge({ level }: { level: 'High' | 'Medium' | 'Low' }) {
  const colors = { High: 'bg-emerald-50 text-emerald-700', Medium: 'bg-amber-50 text-amber-700', Low: 'bg-red-50 text-red-700' }
  return (
    <span className={clsx('inline-flex px-2 py-0.5 rounded text-xs font-medium', colors[level])}>
      {level}
    </span>
  )
}
