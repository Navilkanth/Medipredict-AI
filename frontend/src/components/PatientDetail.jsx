import { formatLab, formatWhen } from "../utils/format"
import { StatusBadge } from "./ui"

export function PatientDetail({ patient }) {
  const rows = [
    ["Full name", patient.full_name],
    ["Date of birth", patient.dob],
    ["Email", patient.email],
    ["Glucose", `${formatLab(patient.glucose)} mg/dL`],
    ["Haemoglobin", `${formatLab(patient.haemoglobin)} g/dL`],
    ["Cholesterol", `${formatLab(patient.cholesterol)} mg/dL`],
    ["Saved", formatWhen(patient.created_at)],
    ["Updated", formatWhen(patient.updated_at)],
  ]

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-500">AI status</span>
        <StatusBadge status={patient.analysis_status} />
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-sky-50/70 px-3 py-2">
            <dt className="text-xs font-bold tracking-wide text-sky-800 uppercase">{label}</dt>
            <dd className="mt-1 font-semibold text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      <Observation title="Glucose observation" text={patient.glucose_observation} />
      <Observation title="Haemoglobin observation" text={patient.haemoglobin_observation} />
      <Observation title="Cholesterol observation" text={patient.cholesterol_observation} />
      <Observation title="Overall remarks" text={patient.remarks} />
      <Observation title="Recommendations" text={patient.recommendations} />
      {patient.analysis_error ? (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-rose-800">{patient.analysis_error}</p>
      ) : null}
    </div>
  )
}

function Observation({ title, text }) {
  return (
    <div>
      <h3 className="font-bold text-ink">{title}</h3>
      <p className="mt-1 leading-6 text-slate-600">{text || "No observation stored. Retry the analysis if the API call failed."}</p>
    </div>
  )
}
