import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Sidebar } from "../components/Sidebar"
import { TopBar } from "../components/TopBar"

export function AppLayout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[#f4f8fb] text-[#0f2744] transition-colors duration-200 dark:bg-[#090e1a] dark:text-slate-100">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-72">
        <TopBar path={location.pathname} onMenu={() => setOpen(true)} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
