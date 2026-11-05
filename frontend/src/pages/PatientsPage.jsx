import { useEffect, useState } from "react"
import { PatientDetail } from "../components/PatientDetail"
import { PatientForm } from "../components/PatientForm"
import { PatientTable } from "../components/PatientTable"
import { ConfirmDialog, Modal } from "../components/ui"
import { useToast } from "../context/ToastContext"
import { ApiError, deletePatient, getPatients, toPayload, updatePatient } from "../services/api"
import { formFromPatient } from "../utils/validation"

export function PatientsPage() {
  const { notify } = useToast()
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState("")
  const [field, setField] = useState("all")
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const [viewing, setViewing] = useState(null)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busyDelete, setBusyDelete] = useState(false)

  async function load(nextPage = page, nextQuery = query, nextField = field) {
    setError("")
    try {
      const response = await getPatients({ page: nextPage, perPage: 8, q: nextQuery.trim(), field: nextField })
      setResult(response.data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Patients could not be loaded.")
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      load(page, query, field)
    }, 250)
    return () => window.clearTimeout(timer)
  }, [page, query, field])

  async function saveEdit(values) {
    if (!editing) return
    try {
      const response = await updatePatient(editing.id, toPayload(values))
      notify("success", response.message || "Patient updated.")
      setEditing(null)
      await load()
    } catch (err) {
      notify("error", err instanceof ApiError ? err.message : "Update failed.")
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    setBusyDelete(true)
    try {
      const response = await deletePatient(deleting.id)
      notify("success", response.message || "Patient deleted.")
      setDeleting(null)
      await load()
    } catch (err) {
      notify("error", err instanceof ApiError ? err.message : "Delete failed.")
    } finally {
      setBusyDelete(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sky-100 sm:flex-row">
        <input
          value={query}
          onChange={(event) => {
            setPage(1)
            setQuery(event.target.value)
          }}
          placeholder="Search by name or email"
          className="flex-1 rounded-xl border border-sky-100 px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
        />
        <select
          value={field}
          onChange={(event) => {
            setPage(1)
            setField(event.target.value)
          }}
          className="rounded-xl border border-sky-100 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-sky-500"
        >
          <option value="all">Name and email</option>
          <option value="name">Name only</option>
          <option value="email">Email only</option>
        </select>
      </div>

      {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
      <PatientTable
        patients={result?.items ?? []}
        onView={setViewing}
        onEdit={setEditing}
        onDelete={setDeleting}
      />

      {result ? (
        <div className="flex items-center justify-between text-sm">
          <p className="text-slate-500">{result.total} stored record{result.total === 1 ? "" : "s"}</p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-xl bg-white px-3 py-2 font-semibold text-sky-800 ring-1 ring-sky-100 disabled:opacity-40">
              Previous
            </button>
            <span className="font-semibold">Page {result.page} of {result.pages}</span>
            <button type="button" disabled={page >= result.pages} onClick={() => setPage((current) => current + 1)} className="rounded-xl bg-white px-3 py-2 font-semibold text-sky-800 ring-1 ring-sky-100 disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      ) : null}

      {viewing ? (
        <Modal title={viewing.full_name} onClose={() => setViewing(null)}>
          <PatientDetail patient={viewing} />
        </Modal>
      ) : null}
      {editing ? (
        <Modal title={`Edit ${editing.full_name}`} onClose={() => setEditing(null)}>
          <PatientForm initial={formFromPatient(editing)} submitLabel="Save changes" onSubmit={saveEdit} />
          <p className="mt-3 text-xs text-slate-500">Changing a blood test value asks Gemini for a new remark. An email-only change keeps the existing remark.</p>
        </Modal>
      ) : null}
      {deleting ? (
        <ConfirmDialog
          title="Delete patient"
          message={`Delete ${deleting.full_name} (ID ${deleting.id}) from SQLite? This cannot be undone.`}
          confirmLabel="Delete record"
          busy={busyDelete}
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      ) : null}
    </div>
  )
}
