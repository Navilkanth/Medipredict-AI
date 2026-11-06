import { useState } from "react"
import {
  Sun,
  Moon,
  Type,
  Building,
  Activity,
  Download,
  RotateCcw,
  Check,
  Save,
  Sliders,
  Sparkles,
  Database,
  RefreshCw,
} from "lucide-react"
import { PageCard } from "../components/ui"
import { useTheme } from "../context/ThemeContext"
import { useToast } from "../context/ToastContext"
import { getPatients, seedDatabase } from "../services/api"

export function SettingsPage() {
  const { theme, toggleTheme, fontSize, setFontSize, settings, updateSettings } = useTheme()
  const { notify } = useToast()

  const [formValues, setFormValues] = useState({
    facilityName: settings.facilityName || "MediPredict Medical Center",
    department: settings.department || "Cardiology & General Health",
    physicianName: settings.physicianName || "Dr. Sarah Mitchell, MD",
    glucoseThreshold: settings.glucoseThreshold || 126,
    cholesterolThreshold: settings.cholesterolThreshold || 200,
    rowsPerPage: settings.rowsPerPage || 8,
  })

  const [downloading, setDownloading] = useState(false)
  const [seeding, setSeeding] = useState(false)

  async function handleSeedDatabase() {
    setSeeding(true)
    try {
      const res = await seedDatabase(true)
      notify("success", res.message || "Successfully seeded 10 patient records into live database!")
    } catch (err) {
      notify("error", err.message || "Failed to seed live database.")
    } finally {
      setSeeding(false)
    }
  }

  function handleChange(key, val) {
    setFormValues((prev) => ({ ...prev, [key]: val }))
  }

  function handleSavePreferences(e) {
    e.preventDefault()
    updateSettings(formValues)
    notify("success", "Clinical preferences saved successfully.")
  }

  function handleResetDefaults() {
    const defaults = {
      facilityName: "MediPredict Medical Center",
      department: "Cardiology & General Health",
      physicianName: "Dr. Sarah Mitchell, MD",
      glucoseThreshold: 126,
      cholesterolThreshold: 200,
      rowsPerPage: 8,
    }
    setFormValues(defaults)
    updateSettings(defaults)
    setFontSize("standard")
    notify("success", "Preferences reset to default values.")
  }

  async function handleExportCSV() {
    setDownloading(true)
    try {
      const response = await getPatients({ page: 1, perPage: 1000 })
      const items = response.data.items || []

      const headers = ["ID", "Full Name", "Date of Birth", "Email", "Glucose (mg/dL)", "Haemoglobin (g/dL)", "Cholesterol (mg/dL)", "Remarks"]
      const csvRows = [headers.join(",")]

      for (const p of items) {
        const row = [
          p.id,
          `"${(p.full_name || "").replace(/"/g, '""')}"`,
          `"${p.dob || ""}"`,
          `"${p.email || ""}"`,
          p.glucose,
          p.haemoglobin,
          p.cholesterol,
          `"${(p.remarks || "").replace(/"/g, '""')}"`,
        ]
        csvRows.push(row.join(","))
      }

      const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `medipredict_patients_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      notify("success", `Exported ${items.length} records to CSV.`)
    } catch {
      notify("error", "Failed to export records.")
    } finally {
      setDownloading(false)
    }
  }

  async function handleExportJSON() {
    setDownloading(true)
    try {
      const response = await getPatients({ page: 1, perPage: 1000 })
      const items = response.data.items || []

      const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `medipredict_patients_${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      notify("success", `Exported ${items.length} records to JSON.`)
    } catch {
      notify("error", "Failed to export records.")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Appearance & Theme Settings */}
      <PageCard
        title="Appearance & Typography"
        subtitle="Customize theme modes and adjust text sizing for optimal clinical legibility."
      >
        <div className="space-y-6">
          {/* Theme Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Color Theme Mode
            </label>
            <div className="mt-2.5 grid grid-cols-2 gap-4 sm:max-w-md">
              <button
                type="button"
                onClick={() => {
                  if (theme !== "light") toggleTheme()
                }}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                  theme === "light"
                    ? "border-sky-500 bg-sky-50/70 shadow-sm ring-2 ring-sky-500/20"
                    : "border-sky-100 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-[#111827]"
                }`}
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Sun className="size-5" />
                </div>
                <div>
                  <p className="font-bold text-[#0f2744] dark:text-white">Light Theme</p>
                  <p className="text-xs text-slate-500">Hospital clean palette</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (theme !== "dark") toggleTheme()
                }}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                  theme === "dark"
                    ? "border-sky-500 bg-slate-800 shadow-sm ring-2 ring-sky-500/20"
                    : "border-sky-100 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-[#111827]"
                }`}
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-sky-950 text-sky-400">
                  <Moon className="size-5" />
                </div>
                <div>
                  <p className="font-bold text-[#0f2744] dark:text-white">Dark Theme</p>
                  <p className="text-xs text-slate-500">Deep clinical contrast</p>
                </div>
              </button>
            </div>
          </div>

          {/* Font Size Adjuster */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Text Font Scale
              </label>
              <span className="text-xs font-semibold text-sky-700 dark:text-sky-300 capitalize">
                Current: {fontSize}
              </span>
            </div>

            <div className="mt-2.5 grid grid-cols-3 gap-3 sm:max-w-md">
              {[
                { id: "standard", label: "Standard (16px)", desc: "Default" },
                { id: "medium", label: "Medium (17.5px)", desc: "Enlarged" },
                { id: "large", label: "Large (19px)", desc: "Maximum" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFontSize(opt.id)}
                  className={`flex flex-col items-center justify-center rounded-2xl border p-3.5 text-center transition ${
                    fontSize === opt.id
                      ? "border-sky-500 bg-sky-600 text-white shadow-sm dark:bg-sky-500"
                      : "border-sky-100 bg-white hover:bg-sky-50 dark:border-slate-700 dark:bg-[#111827] dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="font-bold text-sm">{opt.label}</span>
                  <span
                    className={`text-[11px] ${
                      fontSize === opt.id ? "text-sky-100" : "text-slate-400"
                    }`}
                  >
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </PageCard>

      {/* Facility & Clinical Profile Settings */}
      <form onSubmit={handleSavePreferences} className="space-y-6">
        <PageCard
          title="Facility & Practice Details"
          subtitle="Configure medical center identifiers displayed across patient records and analytics."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Healthcare Facility Name
              </label>
              <div className="relative mt-1.5">
                <input
                  type="text"
                  value={formValues.facilityName}
                  onChange={(e) => handleChange("facilityName", e.target.value)}
                  className="w-full rounded-xl border border-sky-100 bg-white px-3.5 py-2.5 text-base font-medium outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-[#111827] dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Clinical Department / Specialty
              </label>
              <div className="relative mt-1.5">
                <input
                  type="text"
                  value={formValues.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                  className="w-full rounded-xl border border-sky-100 bg-white px-3.5 py-2.5 text-base font-medium outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-[#111827] dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Primary Reviewing Physician
              </label>
              <div className="relative mt-1.5">
                <input
                  type="text"
                  value={formValues.physicianName}
                  onChange={(e) => handleChange("physicianName", e.target.value)}
                  className="w-full rounded-xl border border-sky-100 bg-white px-3.5 py-2.5 text-base font-medium outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-[#111827] dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Default Patient Table Rows
              </label>
              <div className="relative mt-1.5">
                <select
                  value={formValues.rowsPerPage}
                  onChange={(e) => handleChange("rowsPerPage", Number(e.target.value))}
                  className="w-full appearance-none rounded-xl border border-sky-100 bg-white px-3.5 py-2.5 text-base font-medium outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-[#111827] dark:text-white"
                >
                  <option value={5}>5 records per page</option>
                  <option value={8}>8 records per page (Recommended)</option>
                  <option value={12}>12 records per page</option>
                  <option value={20}>20 records per page</option>
                </select>
              </div>
            </div>
          </div>
        </PageCard>

        {/* Clinical Alert Thresholds */}
        <PageCard
          title="Clinical Alert Thresholds"
          subtitle="Customize flagging criteria for high-risk physiological biomarker levels."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                High Glucose Alert Level (mg/dL)
              </label>
              <input
                type="number"
                value={formValues.glucoseThreshold}
                onChange={(e) => handleChange("glucoseThreshold", Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-sky-100 bg-white px-3.5 py-2.5 text-base font-bold outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-[#111827] dark:text-white"
              />
              <p className="mt-1 text-xs text-slate-400">Default: 126 mg/dL (fasting threshold)</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Elevated Cholesterol Alert Level (mg/dL)
              </label>
              <input
                type="number"
                value={formValues.cholesterolThreshold}
                onChange={(e) => handleChange("cholesterolThreshold", Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-sky-100 bg-white px-3.5 py-2.5 text-base font-bold outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-[#111827] dark:text-white"
              />
              <p className="mt-1 text-xs text-slate-400">Default: 200 mg/dL (desirable ceiling)</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-sky-100/60 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <RotateCcw className="size-4" /> Reset to Defaults
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
            >
              <Save className="size-4" /> Save Preferences
            </button>
          </div>
        </PageCard>
      </form>

      {/* Data Management & Export Card */}
      <PageCard
        title="Clinical Data Management"
        subtitle="Securely export patient registry and laboratory observations for EMR archival, or seed live demonstration data."
      >
        <div className="space-y-6">
          {/* Seed Database */}
          <div className="flex flex-col gap-4 rounded-2xl border border-sky-100/80 bg-sky-50/50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-800/40">
            <div>
              <div className="flex items-center gap-2">
                <Database className="size-4 text-sky-600 dark:text-sky-400" />
                <p className="font-bold text-[#0f2744] dark:text-white">Seed Live Clinical Database</p>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Populate or reset the database with 10 standard patient records containing complete blood biomarker profiles and verified AI observations for live testing.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-sky-700 disabled:opacity-60 dark:bg-sky-500 dark:hover:bg-sky-600 shrink-0"
            >
              <RefreshCw className={`size-4 ${seeding ? "animate-spin" : ""}`} />
              {seeding ? "Seeding Database..." : "Seed 10 Records to Live DB"}
            </button>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
            <div>
              <p className="font-bold text-[#0f2744] dark:text-white">Export Patient Registry</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Download complete patient records, blood test results, and clinical remarks.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExportCSV}
                disabled={downloading}
                className="flex items-center gap-2 rounded-xl border border-sky-100 bg-white px-4 py-2.5 text-sm font-bold text-sky-800 shadow-sm transition hover:bg-sky-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-slate-700"
              >
                <Download className="size-4" />
                Export CSV
              </button>
              <button
                type="button"
                onClick={handleExportJSON}
                disabled={downloading}
                className="flex items-center gap-2 rounded-xl border border-sky-100 bg-white px-4 py-2.5 text-sm font-bold text-sky-800 shadow-sm transition hover:bg-sky-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-slate-700"
              >
                <Download className="size-4" />
                Export JSON
              </button>
            </div>
          </div>
        </div>
      </PageCard>
    </div>
  )
}
