import clsx from 'clsx'

interface Props {
  label: string
  value: string | number
  sub?: string
  trend?: { direction: 'up' | 'down' | 'flat', value: string }
  accent?: boolean
  icon?: React.ReactNode
}

export function StatCard({ label, value, sub, trend, accent, icon }: Props) {
  return (
    <div className={clsx(
      'relative rounded-xl border bg-white p-5 overflow-hidden transition-all hover:shadow-sm',
      accent ? 'border-slate-200' : 'border-slate-200'
    )}>
      {accent && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#c9a84c] via-[#e0c978] to-transparent" />
      )}
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-[0.12em]">{label}</p>
        {icon && <div className="text-slate-300">{icon}</div>}
      </div>
      <p className={clsx(
        'text-[28px] font-bold leading-none tracking-tight',
        accent ? 'text-[#0a1a33]' : 'text-slate-900'
      )}>
        {value}
      </p>
      <div className="flex items-center gap-2 mt-2.5">
        {sub && <p className="text-xs text-slate-500">{sub}</p>}
        {trend && (
          <span className={clsx(
            'inline-flex items-center gap-0.5 text-[11px] font-medium',
            trend.direction === 'up' ? 'text-emerald-600' : trend.direction === 'down' ? 'text-red-500' : 'text-slate-500'
          )}>
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.value}
          </span>
        )}
      </div>
    </div>
  )
}
