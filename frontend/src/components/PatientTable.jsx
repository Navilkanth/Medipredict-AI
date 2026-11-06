import { Eye, Pencil, Trash2, UserPlus } from "lucide-react"
import { Link } from "react-router-dom"
import { formatLab } from "../utils/format"
import { StatusBadge } from "./ui"

export function PatientTable({ patients, onView, onEdit, onDelete }) {
  if (patients.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-sky-200 bg-white px-6 py-14 text-center dark:border-slate-800 dark:bg-[#111827]">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-slate-800 dark:text-sky-400">
          <UserPlus className="size-7" />
        </div>
        <p className="mt-4 font-display text-xl font-bold text-[#0f2744] dark:text-white">
          No patient records found
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
          Register a new patient or adjust search filters to view clinical records.
        </p>
        <div className="mt-5">
          <Link
            to="/patients/new"
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
          >
            <UserPlus className="size-4" />
            Register Patient
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-sky-100 dark:bg-[#111827] dark:ring-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-[1020px] w-full text-left text-base">
          <thead className="bg-sky-50/80 text-xs font-extrabold tracking-wider text-sky-950 uppercase dark:bg-slate-800/80 dark:text-sky-300">
            <tr>
              {["ID", "Full Name", "Date of Birth", "Email Address", "Glucose", "Haemoglobin", "Cholesterol", "Clinical Remarks", "Actions"].map(
                (heading) => (
                  <th key={heading} className="px-4 py-3.5">
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-50 dark:divide-slate-800/60">
            {patients.map((patient) => (
              <tr
                key={patient.id}
                className="transition hover:bg-sky-50/40 dark:hover:bg-slate-800/40"
              >
                <td className="px-4 py-4 font-bold text-slate-400 dark:text-slate-500">#{patient.id}</td>
                <td className="px-4 py-4 font-bold text-[#0f2744] dark:text-white">
                  {patient.full_name}
                </td>
                <td className="px-4 py-4 font-medium text-slate-600 dark:text-slate-300">{patient.dob}</td>
                <td className="px-4 py-4 font-medium text-slate-600 dark:text-slate-300">{patient.email}</td>
                <td className="px-4 py-4 font-semibold text-sky-900 dark:text-sky-200">
                  {formatLab(patient.glucose)} <span className="text-xs font-normal text-slate-400">mg/dL</span>
                </td>
                <td className="px-4 py-4 font-semibold text-sky-900 dark:text-sky-200">
                  {formatLab(patient.haemoglobin)} <span className="text-xs font-normal text-slate-400">g/dL</span>
                </td>
                <td className="px-4 py-4 font-semibold text-sky-900 dark:text-sky-200">
                  {formatLab(patient.cholesterol)} <span className="text-xs font-normal text-slate-400">mg/dL</span>
                </td>
                <td className="max-w-xs px-4 py-4">
                  {patient.remarks ? (
                    <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{patient.remarks}</p>
                  ) : (
                    <div className="space-y-1">
                      <StatusBadge status={patient.analysis_status === "failed" ? "failed" : "pending"} />
                      <p className="text-xs text-slate-500 dark:text-slate-400">{patient.analysis_error || "Analysis pending."}</p>
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5">
                    <IconButton label="View Details" onClick={() => onView(patient)}>
                      <Eye className="size-4" />
                    </IconButton>
                    <IconButton label="Edit Record" onClick={() => onEdit(patient)}>
                      <Pencil className="size-4" />
                    </IconButton>
                    <IconButton label="Delete Record" onClick={() => onDelete(patient)} tone="danger">
                      <Trash2 className="size-4" />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function IconButton({ label, onClick, children, tone = "default" }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`rounded-xl p-2 transition ${
        tone === "danger"
          ? "text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
          : "text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-slate-800"
      }`}
    >
      {children}
    </button>
  )
}
