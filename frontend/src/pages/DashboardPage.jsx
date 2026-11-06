import { useEffect, useState } from "react"
import { Activity, Droplets, Sparkles, Users, ArrowUpRight } from "lucide-react"
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
  if (!stats) return <LoadingState label="Synchronizing clinical health records..." />

  const registration = stats.registration_by_day.map((row) => ({
    label: row.date.slice(5),
    count: row.count,
  }))

  return (
    <div className="space-y-6">
      {/* 4 Summary Cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Patients"
          value={stats.total_patients}
          hint="Active registered patients"
          icon={<Users className="size-6" />}
        />
        <StatCard
          label="Verified Lab Records"
          value={stats.valid_records}
          hint="Fully validated clinical profiles"
          icon={<Activity className="size-6" />}
        />
        <StatCard
          label="Pending Analysis"
          value={stats.pending_ai}
          hint="Awaiting clinical review"
          icon={<Sparkles className="size-6" />}
        />
        <StatCard
          label="High Glucose Alerts"
          value={stats.high_glucose}
          hint={`Threshold: ≥ ${stats.high_glucose_threshold} mg/dL`}
          icon={<Droplets className="size-6 text-rose-500" />}
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid gap-5 xl:grid-cols-3">
        <DistributionChart
          title="Glucose Distribution"
          subtitle="Adult fasting glucose categories"
          data={stats.blood_tests.glucose_distribution}
          color="#0284c7"
        />
        <DistributionChart
          title="Cholesterol Distribution"
          subtitle="Cardiovascular risk categories"
          data={stats.blood_tests.cholesterol_distribution}
          color="#0369a1"
        />
        <DistributionChart
          title="Patient Registrations"
          subtitle="Clinical registrations over time"
          data={registration}
          color="#0ea5e9"
        />
      </div>

      {/* Averages & Recent Remarks */}
      <div className="grid gap-5 lg:grid-cols-2">
        <PageCard
          title="Blood Biomarker Averages"
          subtitle="Mean physiological values across current population."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Average label="Avg Glucose" value={stats.blood_tests.average_glucose} unit="mg/dL" />
            <Average label="Avg Haemoglobin" value={stats.blood_tests.average_haemoglobin} unit="g/dL" />
            <Average label="Avg Cholesterol" value={stats.blood_tests.average_cholesterol} unit="mg/dL" />
          </div>
        </PageCard>

        <PageCard
          title="Recent Clinical Health Remarks"
          subtitle="Latest automated biomarker observations."
          action={
            <Link
              className="inline-flex items-center gap-1 text-sm font-bold text-sky-700 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300"
              to="/analysis"
            >
              Full Analysis <ArrowUpRight className="size-4" />
            </Link>
          }
        >
          {stats.recent_remarks.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No clinical remarks recorded yet. Register patients to generate analysis.
            </p>
          ) : (
            <ul className="space-y-3">
              {stats.recent_remarks.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-sky-100/70 bg-sky-50/60 p-3.5 transition hover:bg-sky-50 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800/70"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-[#0f2744] dark:text-white">{item.full_name}</p>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                      {formatWhen(item.updated_at)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{item.remarks}</p>
                </li>
              ))}
            </ul>
          )}
        </PageCard>
      </div>

      {/* Recent Patients Table */}
      <PageCard
        title="Recent Patient Records"
        subtitle="Newly registered clinical profiles."
        action={
          <Link
            className="inline-flex items-center gap-1 text-sm font-bold text-sky-700 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300"
            to="/patients"
          >
            All Patients <ArrowUpRight className="size-4" />
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="bg-sky-50/70 text-xs font-bold tracking-wider text-sky-950 uppercase dark:bg-slate-800/70 dark:text-sky-300">
              <tr>
                {["Patient Name", "Email", "Glucose", "Haemoglobin", "Cholesterol", "Status"].map((heading) => (
                  <th key={heading} className="px-3.5 py-3 font-bold">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-50 dark:divide-slate-800/60">
              {stats.recent_patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3.5 py-6 text-slate-500 dark:text-slate-400">
                    No patient records currently stored.
                  </td>
                </tr>
              ) : (
                stats.recent_patients.map((patient) => (
                  <tr key={patient.id} className="transition hover:bg-sky-50/30 dark:hover:bg-slate-800/30">
                    <td className="px-3.5 py-3 font-bold text-[#0f2744] dark:text-white">{patient.full_name}</td>
                    <td className="px-3.5 py-3 font-medium text-slate-600 dark:text-slate-300">{patient.email}</td>
                    <td className="px-3.5 py-3 font-semibold text-sky-900 dark:text-sky-200">{formatLab(patient.glucose)} mg/dL</td>
                    <td className="px-3.5 py-3 font-semibold text-sky-900 dark:text-sky-200">{formatLab(patient.haemoglobin)} g/dL</td>
                    <td className="px-3.5 py-3 font-semibold text-sky-900 dark:text-sky-200">{formatLab(patient.cholesterol)} mg/dL</td>
                    <td className="px-3.5 py-3"><StatusBadge status={patient.analysis_status} /></td>
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
    <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 transition dark:border-slate-800 dark:bg-slate-800/50">
      <p className="text-xs font-bold tracking-wider text-sky-800 uppercase dark:text-sky-300">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-[#0f2744] dark:text-white">{value ?? "—"}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{unit}</p>
    </div>
  )
}
