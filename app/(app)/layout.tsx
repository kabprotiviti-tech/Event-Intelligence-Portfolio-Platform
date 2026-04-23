import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { FilterProvider } from '@/context/FilterContext'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <FilterProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </FilterProvider>
  )
}
