import { formatLab, formatWhen } from "../utils/format"
import { StatusBadge } from "./ui"
import { Activity, ShieldCheck, Stethoscope } from "lucide-react"

export function PatientDetail({ patient }) {
  const rows = [
    ["Full Name", patient.full_name],
    ["Date of Birth", patient.dob],
    ["Email Address", patient.email],
    ["Fasting Glucose", `${formatLab(patient.glucose)} mg/dL`],
    ["Haemoglobin", `${formatLab(patient.haemoglobin)} g/dL`],
    ["Total Cholesterol", `${formatLab(patient.cholesterol)} mg/dL`],
    ["Registered On", formatWhen(patient.created_at)],
    ["Last Evaluated", formatWhen(patient.updated_at)],
  ]

  return (
    <div className="space-y-5 text-base">
      <div className="flex items-center justify-between rounded-2xl bg-sky-50/70 p-4 dark:bg-slate-800/60">
        <div className="flex items-center gap-2">
          <Stethoscope className="size-5 text-sky-600 dark:text-sky-400" />
          <span className="font-bold text-[#0f2744] dark:text-white">Clinical Assessment Status</span>
        </div>
        <StatusBadge status={patient.analysis_status} />
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-sky-100/70 bg-sky-50/40 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40"
          >
            <dt className="text-xs font-bold uppercase tracking-wider text-sky-900 dark:text-sky-300">
              {label}
            </dt>
            <dd className="mt-1 font-bold text-[#0f2744] dark:text-white">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="space-y-4 pt-2">
        <ObservationCard
          title="Glucose Observation"
          text={patient.glucose_observation}
          badge="Endocrine Assessment"
        />
        <ObservationCard
          title="Haemoglobin Observation"
          text={patient.haemoglobin_observation}
          badge="Hematology Assessment"
        />
        <ObservationCard
          title="Cholesterol Observation"
          text={patient.cholesterol_observation}
          badge="Lipid Profile"
        />
        <ObservationCard
          title="Overall Clinical Remarks"
          text={patient.remarks}
          badge="Summary Synthesis"
          highlight
        />
        <ObservationCard
          title="Physician Recommendations"
          text={patient.recommendations}
          badge="Care Protocol"
          recommended
        />
      </div>

      {patient.analysis_error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {patient.analysis_error}
        </p>
      ) : null}
    </div>
  )
}

function ObservationCard({ title, text, badge, highlight, recommended }) {
  return (
    <div
      className={`rounded-2xl p-4 transition ${
        recommended
          ? "border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/20"
          : highlight
          ? "border border-sky-200 bg-sky-50/50 dark:border-slate-700 dark:bg-slate-800/50"
          : "border border-sky-100 bg-white dark:border-slate-800 dark:bg-[#111827]"
      }`}
    >
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-[#0f2744] dark:text-white">{title}</h4>
        {badge ? (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {text || "Observation pending. Re-evaluate biomarkers to generate clinical remarks."}
      </p>
    </div>
  )
}
