const EMAIL_PATTERN =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/

const MONTHS = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

export function validateEmail(value) {
  const email = value.trim()
  if (!email) return "Email address is required."
  if (/\s/.test(email)) return "Email address cannot contain spaces."
  if (!email.includes("@")) return "Email address does not contain an @ symbol."
  if (!EMAIL_PATTERN.test(email)) return "Email address has an incomplete domain format."
  return null
}

export function validateDob(value) {
  const raw = value.trim()
  if (!raw) return "Date of birth is required."
  const match = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(raw)
  if (!match) return "Date of birth must be a real date in DD/MM/YYYY format."

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  if (year < 1900) return "Date of birth must be on or after 01/01/1900."
  if (month < 1 || month > 12) return `${raw} is not a real calendar date. Month must be between 01 and 12.`

  const lastDay = daysInMonth(year, month)
  if (day < 1 || day > lastDay) {
    return `${raw} is not a real calendar date. ${MONTHS[month]} has only ${lastDay} days.`
  }

  const today = new Date()
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const dob = new Date(year, month - 1, day)
  if (dob > current) {
    return `Date of birth ${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year} is in the future.`
  }
  return null
}

export function validateLab(value, label) {
  const text = value.trim()
  if (!text) return `${label} is required.`
  if (!/^\d+(\.\d+)?$/.test(text)) return `${label} must be a number.`
  const number = Number(text)
  if (!Number.isFinite(number)) return `${label} must be a finite number.`
  if (number < 0) return `${label} cannot be negative.`
  return null
}

export function validatePatientForm(values) {
  const errors = {}
  if (!values.full_name.trim()) errors.full_name = "Full name is required."
  else if (values.full_name.trim().length > 120) errors.full_name = "Full name must be 120 characters or fewer."

  const dobError = validateDob(values.dob)
  if (dobError) errors.dob = dobError

  const emailError = validateEmail(values.email)
  if (emailError) errors.email = emailError

  const glucoseError = validateLab(values.glucose, "Glucose")
  if (glucoseError) errors.glucose = glucoseError
  const haemoglobinError = validateLab(values.haemoglobin, "Haemoglobin")
  if (haemoglobinError) errors.haemoglobin = haemoglobinError
  const cholesterolError = validateLab(values.cholesterol, "Cholesterol")
  if (cholesterolError) errors.cholesterol = cholesterolError

  return errors
}

export function emptyPatientForm() {
  return {
    full_name: "",
    dob: "",
    email: "",
    glucose: "",
    haemoglobin: "",
    cholesterol: "",
  }
}

export function formFromPatient(patient) {
  return {
    full_name: patient.full_name,
    dob: patient.dob,
    email: patient.email,
    glucose: String(patient.glucose),
    haemoglobin: String(patient.haemoglobin),
    cholesterol: String(patient.cholesterol),
  }
}
