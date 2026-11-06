import { useEffect, useState } from "react"
import { Calendar, User, Mail, Activity, Droplets, HeartPulse, ChevronDown, Plus, Minus } from "lucide-react"
import { emptyPatientForm, validatePatientForm } from "../utils/validation"

const MONTHS = [
  { value: "01", label: "01 - January" },
  { value: "02", label: "02 - February" },
  { value: "03", label: "03 - March" },
  { value: "04", label: "04 - April" },
  { value: "05", label: "05 - May" },
  { value: "06", label: "06 - June" },
  { value: "07", label: "07 - July" },
  { value: "08", label: "08 - August" },
  { value: "09", label: "09 - September" },
  { value: "10", label: "10 - October" },
  { value: "11", label: "11 - November" },
  { value: "12", label: "12 - December" },
]

const CURRENT_YEAR = new Date().getFullYear() // 2026
const YEARS = Array.from({ length: CURRENT_YEAR - 1919 }, (_, i) => String(CURRENT_YEAR - i))
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"))

const GLUCOSE_PRESETS = [
  { label: "Normal (90)", value: 90 },
  { label: "Elevated (135)", value: 135 },
  { label: "High (210)", value: 210 },
]

const HAEMO_PRESETS = [
  { label: "Low (8.5)", value: 8.5 },
  { label: "Standard (14.0)", value: 14.0 },
  { label: "High (18.0)", value: 18.0 },
]

const CHOL_PRESETS = [
  { label: "Desirable (175)", value: 175 },
  { label: "Borderline (215)", value: 215 },
  { label: "High (270)", value: 270 },
]

function parseDob(dobStr) {
  if (!dobStr) return { day: "", month: "", year: "" }
  const parts = dobStr.split(/[./-]/)
  if (parts.length === 3) {
    return {
      day: parts[0].padStart(2, "0"),
      month: parts[1].padStart(2, "0"),
      year: parts[2],
    }
  }
  return { day: "", month: "", year: "" }
}

export function PatientForm({ initial, submitLabel, onSubmit }) {
  const [values, setValues] = useState(initial ?? emptyPatientForm())
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  // Scrolling DOB state
  const initialDobParts = parseDob(initial?.dob)
  const [dobDay, setDobDay] = useState(initialDobParts.day)
  const [dobMonth, setDobMonth] = useState(initialDobParts.month)
  const [dobYear, setDobYear] = useState(initialDobParts.year)

  // Sync scrolling DOB to values.dob
  useEffect(() => {
    if (dobDay && dobMonth && dobYear) {
      setValues((prev) => ({ ...prev, dob: `${dobDay}/${dobMonth}/${dobYear}` }))
    }
  }, [dobDay, dobMonth, dobYear])

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  function adjustNumber(key, delta, step = 1) {
    const current = parseFloat(values[key]) || 0
    const next = Math.max(0, parseFloat((current + delta * step).toFixed(1)))
    update(key, String(next))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validatePatientForm(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    setBusy(true)
    try {
      await onSubmit(values)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Patient Demographics Card */}
      <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-5 dark:border-slate-800 dark:bg-slate-800/40">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-sky-950 dark:text-sky-300">
          <User className="size-4" />
          Patient Personal Credentials
        </h3>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <input
                value={values.full_name}
                type="text"
                placeholder="e.g. Jane Doe"
                onChange={(event) => update("full_name", event.target.value)}
                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-base font-medium outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:bg-[#111827] dark:text-white dark:focus:ring-sky-900/40 ${
                  errors.full_name
                    ? "border-rose-400 bg-rose-50/20 dark:border-rose-700"
                    : "border-sky-100 dark:border-slate-700"
                }`}
              />
            </div>
            {errors.full_name && (
              <span className="mt-1 block text-xs font-semibold text-rose-600 dark:text-rose-400">
                {errors.full_name}
              </span>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <input
                value={values.email}
                type="email"
                placeholder="e.g. robyn@example.com"
                onChange={(event) => update("email", event.target.value)}
                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-base font-medium outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:bg-[#111827] dark:text-white dark:focus:ring-sky-900/40 ${
                  errors.email
                    ? "border-rose-400 bg-rose-50/20 dark:border-rose-700"
                    : "border-sky-100 dark:border-slate-700"
                }`}
              />
            </div>
            {errors.email && (
              <span className="mt-1 block text-xs font-semibold text-rose-600 dark:text-rose-400">
                {errors.email}
              </span>
            )}
          </div>

          {/* Scrolling Date of Birth: Day / Month / Year */}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Date of Birth (DD / MM / YYYY) <span className="text-rose-500">*</span>
              </label>
              {values.dob ? (
                <span className="rounded-md bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-800 dark:bg-sky-900/60 dark:text-sky-300">
                  Selected: {values.dob}
                </span>
              ) : null}
            </div>

            <div className="mt-1.5 grid grid-cols-3 gap-3">
              {/* Day Scroll */}
              <div className="relative">
                <select
                  value={dobDay}
                  onChange={(e) => setDobDay(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-sky-100 bg-white px-3.5 py-2.5 text-base font-semibold outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-[#111827] dark:text-white dark:focus:ring-sky-900/40"
                >
                  <option value="">Day</option>
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3.5 size-4 text-slate-400" />
              </div>

              {/* Month Scroll */}
              <div className="relative">
                <select
                  value={dobMonth}
                  onChange={(e) => setDobMonth(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-sky-100 bg-white px-3.5 py-2.5 text-base font-semibold outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-[#111827] dark:text-white dark:focus:ring-sky-900/40"
                >
                  <option value="">Month</option>
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3.5 size-4 text-slate-400" />
              </div>

              {/* Year Scroll */}
              <div className="relative">
                <select
                  value={dobYear}
                  onChange={(e) => setDobYear(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-sky-100 bg-white px-3.5 py-2.5 text-base font-semibold outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-[#111827] dark:text-white dark:focus:ring-sky-900/40"
                >
                  <option value="">Year</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3.5 size-4 text-slate-400" />
              </div>
            </div>

            {errors.dob && (
              <span className="mt-1 block text-xs font-semibold text-rose-600 dark:text-rose-400">
                {errors.dob}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Clinical Lab Values Card */}
      <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-5 dark:border-slate-800 dark:bg-slate-800/40">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-sky-950 dark:text-sky-300">
          <Activity className="size-4" />
          Clinical Blood Test Metrics
        </h3>

        <div className="grid gap-6 sm:grid-cols-3">
          {/* Glucose */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Glucose (mg/dL) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-400">
                Ref: 70–99
              </span>
            </div>

            <div className="relative mt-1.5 flex rounded-xl border border-sky-100 bg-white dark:border-slate-700 dark:bg-[#111827]">
              <input
                value={values.glucose}
                type="number"
                step="0.1"
                placeholder="e.g. 94"
                onChange={(e) => update("glucose", e.target.value)}
                className="w-full bg-transparent px-3 py-2.5 text-base font-bold outline-none dark:text-white"
              />
              <div className="flex flex-col border-l border-sky-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => adjustNumber("glucose", 1, 5)}
                  className="px-2 py-1 text-slate-500 hover:bg-sky-50 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <Plus className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => adjustNumber("glucose", -1, 5)}
                  className="px-2 py-1 text-slate-500 hover:bg-sky-50 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <Minus className="size-3" />
                </button>
              </div>
            </div>

            {/* Quick preset buttons */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {GLUCOSE_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => update("glucose", String(p.value))}
                  className="rounded-lg bg-sky-100/70 px-2 py-0.5 text-[11px] font-bold text-sky-900 transition hover:bg-sky-200 dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-slate-700"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {errors.glucose && (
              <span className="mt-1 block text-xs font-semibold text-rose-600 dark:text-rose-400">
                {errors.glucose}
              </span>
            )}
          </div>

          {/* Haemoglobin */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Haemoglobin (g/dL) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-400">
                Ref: 12.0–17.5
              </span>
            </div>

            <div className="relative mt-1.5 flex rounded-xl border border-sky-100 bg-white dark:border-slate-700 dark:bg-[#111827]">
              <input
                value={values.haemoglobin}
                type="number"
                step="0.1"
                placeholder="e.g. 13.5"
                onChange={(e) => update("haemoglobin", e.target.value)}
                className="w-full bg-transparent px-3 py-2.5 text-base font-bold outline-none dark:text-white"
              />
              <div className="flex flex-col border-l border-sky-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => adjustNumber("haemoglobin", 1, 0.5)}
                  className="px-2 py-1 text-slate-500 hover:bg-sky-50 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <Plus className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => adjustNumber("haemoglobin", -1, 0.5)}
                  className="px-2 py-1 text-slate-500 hover:bg-sky-50 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <Minus className="size-3" />
                </button>
              </div>
            </div>

            {/* Quick preset buttons */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {HAEMO_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => update("haemoglobin", String(p.value))}
                  className="rounded-lg bg-sky-100/70 px-2 py-0.5 text-[11px] font-bold text-sky-900 transition hover:bg-sky-200 dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-slate-700"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {errors.haemoglobin && (
              <span className="mt-1 block text-xs font-semibold text-rose-600 dark:text-rose-400">
                {errors.haemoglobin}
              </span>
            )}
          </div>

          {/* Cholesterol */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Cholesterol (mg/dL) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-400">
                Ref: &lt; 200
              </span>
            </div>

            <div className="relative mt-1.5 flex rounded-xl border border-sky-100 bg-white dark:border-slate-700 dark:bg-[#111827]">
              <input
                value={values.cholesterol}
                type="number"
                step="1"
                placeholder="e.g. 180"
                onChange={(e) => update("cholesterol", e.target.value)}
                className="w-full bg-transparent px-3 py-2.5 text-base font-bold outline-none dark:text-white"
              />
              <div className="flex flex-col border-l border-sky-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => adjustNumber("cholesterol", 1, 5)}
                  className="px-2 py-1 text-slate-500 hover:bg-sky-50 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <Plus className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => adjustNumber("cholesterol", -1, 5)}
                  className="px-2 py-1 text-slate-500 hover:bg-sky-50 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <Minus className="size-3" />
                </button>
              </div>
            </div>

            {/* Quick preset buttons */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {CHOL_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => update("cholesterol", String(p.value))}
                  className="rounded-lg bg-sky-100/70 px-2 py-0.5 text-[11px] font-bold text-sky-900 transition hover:bg-sky-200 dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-slate-700"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {errors.cholesterol && (
              <span className="mt-1 block text-xs font-semibold text-rose-600 dark:text-rose-400">
                {errors.cholesterol}
              </span>
            )}
          </div>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-sky-600 px-6 py-3.5 text-base font-bold text-white shadow-md shadow-sky-600/25 transition hover:bg-sky-700 disabled:opacity-60 dark:bg-sky-500 dark:hover:bg-sky-600 sm:w-auto"
        >
          {busy ? "Registering & Analyzing..." : submitLabel}
        </button>
      </div>
    </form>
  )
}
