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
      notify("success", response.message || "Patient saved.")
      setFormKey((current) => current + 1)
      navigate("/patients")
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "The patient could not be saved."
      const details = err instanceof ApiError && err.errors ? Object.values(err.errors).join(" ") : ""
      notify("error", details ? `${message} ${details}` : message)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageCard
        title="Register a patient"
        subtitle="Every field is required. Invalid dates, emails, and negative lab values are rejected by the browser and again by Flask."
      >
        <PatientForm key={formKey} submitLabel="Save and request AI remarks" onSubmit={handleSubmit} />
      </PageCard>
    </div>
  )
}
