import { useState } from "react"
import { emptyPatientForm, validatePatientForm } from "../utils/validation"

const fields = [
  { key: "full_name", label: "Full name", placeholder: "Robyn Pears" },
  { key: "dob", label: "Date of birth", placeholder: "DD/MM/YYYY" },
  { key: "email", label: "Email address", placeholder: "name@example.com", type: "email" },
  { key: "glucose", label: "Glucose (mg/dL)", placeholder: "94" },
  { key: "haemoglobin", label: "Haemoglobin (g/dL)", placeholder: "13.5" },
  { key: "cholesterol", label: "Cholesterol (mg/dL)", placeholder: "180" },
]

export function PatientForm({ initial, submitLabel, onSubmit }) {
  const [values, setValues] = useState(initial ?? emptyPatientForm())
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }))
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
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
      {fields.map((field) => (
        <label key={field.key} className="block text-sm font-semibold text-slate-700">
          {field.label}
          <input
            value={values[field.key]}
            type={field.type ?? "text"}
            inputMode={field.key === "full_name" || field.key === "email" || field.key === "dob" ? "text" : "decimal"}
            placeholder={field.placeholder}
            onChange={(event) => update(field.key, event.target.value)}
            className={`mt-1.5 w-full rounded-xl border bg-white px-3 py-2.5 text-sm font-medium outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 ${
              errors[field.key] ? "border-rose-300" : "border-sky-100"
            }`}
          />
          {errors[field.key] ? <span className="mt-1 block text-xs font-medium text-rose-600">{errors[field.key]}</span> : null}
        </label>
      ))}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 disabled:opacity-60"
        >
          {busy ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  )
}
