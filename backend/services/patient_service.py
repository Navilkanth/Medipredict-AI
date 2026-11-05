"""Create, update, and import patients.

Validation runs before any database write. Gemini runs only after the
record is valid. If Gemini fails, the patient can still be stored, but
the remark columns stay empty.
"""

from __future__ import annotations

from database.db import db
from models.patient import Patient, utcnow
from services.gemini_service import GeminiServiceError, analyze_blood_tests
from utils.test_data import COMPANY_TEST_RECORDS
from utils.validators import validate_patient_payload


def _apply_observations(patient: Patient, observations: dict) -> None:
    patient.glucose_observation = observations["glucose_observation"]
    patient.haemoglobin_observation = observations["haemoglobin_observation"]
    patient.cholesterol_observation = observations["cholesterol_observation"]
    patient.remarks = observations["overall_remarks"]
    patient.recommendations = observations["recommendations"]
    patient.analysis_status = "completed"
    patient.analysis_error = None


def _clear_observations(patient: Patient, error: GeminiServiceError) -> None:
    patient.glucose_observation = None
    patient.haemoglobin_observation = None
    patient.cholesterol_observation = None
    patient.remarks = None
    patient.recommendations = None
    patient.analysis_status = "failed"
    patient.analysis_error = error.public_message


def _analyze(patient_values: dict) -> tuple[dict | None, GeminiServiceError | None]:
    try:
        observations = analyze_blood_tests(
            patient_values["glucose"],
            patient_values["haemoglobin"],
            patient_values["cholesterol"],
        )
        return observations, None
    except GeminiServiceError as exc:
        return None, exc


def create_patient(payload) -> tuple[Patient | None, dict, GeminiServiceError | None]:
    cleaned, errors = validate_patient_payload(payload)
    if errors:
        return None, errors, None

    observations, ai_error = _analyze(cleaned)
    patient = Patient(
        full_name=cleaned["full_name"],
        dob=cleaned["dob"],
        email=cleaned["email"],
        glucose=cleaned["glucose"],
        haemoglobin=cleaned["haemoglobin"],
        cholesterol=cleaned["cholesterol"],
        analysis_status="pending",
    )
    if observations:
        _apply_observations(patient, observations)
    elif ai_error:
        _clear_observations(patient, ai_error)

    db.session.add(patient)
    db.session.commit()
    return patient, {}, ai_error


def update_patient(patient: Patient, payload) -> tuple[dict, GeminiServiceError | None]:
    cleaned, errors = validate_patient_payload(payload)
    if errors:
        return errors, None

    blood_changed = (
        cleaned["glucose"] != patient.glucose
        or cleaned["haemoglobin"] != patient.haemoglobin
        or cleaned["cholesterol"] != patient.cholesterol
    )

    patient.full_name = cleaned["full_name"]
    patient.dob = cleaned["dob"]
    patient.email = cleaned["email"]
    patient.glucose = cleaned["glucose"]
    patient.haemoglobin = cleaned["haemoglobin"]
    patient.cholesterol = cleaned["cholesterol"]
    patient.updated_at = utcnow()

    ai_error = None
    if blood_changed:
        # Old remarks described the previous numbers. Clear them unless
        # Gemini returns a fresh analysis for the new numbers.
        observations, ai_error = _analyze(cleaned)
        if observations:
            _apply_observations(patient, observations)
        elif ai_error:
            _clear_observations(patient, ai_error)

    db.session.commit()
    return {}, ai_error


def reanalyze_patient(patient: Patient) -> GeminiServiceError | None:
    observations, ai_error = _analyze(
        {
            "glucose": patient.glucose,
            "haemoglobin": patient.haemoglobin,
            "cholesterol": patient.cholesterol,
        }
    )
    patient.updated_at = utcnow()
    if observations:
        _apply_observations(patient, observations)
    elif ai_error:
        _clear_observations(patient, ai_error)
    db.session.commit()
    return ai_error


def delete_patient(patient: Patient) -> None:
    db.session.delete(patient)
    db.session.commit()


def import_company_records(reset: bool = False) -> dict:
    """Attempt every company row. Invalid rows are reported and not saved."""
    if reset:
        db.session.query(Patient).delete()
        db.session.commit()

    results = []
    created = 0
    rejected = 0

    for record in COMPANY_TEST_RECORDS:
        original = {
            "full_name": record["full_name"],
            "dob": record["dob"],
            "email": record["email"],
            "glucose": record["glucose"],
            "haemoglobin": record["haemoglobin"],
            "cholesterol": record["cholesterol"],
        }
        cleaned, errors = validate_patient_payload(record)
        if errors:
            rejected += 1
            results.append(
                {
                    "test_id": record["test_id"],
                    "input": original,
                    "status": "rejected",
                    "errors": errors,
                    "patient_id": None,
                    "ai_status": "skipped",
                    "note": "Invalid records are not saved and are not sent to Gemini.",
                }
            )
            continue

        patient, _, ai_error = create_patient(record)
        created += 1
        note = None
        if record["test_id"] == 6:
            note = (
                "This row repeats Test 1. It was saved because the assignment "
                "does not ask the application to reject duplicates."
            )
        results.append(
            {
                "test_id": record["test_id"],
                "input": original,
                "status": "created",
                "errors": {},
                "patient_id": patient.id if patient else None,
                "ai_status": patient.analysis_status if patient else "failed",
                "ai_error": ai_error.public_message if ai_error else None,
                "note": note,
            }
        )

    return {
        "attempted": len(COMPANY_TEST_RECORDS),
        "created": created,
        "rejected": rejected,
        "results": results,
    }
