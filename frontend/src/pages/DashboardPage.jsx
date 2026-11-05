import { useEffect, useState } from "react"
import { Activity, Droplets, Sparkles, Users } from "lucide-react"
import { Link } from "react-router-dom"
import { DistributionChart } from "../components/DistributionChart"
import { ErrorState, LoadingState, PageCard, StatCard, StatusBadge } from "../components/ui"
import { ApiError, getDashboard } from "../services/api"
import { formatLab, formatWhen } from "../utils/format"

export function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    getDashboard()
      .then((result) => {
        if (active) setStats(result.data)
      })
      .catch((err) => {
        if (active) setError(err instanceof ApiError ? err.message : "Dashboard data could not be loaded.")
      })
    return () => {
      active = false
    }
  }, [])

  if (error) return <ErrorState message={error} />
  if (!stats) return <LoadingState label="Calculating dashboard totals from SQLite..." />

  const registration = stats.registration_by_day.map((row) => ({
    label: row.date.slice(5),
    count: row.count,
  }))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total patients" value={stats.total_patients} hint="Rows currently stored in SQLite." icon={<Users className="size-5" />} />
        <StatCard label="Valid patient records" value={stats.valid_records} hint="Only records that passed validation are stored." icon={<Activity className="size-5" />} />
        <StatCard label="Pending AI analysis" value={stats.pending_ai} hint="Saved patients without a completed Gemini remark." icon={<Sparkles className="size-5" />} />
        <StatCard
          label="High glucose observations"
          value={stats.high_glucose}
          hint={`Glucose at or above ${stats.high_glucose_threshold} mg/dL.`}
          icon={<Droplets className="size-5" />}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <DistributionChart title="Glucose distribution" subtitle="Stored patients grouped by common adult bands." data={stats.blood_tests.glucose_distribution} color="#0284c7" />
        <DistributionChart title="Cholesterol distribution" subtitle="Stored patients grouped by common adult bands." data={stats.blood_tests.cholesterol_distribution} color="#0369a1" />
        <DistributionChart title="Registrations" subtitle="Patients created, grouped by day." data={registration} color="#0ea5e9" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PageCard title="Blood test averages" subtitle="Calculated from every stored record.">
          <div className="grid gap-3 sm:grid-cols-3">
            <Average label="Glucose" value={stats.blood_tests.average_glucose} unit="mg/dL" />
            <Average label="Haemoglobin" value={stats.blood_tests.average_haemoglobin} unit="g/dL" />
            <Average label="Cholesterol" value={stats.blood_tests.average_cholesterol} unit="mg/dL" />
          </div>
        </PageCard>
        <PageCard title="Recent AI remarks" subtitle="Latest completed Gemini observations." action={<Link className="text-sm font-bold text-sky-700" to="/analysis">Open analysis</Link>}>
          {stats.recent_remarks.length === 0 ? (
            <p className="text-sm text-slate-500">No completed remarks yet. Add a patient or retry analysis.</p>
          ) : (
            <ul className="space-y-3">
              {stats.recent_remarks.map((item) => (
                <li key={item.id} className="rounded-xl bg-sky-50/70 px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-ink">{item.full_name}</p>
                    <span className="text-xs text-slate-500">{formatWhen(item.updated_at)}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.remarks}</p>
                </li>
              ))}
            </ul>
          )}
        </PageCard>
      </div>

      <PageCard title="Recent patient records" subtitle="Newest stored rows." action={<Link className="text-sm font-bold text-sky-700" to="/patients">Manage patients</Link>}>
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="text-xs tracking-wide text-sky-900 uppercase">
              <tr>
                {["Name", "Email", "Glucose", "Haemoglobin", "Cholesterol", "AI"].map((heading) => (
                  <th key={heading} className="px-2 py-2 font-bold">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recent_patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-2 py-6 text-slate-500">No patients stored yet.</td>
                </tr>
              ) : (
                stats.recent_patients.map((patient) => (
                  <tr key={patient.id} className="border-t border-sky-50">
                    <td className="px-2 py-2 font-semibold">{patient.full_name}</td>
                    <td className="px-2 py-2">{patient.email}</td>
                    <td className="px-2 py-2">{formatLab(patient.glucose)}</td>
                    <td className="px-2 py-2">{formatLab(patient.haemoglobin)}</td>
                    <td className="px-2 py-2">{formatLab(patient.cholesterol)}</td>
                    <td className="px-2 py-2"><StatusBadge status={patient.analysis_status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </PageCard>
    </div>
  )
}

function Average({ label, value, unit }) {
  return (
    <div className="rounded-xl bg-sky-50 px-3 py-3">
      <p className="text-xs font-bold tracking-wide text-sky-800 uppercase">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{value ?? "—"}</p>
      <p className="text-xs text-slate-500">{unit}</p>
    </div>
  )
}
