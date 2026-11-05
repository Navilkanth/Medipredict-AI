import { useEffect, useState } from "react"
import { PatientDetail } from "../components/PatientDetail"
import { PatientForm } from "../components/PatientForm"
import { PatientTable } from "../components/PatientTable"
import { ConfirmDialog, Modal, PageCard, StatusBadge } from "../components/ui"
import { useToast } from "../context/ToastContext"
import { ApiError, deletePatient, getPatients, importTestData, toPayload, updatePatient } from "../services/api"
import { formFromPatient } from "../utils/validation"

const REQUIRED_EMAIL = "gokul@infocare.com"

export function TestDataPage() {
  const { notify } = useToast()
  const [reset, setReset] = useState(true)
  const [busy, setBusy] = useState(false)
  const [report, setReport] = useState(null)
  const [patients, setPatients] = useState([])
  const [updateId, setUpdateId] = useState("")
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [editing, setEditing] = useState(null)
  const [actionBusy, setActionBusy] = useState(false)

  async function refreshPatients() {
    const response = await getPatients({ page: 1, perPage: 50 })
    setPatients(response.data.items)
    if (!updateId && response.data.items[0]) setUpdateId(String(response.data.items[0].id))
  }

  useEffect(() => {
    refreshPatients().catch(() => setPatients([]))
  }, [])

  async function runImport() {
    setBusy(true)
    try {
      const response = await importTestData(reset)
      setReport(response.data)
      notify("success", response.message || "Test records processed.")
      await refreshPatients()
    } catch (err) {
      notify("error", err instanceof ApiError ? err.message : "Import failed.")
    } finally {
      setBusy(false)
    }
  }

  async function applyRequiredEmail() {
    const patient = patients.find((item) => String(item.id) === updateId)
    if (!patient) {
      notify("error", "Choose a stored patient first.")
      return
    }
    setActionBusy(true)
    try {
      const response = await updatePatient(patient.id, {
        full_name: patient.full_name,
        dob: patient.dob,
        email: REQUIRED_EMAIL,
        glucose: patient.glucose,
        haemoglobin: patient.haemoglobin,
        cholesterol: patient.cholesterol,
      })
      notify("success", response.message || `Email updated to ${REQUIRED_EMAIL}.`)
      await refreshPatients()
    } catch (err) {
      notify("error", err instanceof ApiError ? err.message : "Email update failed.")
    } finally {
      setActionBusy(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setActionBusy(true)
    try {
      const response = await deletePatient(deleteTarget.id)
      notify("success", response.message || "Patient deleted.")
      setDeleteTarget(null)
      await refreshPatients()
    } catch (err) {
      notify("error", err instanceof ApiError ? err.message : "Delete failed.")
    } finally {
      setActionBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <PageCard
        title="Company test records"
        subtitle="All 10 supplied rows are sent unchanged. Invalid rows are rejected with a reason and are not saved."
      >
        <label className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input type="checkbox" checked={reset} onChange={(event) => setReset(event.target.checked)} />
          Clear existing patients before this run
        </label>
        <button type="button" onClick={runImport} disabled={busy} className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
          {busy ? "Processing..." : "Process all 10 records"}
        </button>
      </PageCard>

      {report ? (
        <PageCard title="Validation report" subtitle="Created rows are in SQLite. Rejected rows keep the original values in this report only.">
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <Count label="Attempted" value={report.attempted} />
            <Count label="Successfully created" value={report.created} />
            <Count label="Rejected" value={report.rejected} />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[860px] w-full text-left text-sm">
              <thead className="text-xs tracking-wide text-sky-900 uppercase">
                <tr>
                  {["Test", "Name", "Date", "Email", "Result", "Reason"].map((heading) => (
                    <th key={heading} className="px-2 py-2 font-bold">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.results.map((row) => (
                  <tr key={row.test_id} className="border-t border-sky-50 align-top">
                    <td className="px-2 py-2 font-bold">{row.test_id}</td>
                    <td className="px-2 py-2">{row.input.full_name}</td>
                    <td className="px-2 py-2">{row.input.dob}</td>
                    <td className="px-2 py-2">{row.input.email}</td>
                    <td className="px-2 py-2"><StatusBadge status={row.status} /></td>
                    <td className="px-2 py-2 text-slate-600">
                      {Object.keys(row.errors || {}).length
                        ? Object.entries(row.errors).map(([key, message]) => (
                            <p key={key}><span className="font-semibold">{key}:</span> {message}</p>
                          ))
                        : row.note || (row.ai_error ? `Saved. AI: ${row.ai_error}` : "Saved with the supplied values.")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PageCard>
      ) : null}

      <PageCard title="Required update" subtitle="Pick one saved patient and set the email to gokul@infocare.com.">
        <div className="flex flex-col gap-3 sm:flex-row">
          <select value={updateId} onChange={(event) => setUpdateId(event.target.value)} className="flex-1 rounded-xl border border-sky-100 px-3 py-2.5 text-sm">
            {patients.length === 0 ? <option value="">No stored patients</option> : null}
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                #{patient.id} {patient.full_name} — {patient.email}
              </option>
            ))}
          </select>
          <button type="button" onClick={applyRequiredEmail} disabled={actionBusy || patients.length === 0} className="rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">
            Update email
          </button>
        </div>
      </PageCard>

      <PageCard title="Remaining records" subtitle="This list is read from SQLite after create, update, and delete.">
        <PatientTable patients={patients} onView={setViewing} onEdit={setEditing} onDelete={setDeleteTarget} />
      </PageCard>

      {viewing ? (
        <Modal title={viewing.full_name} onClose={() => setViewing(null)}>
          <PatientDetail patient={viewing} />
        </Modal>
      ) : null}
      {editing ? (
        <Modal title={`Edit ${editing.full_name}`} onClose={() => setEditing(null)}>
          <PatientForm
            initial={formFromPatient(editing)}
            submitLabel="Save changes"
            onSubmit={async (values) => {
              try {
                const response = await updatePatient(editing.id, toPayload(values))
                notify("success", response.message || "Patient updated.")
                setEditing(null)
                await refreshPatients()
              } catch (err) {
                notify("error", err instanceof ApiError ? err.message : "Update failed.")
              }
            }}
          />
        </Modal>
      ) : null}

      {deleteTarget ? (
        <ConfirmDialog
          title="Delete patient"
          message={`Delete ${deleteTarget.full_name} (ID ${deleteTarget.id})? The row will be removed from SQLite.`}
          confirmLabel="Delete record"
          busy={actionBusy}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  )
}

function Count({ label, value }) {
  return (
    <div className="rounded-xl bg-sky-50 px-3 py-3">
      <p className="text-xs font-bold tracking-wide text-sky-800 uppercase">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
    </div>
  )
}
