import { Menu } from "lucide-react"

const titles = {
  "/": { title: "Dashboard", subtitle: "Live totals from the patient database" },
  "/patients": { title: "Patient Management", subtitle: "Search, review, update, and delete stored records" },
  "/patients/new": { title: "Add Patient", subtitle: "Validate details, then request a Gemini observation" },
  "/analytics": { title: "Health Analytics", subtitle: "Distribution of stored blood test values" },
  "/analysis": { title: "AI Health Analysis", subtitle: "Parameter observations returned by Gemini" },
  "/settings": { title: "Settings", subtitle: "API status, storage, and configuration" },
  "/test-data": { title: "Test Data", subtitle: "Company records, validation report, update, and delete" },
}

export function TopBar({ path, onMenu }) {
  const match = path.startsWith("/analysis") ? titles["/analysis"] : titles[path] ?? titles["/"]
  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-sky-100 bg-white/90 px-4 py-4 backdrop-blur sm:px-6">
      <button type="button" className="rounded-xl p-2 text-sky-800 hover:bg-sky-50 lg:hidden" onClick={onMenu} aria-label="Open menu">
        <Menu className="size-5" />
      </button>
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">{match.title}</h1>
        <p className="text-sm text-slate-500">{match.subtitle}</p>
      </div>
    </header>
  )
}
