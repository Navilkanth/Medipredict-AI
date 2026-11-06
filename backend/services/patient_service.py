"""Create, update, and import patients.

Validation runs before any database write. Gemini runs only after the
record is valid. If Gemini fails, the patient can still be stored, but
the remark columns stay empty.
"""

from __future__ import annotations

from database.db import db
from models.patient import Patient, utcnow
from services.gemini_service import GeminiServiceError, analyze_blood_tests
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
