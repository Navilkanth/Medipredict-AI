"""Server-side patient validation.

The React form repeats these checks so the user gets instant feedback.
The API still validates every field independently on the server.
Validation enforces:
- Full name required, max 120 characters
- Valid RFC-5322 email syntax with complete domain
- Real calendar date of birth (valid days per month, leap years)
- DOB cannot be in the future
- Strictly numeric, non-negative lab values (Glucose, Haemoglobin, Cholesterol)
"""

from __future__ import annotations

import calendar
import math
import re
from datetime import date, datetime

EMAIL_PATTERN = re.compile(
    r"^[A-Za-z0-9._%+\-]+@"
    r"[A-Za-z0-9](?:[A-Za-z0-9\-]{0,61}[A-Za-z0-9])?"
    r"(?:\.[A-Za-z0-9](?:[A-Za-z0-9\-]{0,61}[A-Za-z0-9])?)*"
    r"\.[A-Za-z]{2,}$"
)

DATE_PATTERN = re.compile(r"^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$")

MONTH_NAMES = (
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
)

LAB_FIELDS = (
    ("glucose", "Glucose"),
    ("haemoglobin", "Haemoglobin"),
    ("cholesterol", "Cholesterol"),
)


def _first(data: dict, *keys):
    for key in keys:
        if key in data and data[key] is not None:
            return data[key]
    return None


def validate_email(value) -> str | None:
    if value is None or str(value).strip() == "":
        return "Email address is required."
    email = str(value).strip()
    if any(character.isspace() for character in email):
        return "Email address cannot contain spaces."
    if "@" not in email:
        return "Email address does not contain an @ symbol."
    if not EMAIL_PATTERN.fullmatch(email):
        return "Email address has an incomplete domain format."
    return None


def validate_dob(value, today: date | None = None) -> tuple[date | None, str | None]:
    """Parse DD/MM/YYYY or DD.MM.YYYY. Never rewrite an invalid date."""
    if value is None or str(value).strip() == "":
        return None, "Date of birth is required."

    raw = str(value).strip()
    match = DATE_PATTERN.fullmatch(raw)
    if not match:
        return None, "Date of birth must be a real date in DD/MM/YYYY format."

    day = int(match.group(1))
    month = int(match.group(2))
    year = int(match.group(3))

    if year < 1900:
        return None, "Date of birth must be on or after 01/01/1900."
    if month < 1 or month > 12:
        return None, f"{raw} is not a real calendar date. Month must be between 01 and 12."

    last_day = calendar.monthrange(year, month)[1]
    if day < 1 or day > last_day:
        month_name = MONTH_NAMES[month]
        return (
            None,
            f"{raw} is not a real calendar date. {month_name} has only {last_day} days.",
        )

    parsed = datetime(year, month, day).date()
    current_day = today or date.today()
    if parsed > current_day:
        return None, f"Date of birth {parsed.strftime('%d/%m/%Y')} is in the future."
    return parsed, None


def validate_lab_value(value, label: str) -> tuple[float | None, str | None]:
    """Accept integers and decimals. Reject blanks, text, and negatives.

    Booleans are rejected on purpose. In Python, bool is a subclass of int,
    so True would otherwise be stored as 1.0.
    """
    if isinstance(value, bool) or value is None:
        return None, f"{label} is required." if value is None else f"{label} must be a number."

    if isinstance(value, str):
        text = value.strip()
        if text == "":
            return None, f"{label} is required."
        try:
            number = float(text)
        except ValueError:
            return None, f"{label} must be a number."
    elif isinstance(value, (int, float)):
        number = float(value)
    else:
        return None, f"{label} must be a number."

    if math.isnan(number) or math.isinf(number):
        return None, f"{label} must be a finite number."
    if number < 0:
        return None, f"{label} cannot be negative."
    return number, None


def validate_patient_payload(data) -> tuple[dict | None, dict]:
    """Return cleaned values, or field errors. An empty error dict means valid."""
    if not isinstance(data, dict):
        return None, {"body": "Patient details must be sent as a JSON object."}

    errors: dict[str, str] = {}

    raw_name = _first(data, "full_name", "fullName")
    if raw_name is None or str(raw_name).strip() == "":
        errors["full_name"] = "Full name is required."
        full_name = None
    else:
        full_name = str(raw_name).strip()
        if len(full_name) > 120:
            errors["full_name"] = "Full name must be 120 characters or fewer."

    dob, dob_error = validate_dob(_first(data, "dob", "date_of_birth", "dateOfBirth"))
    if dob_error:
        errors["dob"] = dob_error

    email_error = validate_email(_first(data, "email"))
    email = None if email_error else str(_first(data, "email")).strip()
    if email_error:
        errors["email"] = email_error

    numbers = {}
    for key, label in LAB_FIELDS:
        number, number_error = validate_lab_value(_first(data, key), label)
        if number_error:
            errors[key] = number_error
        else:
            numbers[key] = number

    if errors:
        return None, errors

    return {
        "full_name": full_name,
        "dob": dob,
        "email": email,
        "glucose": numbers["glucose"],
        "haemoglobin": numbers["haemoglobin"],
        "cholesterol": numbers["cholesterol"],
    }, {}
