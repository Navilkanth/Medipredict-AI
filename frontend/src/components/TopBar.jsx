import { Menu, Moon, Sun, ShieldCheck } from "lucide-react"
import { useTheme } from "../context/ThemeContext"

const titles = {
  "/": { title: "Clinical Dashboard", subtitle: "Real-time analytics and patient health monitoring" },
  "/patients": { title: "Patient Directory", subtitle: "Comprehensive medical records, search, and clinical management" },
  "/patients/new": { title: "Patient Registration", subtitle: "Register new patient demographics and laboratory blood profile" },
  "/analytics": { title: "Health Analytics", subtitle: "Population blood test distributions and biomarker insights" },
  "/analysis": { title: "Clinical Health Analysis", subtitle: "Automated biomarker evaluation and clinical observations" },
  "/settings": { title: "System Preferences", subtitle: "Customize application appearance, font scale, and clinical thresholds" },
}

export function TopBar({ path, onMenu }) {
  const { theme, toggleTheme, settings } = useTheme()
  const match = path.startsWith("/analysis") ? titles["/analysis"] : titles[path] ?? titles["/"]

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-sky-100 bg-white/95 px-4 py-4 backdrop-blur transition-colors dark:border-slate-800/80 dark:bg-[#111827]/95 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="rounded-xl p-2 text-sky-800 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-slate-800 lg:hidden"
          onClick={onMenu}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#0f2744] dark:text-white">
            {match.title}
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {match.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Facility Badge */}
        <div className="hidden items-center gap-2 rounded-xl bg-sky-50/80 px-3 py-1.5 text-xs font-semibold text-sky-900 border border-sky-100/60 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-sky-200 md:flex">
          <ShieldCheck className="size-4 text-sky-600 dark:text-sky-400" />
          <span>{settings.facilityName || "Clinical Network"}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="flex size-10 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-700 transition hover:bg-sky-100 hover:text-sky-900 dark:border-slate-700 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </button>
      </div>
    </header>
  )
}
