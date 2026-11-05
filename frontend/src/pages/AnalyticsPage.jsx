import { useEffect, useState } from "react"
import { DistributionChart } from "../components/DistributionChart"
import { ErrorState, LoadingState, PageCard } from "../components/ui"
import { ApiError, getDashboard } from "../services/api"

export function AnalyticsPage() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    getDashboard()
      .then((result) => setStats(result.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Analytics could not be loaded."))
  }, [])

  if (error) return <ErrorState message={error} />
  if (!stats) return <LoadingState label="Loading blood test analytics..." />

  return (
    <div className="space-y-4">
      <PageCard title="How these charts are built" subtitle="Bands come from the patients table. Empty charts mean the database has no saved rows.">
        <p className="text-sm leading-6 text-slate-600">
          Glucose, haemoglobin, and cholesterol averages are {stats.blood_tests.average_glucose ?? "—"}, {stats.blood_tests.average_haemoglobin ?? "—"}, and {stats.blood_tests.average_cholesterol ?? "—"}.
          High glucose count uses the threshold {stats.high_glucose_threshold} mg/dL and currently includes {stats.high_glucose} patient{stats.high_glucose === 1 ? "" : "s"}.
        </p>
      </PageCard>
      <div className="grid gap-4 xl:grid-cols-3">
        <DistributionChart title="Glucose" subtitle="Common adult fasting-style bands, in mg/dL." data={stats.blood_tests.glucose_distribution} color="#0284c7" />
        <DistributionChart title="Haemoglobin" subtitle="Common adult bands, in g/dL." data={stats.blood_tests.haemoglobin_distribution} color="#0369a1" />
        <DistributionChart title="Cholesterol" subtitle="Common adult bands, in mg/dL." data={stats.blood_tests.cholesterol_distribution} color="#0f766e" />
      </div>
    </div>
  )
}
