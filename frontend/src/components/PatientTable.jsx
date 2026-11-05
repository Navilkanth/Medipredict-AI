import { Eye, Pencil, Trash2 } from "lucide-react"
import { formatLab } from "../utils/format"
import { StatusBadge } from "./ui"

export function PatientTable({ patients, onView, onEdit, onDelete }) {
  if (patients.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-sky-200 bg-white px-6 py-12 text-center">
        <p className="font-display text-lg font-bold">No patient records yet</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          Add a patient or run the company test-data import. Only records that pass validation are stored.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-sky-100">
      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full text-left text-sm">
          <thead className="bg-sky-50 text-xs tracking-wide text-sky-900 uppercase">
            <tr>
              {["ID", "Full name", "Date of birth", "Email", "Glucose", "Haemoglobin", "Cholesterol", "AI remarks", "Actions"].map(
                (heading) => (
                  <th key={heading} className="px-4 py-3 font-bold">
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id} className="border-t border-sky-50 align-top">
                <td className="px-4 py-3 font-semibold text-slate-500">{patient.id}</td>
                <td className="px-4 py-3 font-bold text-ink">{patient.full_name}</td>
                <td className="px-4 py-3">{patient.dob}</td>
                <td className="px-4 py-3">{patient.email}</td>
                <td className="px-4 py-3">{formatLab(patient.glucose)}</td>
                <td className="px-4 py-3">{formatLab(patient.haemoglobin)}</td>
                <td className="px-4 py-3">{formatLab(patient.cholesterol)}</td>
                <td className="max-w-xs px-4 py-3">
                  {patient.remarks ? (
                    <p className="line-clamp-3 text-slate-600">{patient.remarks}</p>
                  ) : (
                    <div className="space-y-1">
                      <StatusBadge status={patient.analysis_status === "failed" ? "failed" : "pending"} />
                      <p className="text-xs text-slate-500">{patient.analysis_error || "Analysis has not completed."}</p>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <IconButton label="View" onClick={() => onView(patient)}>
                      <Eye className="size-4" />
                    </IconButton>
                    <IconButton label="Edit" onClick={() => onEdit(patient)}>
                      <Pencil className="size-4" />
                    </IconButton>
                    <IconButton label="Delete" onClick={() => onDelete(patient)} tone="danger">
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
      className={`rounded-lg p-2 transition ${
        tone === "danger" ? "text-rose-600 hover:bg-rose-50" : "text-sky-700 hover:bg-sky-50"
      }`}
    >
      {children}
    </button>
  )
}
