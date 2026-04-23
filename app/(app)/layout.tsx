import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { FilterProvider } from '@/context/FilterContext'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <FilterProvider>
      <div className="flex h-screen overflow-hidden bg-surface-canvas text-fg-primary">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar />
          <main role="main" className="flex-1 overflow-y-auto px-6 lg:px-8 py-6">
            {children}
          </main>
        </div>
      </div>
    </FilterProvider>
  )
}
