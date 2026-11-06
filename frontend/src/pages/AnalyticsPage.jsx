import { useEffect, useState } from "react"
import { BarChart3, Activity, Info } from "lucide-react"
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
  if (!stats) return <LoadingState label="Synthesizing population biomarker statistics..." />

  return (
    <div className="space-y-6">
      <PageCard
        title="Biomarker Stratification & Clinical Metrics"
        subtitle="Population distribution evaluated across standard adult diagnostic laboratory reference intervals."
      >
        <div className="flex items-start gap-3 rounded-2xl bg-sky-50/70 p-4 dark:bg-slate-800/60">
          <Info className="size-5 shrink-0 text-sky-600 dark:text-sky-400 mt-0.5" />
          <div className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
            <p>
              Current population physiological means: Fasting Glucose:{" "}
              <strong className="text-[#0f2744] dark:text-white">
                {stats.blood_tests.average_glucose ? `${stats.blood_tests.average_glucose} mg/dL` : "—"}
              </strong>
              , Haemoglobin:{" "}
              <strong className="text-[#0f2744] dark:text-white">
                {stats.blood_tests.average_haemoglobin ? `${stats.blood_tests.average_haemoglobin} g/dL` : "—"}
              </strong>
              , and Total Cholesterol:{" "}
              <strong className="text-[#0f2744] dark:text-white">
                {stats.blood_tests.average_cholesterol ? `${stats.blood_tests.average_cholesterol} mg/dL` : "—"}
              </strong>
              .
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              High glucose surveillance flagging is calibrated at ≥ {stats.high_glucose_threshold} mg/dL ({stats.high_glucose} active patient profile{stats.high_glucose === 1 ? "" : "s"} currently flagged).
            </p>
          </div>
        </div>
      </PageCard>

      <div className="grid gap-5 xl:grid-cols-3">
        <DistributionChart
          title="Fasting Blood Glucose"
          subtitle="Adult reference intervals (mg/dL)"
          data={stats.blood_tests.glucose_distribution}
          color="#0284c7"
        />
        <DistributionChart
          title="Total Haemoglobin"
          subtitle="Adult physiological ranges (g/dL)"
          data={stats.blood_tests.haemoglobin_distribution}
          color="#0369a1"
        />
        <DistributionChart
          title="Total Serum Cholesterol"
          subtitle="Cardiovascular risk categories (mg/dL)"
          data={stats.blood_tests.cholesterol_distribution}
          color="#0f766e"
        />
      </div>
    </div>
  )
}
