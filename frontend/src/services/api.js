export class ApiError extends Error {
  constructor(message, status, errors, code) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.errors = errors
    this.code = code
  }
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "")

async function request(path, init) {
  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    })
  } catch {
    throw new ApiError("The clinical server could not be reached. Please verify backend connectivity.", 0)
  }

  const body = await response.json().catch(() => null)
  if (!response.ok || !body?.success) {
    throw new ApiError(
      body?.message || "The request could not be completed.",
      response.status,
      body?.errors,
      body?.code,
    )
  }
  return { data: body.data, message: body.message }
}

export function getPatients(params) {
  const search = new URLSearchParams()
  search.set("page", String(params.page ?? 1))
  search.set("per_page", String(params.perPage ?? 8))
  if (params.q) search.set("q", params.q)
  if (params.field) search.set("field", params.field)
  return request(`/api/patients?${search.toString()}`)
}

export function getPatient(id) {
  return request(`/api/patients/${id}`)
}

export function createPatient(payload) {
  return request("/api/patients", { method: "POST", body: JSON.stringify(payload) })
}

export function updatePatient(id, payload) {
  return request(`/api/patients/${id}`, { method: "PUT", body: JSON.stringify(payload) })
}

export function deletePatient(id) {
  return request(`/api/patients/${id}`, { method: "DELETE" })
}

export function analyzeHealth(payload) {
  return request("/api/health/analyze", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function reanalyzePatient(id) {
  return request(`/api/patients/${id}/reanalyze`, { method: "POST" })
}

export function getDashboard() {
  return request("/api/dashboard/stats")
}

export function getHealthStatus() {
  return request("/api/health/status")
}

export function seedDatabase(clearExisting = true) {
  return request(`/api/seed?clear=${clearExisting ? "true" : "false"}`, {
    method: "POST",
  })
}

export function toPayload(values) {
  return {
    full_name: values.full_name.trim(),
    dob: values.dob.trim(),
    email: values.email.trim(),
    glucose: Number(values.glucose),
    haemoglobin: Number(values.haemoglobin),
    cholesterol: Number(values.cholesterol),
  }
}
