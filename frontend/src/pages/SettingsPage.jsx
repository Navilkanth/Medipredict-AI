import { useEffect, useState } from "react"
import { ErrorState, LoadingState, PageCard } from "../components/ui"
import { ApiError, getHealthStatus } from "../services/api"

export function SettingsPage() {
  const [status, setStatus] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    getHealthStatus()
      .then((result) => setStatus(result.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Status could not be loaded."))
  }, [])

  if (error) return <ErrorState message={error} />
  if (!status) return <LoadingState label="Checking backend and Gemini configuration..." />

  const rows = [
    ["Backend", status.backend],
    ["Database", status.database],
    ["Database engine", status.database_engine],
    ["Gemini configured", status.gemini_configured ? "Yes" : "No — add GEMINI_API_KEY to backend/.env"],
    ["Gemini model", status.gemini_model],
  ]

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <PageCard title="Service status" subtitle="The browser never receives the Gemini API key.">
        <dl className="divide-y divide-sky-50">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-3 text-sm">
              <dt className="font-semibold text-slate-500">{label}</dt>
              <dd className="font-bold text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </PageCard>
      <PageCard title="Configuration" subtitle="Edit backend/.env, then restart Flask.">
        <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
          <li>GEMINI_API_KEY is read only by services/gemini_service.py.</li>
          <li>GEMINI_MODEL defaults to gemini-2.5-flash.</li>
          <li>The SQLite file is backend/database/medipredict.db and remains after a restart.</li>
          <li>Failed Gemini calls leave remarks empty so the user can retry. The app does not invent a remark.</li>
        </ul>
      </PageCard>
    </div>
  )
}
