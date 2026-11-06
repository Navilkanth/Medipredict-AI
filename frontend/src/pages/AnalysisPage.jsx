import { useEffect, useState } from "react"
import { Activity, AlertCircle, CheckCircle2, FlaskConical, RefreshCw, Sparkles, User, Stethoscope } from "lucide-react"
import { PatientDetail } from "../components/PatientDetail"
import { ErrorState, LoadingState, PageCard, StatusBadge } from "../components/ui"
import { useToast } from "../context/ToastContext"
import { analyzeHealth, ApiError, getPatients, reanalyzePatient } from "../services/api"

export function AnalysisPage() {
  const { notify } = useToast()
  const [activeTab, setActiveTab] = useState("records") // 'records' | 'simulator'
  const [patients, setPatients] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  // Simulator state
  const [simValues, setSimValues] = useState({ glucose: "125", haemoglobin: "14.2", cholesterol: "215" })
  const [simErrors, setSimErrors] = useState({})
  const [simBusy, setSimBusy] = useState(false)
  const [simResult, setSimResult] = useState(null)

  async function load() {
    const response = await getPatients({ page: 1, perPage: 50 })
    setPatients(response.data.items)
    setSelectedId((current) => current ?? response.data.items[0]?.id ?? null)
  }

  useEffect(() => {
    load()
      .catch((err) => setError(err instanceof ApiError ? err.message : "Analysis list could not be loaded."))
      .finally(() => setLoading(false))
  }, [])

  const selected = patients.find((patient) => patient.id === selectedId) ?? null

  async function retry() {
    if (!selected) return
    setBusy(true)
    try {
      const response = await reanalyzePatient(selected.id)
      notify("success", response.message || "Clinical remarks updated.")
      await load()
    } catch (err) {
      notify("error", err instanceof ApiError ? err.message : "Clinical analysis could not be refreshed.")
      await load()
    } finally {
      setBusy(false)
    }
  }

  async function handleSimulate(event) {
    event.preventDefault()
    const nextErrors = {}
    const g = Number(simValues.glucose)
    const h = Number(simValues.haemoglobin)
    const c = Number(simValues.cholesterol)

    if (isNaN(g) || g < 0) nextErrors.glucose = "Enter a valid positive number"
    if (isNaN(h) || h < 0) nextErrors.haemoglobin = "Enter a valid positive number"
    if (isNaN(c) || c < 0) nextErrors.cholesterol = "Enter a valid positive number"

    setSimErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSimBusy(true)
    try {
      const response = await analyzeHealth({
        glucose: g,
        haemoglobin: h,
        cholesterol: c,
      })
      setSimResult(response.data)
      notify("success", "Clinical observations generated successfully.")
    } catch (err) {
      notify("error", err instanceof ApiError ? err.message : "Analysis request could not be completed.")
    } finally {
      setSimBusy(false)
    }
  }

  if (error) return <ErrorState message={error} />
  if (loading) return <LoadingState label="Loading clinical health analyses..." />

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-sky-100 bg-white p-2 rounded-2xl shadow-sm ring-1 ring-sky-100 transition-colors dark:border-slate-800 dark:bg-[#111827] dark:ring-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab("records")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            activeTab === "records"
              ? "bg-sky-600 text-white shadow-sm dark:bg-sky-500"
              : "text-slate-600 hover:bg-sky-50 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          <User className="size-4" />
          Patient Registry Analysis
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("simulator")}
          className={`ml-2 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            activeTab === "simulator"
              ? "bg-sky-600 text-white shadow-sm dark:bg-sky-500"
              : "text-slate-600 hover:bg-sky-50 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          <FlaskConical className="size-4" />
          Interactive Lab Test Evaluator
        </button>
      </div>

      {activeTab === "records" ? (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <PageCard title="Patients" subtitle="Select a patient to inspect observations.">
            {patients.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No patients registered yet.</p>
            ) : (
              <ul className="space-y-2">
                {patients.map((patient) => (
                  <li key={patient.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(patient.id)}
                      className={`w-full rounded-2xl p-3 text-left transition ${
                        patient.id === selectedId
                          ? "bg-sky-600 text-white shadow-sm dark:bg-sky-500"
                          : "bg-sky-50/70 text-[#0f2744] hover:bg-sky-100 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className="block text-base font-bold">{patient.full_name}</span>
                      <div className="mt-1 flex items-center justify-between">
                        <span
                          className={`text-xs ${
                            patient.id === selectedId
                              ? "text-sky-100"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          Record #{patient.id}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            patient.analysis_status === "completed"
                              ? patient.id === selectedId
                                ? "bg-sky-700 text-white"
                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : patient.id === selectedId
                              ? "bg-sky-700 text-white"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {patient.analysis_status === "completed" ? "Analyzed" : "Pending"}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </PageCard>

          <PageCard
            title={selected ? selected.full_name : "Clinical Assessment Details"}
            subtitle="Parameter observations, physiological implications, and clinical recommendations."
            action={
              selected ? (
                <button
                  type="button"
                  onClick={retry}
                  disabled={busy}
                  className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 disabled:opacity-60 dark:bg-sky-500 dark:hover:bg-sky-600"
                >
                  <RefreshCw className={`size-4 ${busy ? "animate-spin" : ""}`} />
                  {busy ? "Analyzing..." : "Re-evaluate Biomarkers"}
                </button>
              ) : null
            }
          >
            {selected ? (
              <div className="space-y-4">
                <StatusBadge status={selected.analysis_status} />
                <PatientDetail patient={selected} />
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Choose a patient from the list to inspect their clinical breakdown.
              </p>
            )}
          </PageCard>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <PageCard
            title="Biomarker Evaluator"
            subtitle="Input laboratory values to simulate instant clinical health observations."
          >
            <form onSubmit={handleSimulate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-sky-950 dark:text-sky-300">
                  Fasting Glucose (mg/dL)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={simValues.glucose}
                  onChange={(e) => setSimValues({ ...simValues, glucose: e.target.value })}
                  placeholder="e.g. 100"
                  className="mt-1.5 w-full rounded-xl border border-sky-100 bg-white px-3.5 py-2.5 text-base font-bold outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-[#111827] dark:text-white"
                />
                {simErrors.glucose && (
                  <p className="mt-1 text-xs text-rose-600">{simErrors.glucose}</p>
                )}
                <p className="mt-1 text-xs text-slate-400">Standard fasting range: 70–99 mg/dL</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-sky-950 dark:text-sky-300">
                  Haemoglobin (g/dL)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={simValues.haemoglobin}
                  onChange={(e) => setSimValues({ ...simValues, haemoglobin: e.target.value })}
                  placeholder="e.g. 14.5"
                  className="mt-1.5 w-full rounded-xl border border-sky-100 bg-white px-3.5 py-2.5 text-base font-bold outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-[#111827] dark:text-white"
                />
                {simErrors.haemoglobin && (
                  <p className="mt-1 text-xs text-rose-600">{simErrors.haemoglobin}</p>
                )}
                <p className="mt-1 text-xs text-slate-400">Standard range: 12.0–17.5 g/dL</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-sky-950 dark:text-sky-300">
                  Total Cholesterol (mg/dL)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={simValues.cholesterol}
                  onChange={(e) => setSimValues({ ...simValues, cholesterol: e.target.value })}
                  placeholder="e.g. 185"
                  className="mt-1.5 w-full rounded-xl border border-sky-100 bg-white px-3.5 py-2.5 text-base font-bold outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-[#111827] dark:text-white"
                />
                {simErrors.cholesterol && (
                  <p className="mt-1 text-xs text-rose-600">{simErrors.cholesterol}</p>
                )}
                <p className="mt-1 text-xs text-slate-400">Desirable range: &lt; 200 mg/dL</p>
              </div>

              <button
                type="submit"
                disabled={simBusy}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-base font-bold text-white shadow-md shadow-sky-600/20 transition hover:bg-sky-700 disabled:opacity-60 dark:bg-sky-500 dark:hover:bg-sky-600"
              >
                <Stethoscope className="size-4" />
                {simBusy ? "Evaluating Biomarkers..." : "Run Clinical Health Analysis"}
              </button>
            </form>
          </PageCard>

          <PageCard
            title="Biomarker Clinical Analysis"
            subtitle="Automated physiological evaluation and structured observations."
          >
            {simResult ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                    <p className="text-xs font-bold text-sky-800 uppercase dark:text-sky-300">Glucose Observation</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      {simResult.glucose_observation}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                    <p className="text-xs font-bold text-sky-800 uppercase dark:text-sky-300">Haemoglobin Observation</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      {simResult.haemoglobin_observation}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                    <p className="text-xs font-bold text-sky-800 uppercase dark:text-sky-300">Cholesterol Observation</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      {simResult.cholesterol_observation}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-800/60">
                  <div className="flex items-center gap-2 font-bold text-[#0f2744] dark:text-white">
                    <Activity className="size-4 text-sky-600 dark:text-sky-400" />
                    Overall Health Remarks
                  </div>
                  <p className="mt-2 text-base leading-relaxed text-slate-700 dark:text-slate-300">
                    {simResult.overall_remarks}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                  <div className="flex items-center gap-2 font-bold text-emerald-950 dark:text-emerald-200">
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                    Clinical Recommendations
                  </div>
                  <p className="mt-2 text-base leading-relaxed text-emerald-900 dark:text-emerald-300">
                    {simResult.recommendations}
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-2.5 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                  <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5 dark:text-amber-400" />
                  <span>
                    <strong>Clinical Notice:</strong> Observations are preliminary screening insights and do not constitute a definitive medical diagnosis. Units were assumed based on standard laboratory metrics. Consult a registered physician for clinical evaluation.
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <Sparkles className="size-10 text-sky-300 stroke-1 mb-2 dark:text-sky-500" />
                <p className="font-semibold text-slate-600 dark:text-slate-300">No biomarker test executed yet</p>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Adjust the blood test parameters on the left and click "Run Clinical Health Analysis" to generate real-time observational screening.
                </p>
              </div>
            )}
          </PageCard>
        </div>
      )}
    </div>
  )
}
