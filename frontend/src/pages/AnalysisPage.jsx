import { useEffect, useState } from "react"
import { Activity, AlertCircle, CheckCircle2, FlaskConical, RefreshCw, Sparkles, User } from "lucide-react"
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
      notify("success", response.message || "AI remarks generated.")
      await load()
    } catch (err) {
      notify("error", err instanceof ApiError ? err.message : "Gemini could not complete the analysis.")
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
      notify("success", "AI observations generated successfully.")
    } catch (err) {
      notify("error", err instanceof ApiError ? err.message : "AI analysis request failed.")
    } finally {
      setSimBusy(false)
    }
  }

  if (error) return <ErrorState message={error} />
  if (loading) return <LoadingState label="Loading stored analyses..." />

  return (
    <div className="space-y-5">
      {/* Tab Switcher */}
      <div className="flex border-b border-sky-100 bg-white px-4 py-2 rounded-2xl shadow-sm ring-1 ring-sky-100">
        <button
          type="button"
          onClick={() => setActiveTab("records")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
            activeTab === "records"
              ? "bg-sky-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-sky-50"
          }`}
        >
          <User className="size-4" />
          Patient Records Analysis
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("simulator")}
          className={`ml-2 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
            activeTab === "simulator"
              ? "bg-sky-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-sky-50"
          }`}
        >
          <FlaskConical className="size-4" />
          Direct Lab Test Evaluator (Gemini AI API)
        </button>
      </div>

      {activeTab === "records" ? (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <PageCard title="Patients" subtitle="Select a stored record.">
            {patients.length === 0 ? (
              <p className="text-sm text-slate-500">No patients yet.</p>
            ) : (
              <ul className="space-y-2">
                {patients.map((patient) => (
                  <li key={patient.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(patient.id)}
                      className={`w-full rounded-xl px-3 py-2 text-left transition ${
                        patient.id === selectedId
                          ? "bg-sky-600 text-white"
                          : "bg-sky-50 text-ink hover:bg-sky-100"
                      }`}
                    >
                      <span className="block text-sm font-bold">{patient.full_name}</span>
                      <div className="mt-0.5 flex items-center justify-between">
                        <span className={`text-xs ${patient.id === selectedId ? "text-sky-100" : "text-slate-500"}`}>
                          ID #{patient.id}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            patient.analysis_status === "completed"
                              ? patient.id === selectedId
                                ? "bg-sky-700 text-white"
                                : "bg-emerald-100 text-emerald-800"
                              : patient.id === selectedId
                              ? "bg-sky-700 text-white"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {patient.analysis_status}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </PageCard>

          <PageCard
            title={selected ? selected.full_name : "AI details"}
            subtitle="Glucose, haemoglobin, cholesterol, overall remarks, and recommendations."
            action={
              selected ? (
                <button
                  type="button"
                  onClick={retry}
                  disabled={busy}
                  className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 disabled:opacity-60"
                >
                  <RefreshCw className={`size-4 ${busy ? "animate-spin" : ""}`} />
                  {busy ? "Asking Gemini..." : "Reanalyze with Gemini"}
                </button>
              ) : null
            }
          >
            {selected ? (
              <div className="space-y-3">
                <StatusBadge status={selected.analysis_status} />
                <PatientDetail patient={selected} />
              </div>
            ) : (
              <p className="text-sm text-slate-500">Choose a patient to read their parameter observations.</p>
            )}
          </PageCard>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <PageCard
            title="Lab Test Evaluator"
            subtitle="Test arbitrary blood test values directly through POST /api/health/analyze with Google Gemini."
          >
            <form onSubmit={handleSimulate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-sky-900 uppercase">
                  Glucose (mg/dL)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={simValues.glucose}
                  onChange={(e) => setSimValues({ ...simValues, glucose: e.target.value })}
                  placeholder="e.g. 100"
                  className="mt-1 w-full rounded-xl border border-sky-100 px-3 py-2.5 text-sm font-semibold outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                />
                {simErrors.glucose && <p className="mt-1 text-xs text-rose-600">{simErrors.glucose}</p>}
                <p className="mt-1 text-xs text-slate-400">Normal fasting range: 70–99 mg/dL</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-sky-900 uppercase">
                  Haemoglobin (g/dL)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={simValues.haemoglobin}
                  onChange={(e) => setSimValues({ ...simValues, haemoglobin: e.target.value })}
                  placeholder="e.g. 14.5"
                  className="mt-1 w-full rounded-xl border border-sky-100 px-3 py-2.5 text-sm font-semibold outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                />
                {simErrors.haemoglobin && <p className="mt-1 text-xs text-rose-600">{simErrors.haemoglobin}</p>}
                <p className="mt-1 text-xs text-slate-400">Standard range: 12.0–17.5 g/dL</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-sky-900 uppercase">
                  Cholesterol (mg/dL)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={simValues.cholesterol}
                  onChange={(e) => setSimValues({ ...simValues, cholesterol: e.target.value })}
                  placeholder="e.g. 185"
                  className="mt-1 w-full rounded-xl border border-sky-100 px-3 py-2.5 text-sm font-semibold outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                />
                {simErrors.cholesterol && <p className="mt-1 text-xs text-rose-600">{simErrors.cholesterol}</p>}
                <p className="mt-1 text-xs text-slate-400">Desirable range: &lt; 200 mg/dL</p>
              </div>

              <button
                type="submit"
                disabled={simBusy}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 disabled:opacity-60"
              >
                <Sparkles className="size-4" />
                {simBusy ? "Consulting Gemini AI..." : "Generate AI Observations"}
              </button>
            </form>
          </PageCard>

          <PageCard
            title="AI Health Observations & Remarks"
            subtitle="Real-time structured response returned by Google GenAI SDK."
          >
            {simResult ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-4">
                    <p className="text-xs font-bold text-sky-800 uppercase">Glucose Observation</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">{simResult.glucose_observation}</p>
                  </div>
                  <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-4">
                    <p className="text-xs font-bold text-sky-800 uppercase">Haemoglobin Observation</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">{simResult.haemoglobin_observation}</p>
                  </div>
                  <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-4">
                    <p className="text-xs font-bold text-sky-800 uppercase">Cholesterol Observation</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">{simResult.cholesterol_observation}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-sky-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 font-bold text-sky-950">
                    <Activity className="size-4 text-sky-600" />
                    Overall Health Remarks
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{simResult.overall_remarks}</p>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                  <div className="flex items-center gap-2 font-bold text-emerald-950">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    Clinical Recommendations
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-emerald-900">{simResult.recommendations}</p>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Clinical Notice:</strong> Observations are preliminary and do not constitute a definitive medical diagnosis. Units were assumed based on standard laboratory ranges. Consult a registered physician for clinical evaluation.
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <Sparkles className="size-10 text-sky-300 stroke-1 mb-2" />
                <p className="font-semibold text-slate-600">No live evaluation performed yet</p>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Adjust the blood test parameters on the left and click "Generate AI Observations" to run a live evaluation via Google Gemini.
                </p>
              </div>
            )}
          </PageCard>
        </div>
      )}
    </div>
  )
}
