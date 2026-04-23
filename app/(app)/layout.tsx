import { AppShell } from '@/components/layout/AppShell'
import { FilterProvider } from '@/context/FilterContext'
import { DrillProvider } from '@/context/DrillContext'
import { DrillPanel } from '@/components/dashboard/DrillPanel'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <FilterProvider>
      <DrillProvider>
        <AppShell>{children}</AppShell>
        <DrillPanel />
      </DrillProvider>
    </FilterProvider>
  )
}
