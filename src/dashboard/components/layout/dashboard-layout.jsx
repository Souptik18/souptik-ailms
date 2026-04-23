import { Outlet } from 'react-router-dom'
import { SidebarNav } from './sidebar-nav'
import { TopNavbar } from './top-navbar'

function DashboardLayout({ onLogout }) {
  return (
    <div className="min-h-screen bg-background px-4 py-4 lg:px-5">
      <div className="mx-auto flex max-w-[1640px] gap-4">
        <SidebarNav />
        <main className="min-w-0 flex-1">
          <TopNavbar onLogout={onLogout} />
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export { DashboardLayout }
