import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { PatientForm } from "../components/PatientForm"
import { PageCard } from "../components/ui"
import { useToast } from "../context/ToastContext"
import { ApiError, createPatient, toPayload } from "../services/api"

export function AddPatientPage() {
  const { notify } = useToast()
  const navigate = useNavigate()
  const [formKey, setFormKey] = useState(0)

  async function handleSubmit(values) {
    try {
      const response = await createPatient(toPayload(values))
      notify("success", response.message || "Patient successfully registered.")
      setFormKey((current) => current + 1)
      navigate("/patients")
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "The patient record could not be saved."
      const details = err instanceof ApiError && err.errors ? Object.values(err.errors).join(" ") : ""
      notify("error", details ? `${message} ${details}` : message)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageCard
        title="Patient Registration & Laboratory Intake"
        subtitle="Complete the clinical intake form below. All physiological metrics undergo immediate validation and clinical health analysis."
      >
        <PatientForm
          key={formKey}
          submitLabel="Register Patient & Generate Analysis"
          onSubmit={handleSubmit}
        />
      </PageCard>
    </div>
  )
}
