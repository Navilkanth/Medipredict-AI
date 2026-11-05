import { NavLink } from "react-router-dom"
import {
  Activity,
  BarChart3,
  ClipboardCheck,
  HeartPulse,
  LayoutDashboard,
  Settings,
  Sparkles,
  UserPlus,
  Users,
  X,
} from "lucide-react"

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/patients", label: "Patient Management", icon: Users, end: true },
  { to: "/patients/new", label: "Add Patient", icon: UserPlus, end: false },
  { to: "/analytics", label: "Health Analytics", icon: BarChart3, end: false },
  { to: "/analysis", label: "AI Health Analysis", icon: Sparkles, end: false },
  { to: "/settings", label: "Settings", icon: Settings, end: false },
  { to: "/test-data", label: "Test Data", icon: ClipboardCheck, end: false },
]

export function Sidebar({ open, onClose }) {
  return (
    <>
      <div className={`fixed inset-0 z-30 bg-slate-900/40 transition lg:hidden ${open ? "block" : "hidden"}`} onClick={onClose} />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-sky-100 bg-white transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-sm">
              <HeartPulse className="size-6" />
            </div>
            <div>
              <p className="font-display text-lg leading-5 font-extrabold text-ink">MediPredict AI</p>
              <p className="text-xs font-semibold tracking-wide text-sky-700 uppercase">Patient health</p>
            </div>
          </div>
          <button type="button" className="rounded-lg p-2 text-slate-500 lg:hidden" onClick={onClose} aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    isActive ? "bg-sky-50 text-sky-800" : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <Icon className="size-4" />
                {link.label}
              </NavLink>
            )
          })}
        </nav>
        <div className="m-3 rounded-2xl bg-sky-50 p-4 text-sm text-sky-900">
          <div className="mb-2 flex items-center gap-2 font-bold">
            <Activity className="size-4" />
            Clinical note
          </div>
          <p className="leading-5 text-sky-800/80">
            AI remarks are preliminary. They are not a diagnosis and depend on units, age, sex, and the laboratory range.
          </p>
        </div>
      </aside>
    </>
  )
}
