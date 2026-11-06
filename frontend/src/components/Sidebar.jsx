import { NavLink } from "react-router-dom"
import {
  Activity,
  BarChart3,
  HeartPulse,
  LayoutDashboard,
  Settings,
  Sparkles,
  UserPlus,
  Users,
  X,
  Stethoscope,
} from "lucide-react"

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/patients", label: "Patient Management", icon: Users, end: true },
  { to: "/patients/new", label: "Add Patient", icon: UserPlus, end: false },
  { to: "/analytics", label: "Health Analytics", icon: BarChart3, end: false },
  { to: "/analysis", label: "AI Health Analysis", icon: Sparkles, end: false },
  { to: "/settings", label: "Settings", icon: Settings, end: false },
]

export function Sidebar({ open, onClose }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-xs transition lg:hidden ${
          open ? "block" : "hidden"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-sky-100 bg-white transition-all dark:border-slate-800 dark:bg-[#111827] lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-sky-100/60 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-md shadow-sky-600/20 dark:bg-sky-500">
              <HeartPulse className="size-6 stroke-[2.5]" />
            </div>
            <div>
              <p className="font-display text-xl leading-6 font-extrabold text-[#0f2744] dark:text-white">
                MediPredict
              </p>
              <p className="text-[11px] font-bold tracking-wider text-sky-700 uppercase dark:text-sky-400">
                Clinical Health AI
              </p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-5">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 rounded-xl px-4 py-3 text-base font-bold transition ${
                    isActive
                      ? "bg-sky-600 text-white shadow-sm shadow-sky-600/20 dark:bg-sky-500 dark:text-white"
                      : "text-slate-600 hover:bg-sky-50 hover:text-sky-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white"
                  }`
                }
              >
                <Icon className="size-5 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="m-4 rounded-2xl border border-sky-100 bg-sky-50/80 p-4 text-sm text-sky-950 dark:border-slate-800 dark:bg-slate-800/50 dark:text-sky-200">
          <div className="mb-1.5 flex items-center gap-2 font-bold text-sky-900 dark:text-sky-300">
            <Stethoscope className="size-4" />
            <span>Clinical Notice</span>
          </div>
          <p className="text-xs leading-relaxed text-sky-800/85 dark:text-slate-400">
            Automated health remarks provide preliminary observational screening and should be clinically verified alongside individual patient history.
          </p>
        </div>
      </aside>
    </>
  )
}
