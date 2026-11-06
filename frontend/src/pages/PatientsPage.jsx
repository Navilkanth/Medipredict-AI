import { useEffect, useState } from "react"
import { Search, ChevronLeft, ChevronRight, UserPlus, Filter } from "lucide-react"
import { Link } from "react-router-dom"
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
      const response = await getPatients({
        page: nextPage,
        perPage: 8,
        q: nextQuery.trim(),
        field: nextField,
      })
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
      notify("success", response.message || "Patient record updated successfully.")
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
      notify("success", response.message || "Patient deleted successfully.")
      setDeleting(null)
      await load()
    } catch (err) {
      notify("error", err instanceof ApiError ? err.message : "Delete failed.")
    } finally {
      setBusyDelete(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Search & Actions Bar */}
      <div className="flex flex-col gap-3.5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sky-100 transition-colors dark:bg-[#111827] dark:ring-slate-800 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-slate-400" />
          <input
            value={query}
            onChange={(event) => {
              setPage(1)
              setQuery(event.target.value)
            }}
            placeholder="Search patients by full name or email address..."
            className="w-full rounded-xl border border-sky-100 bg-white py-2.5 pl-10 pr-4 text-base font-medium outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-[#111827] dark:text-white dark:focus:ring-sky-900/40"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <select
              value={field}
              onChange={(event) => {
                setPage(1)
                setField(event.target.value)
              }}
              className="appearance-none rounded-xl border border-sky-100 bg-white py-2.5 pl-3.5 pr-8 text-sm font-bold text-slate-700 outline-none transition focus:border-sky-500 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-200"
            >
              <option value="all">Search: All Fields</option>
              <option value="name">Search: Name Only</option>
              <option value="email">Search: Email Only</option>
            </select>
            <Filter className="pointer-events-none absolute right-2.5 top-3 size-4 text-slate-400" />
          </div>

          <Link
            to="/patients/new"
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
          >
            <UserPlus className="size-4" />
            <span className="hidden sm:inline">Add Patient</span>
          </Link>
        </div>
      </div>

      {error ? <p className="text-sm font-medium text-rose-700 dark:text-rose-400">{error}</p> : null}

      {/* Main Table */}
      <PatientTable
        patients={result?.items ?? []}
        onView={setViewing}
        onEdit={setEditing}
        onDelete={setDeleting}
      />

      {/* Pagination */}
      {result && result.total > 0 ? (
        <div className="flex flex-col items-center justify-between gap-3 text-sm sm:flex-row">
          <p className="font-medium text-slate-500 dark:text-slate-400">
            Showing <span className="font-bold text-[#0f2744] dark:text-white">{result.items.length}</span> of{" "}
            <span className="font-bold text-[#0f2744] dark:text-white">{result.total}</span> registered patients
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
              className="flex items-center gap-1 rounded-xl bg-white px-3.5 py-2 font-bold text-sky-800 shadow-sm ring-1 ring-sky-100 transition hover:bg-sky-50 disabled:opacity-40 dark:bg-[#111827] dark:text-sky-300 dark:ring-slate-800 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="size-4" /> Previous
            </button>
            <span className="px-2 font-bold text-slate-600 dark:text-slate-300">
              Page {result.page} of {result.pages}
            </span>
            <button
              type="button"
              disabled={page >= result.pages}
              onClick={() => setPage((current) => current + 1)}
              className="flex items-center gap-1 rounded-xl bg-white px-3.5 py-2 font-bold text-sky-800 shadow-sm ring-1 ring-sky-100 transition hover:bg-sky-50 disabled:opacity-40 dark:bg-[#111827] dark:text-sky-300 dark:ring-slate-800 dark:hover:bg-slate-800"
            >
              Next <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      ) : null}

      {/* View Detail Modal */}
      {viewing ? (
        <Modal title={`Patient Profile: ${viewing.full_name}`} onClose={() => setViewing(null)}>
          <PatientDetail patient={viewing} />
        </Modal>
      ) : null}

      {/* Edit Modal */}
      {editing ? (
        <Modal title={`Edit Patient Details — ${editing.full_name}`} onClose={() => setEditing(null)}>
          <PatientForm
            initial={formFromPatient(editing)}
            submitLabel="Save Changes"
            onSubmit={saveEdit}
          />
          <p className="mt-4 rounded-xl bg-sky-50 p-3 text-xs leading-relaxed text-sky-800 dark:bg-slate-800/60 dark:text-sky-300">
            Note: Modifying blood test parameters automatically updates clinical observations. Updating contact information preserves prior clinical notes.
          </p>
        </Modal>
      ) : null}

      {/* Delete Confirmation Modal */}
      {deleting ? (
        <ConfirmDialog
          title="Confirm Patient Record Deletion"
          message={`Are you sure you want to permanently delete ${deleting.full_name} (Record ID #${deleting.id})? This clinical record will be removed.`}
          confirmLabel="Delete Record"
          busy={busyDelete}
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      ) : null}
    </div>
  )
}
