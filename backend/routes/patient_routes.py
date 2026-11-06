"""Patient management REST endpoints."""

from __future__ import annotations

from flask import Blueprint, request
from sqlalchemy import or_

from database.db import db
from models.patient import Patient
from services.patient_service import (
    create_patient,
    delete_patient,
    reanalyze_patient,
    update_patient,
)
from utils.responses import fail, ok

patient_bp = Blueprint("patients", __name__)


def _payload():
    data = request.get_json(silent=True)
    if data is None:
        return None
    return data


def _get_patient(patient_id: int) -> Patient | None:
    return db.session.get(Patient, patient_id)


def _search_filter(query: str, field: str):
    escaped = query.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    pattern = f"%{escaped}%"
    name_match = Patient.full_name.ilike(pattern, escape="\\")
    email_match = Patient.email.ilike(pattern, escape="\\")
    if field == "name":
        return name_match
    if field == "email":
        return email_match
    return or_(name_match, email_match)


@patient_bp.get("/patients")
def list_patients():
    page = request.args.get("page", default=1, type=int) or 1
    per_page = request.args.get("per_page", default=8, type=int) or 8
    page = max(page, 1)
    per_page = min(max(per_page, 1), 50)
    query_text = (request.args.get("q") or "").strip()
    field = (request.args.get("field") or "all").strip().lower()
    if field not in {"all", "name", "email"}:
        field = "all"

    query = db.session.query(Patient)
    if query_text:
        query = query.filter(_search_filter(query_text, field))

    total = query.count()
    pages = max((total + per_page - 1) // per_page, 1)
    if page > pages:
        page = pages

    items = (
        query.order_by(Patient.id.asc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    return ok(
        {
            "items": [patient.to_dict() for patient in items],
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": pages,
        }
    )


@patient_bp.get("/patients/<int:patient_id>")
def get_patient(patient_id: int):
    patient = _get_patient(patient_id)
    if patient is None:
        return fail("Patient not found.", 404)
    return ok(patient.to_dict())


@patient_bp.post("/patients")
def post_patient():
    data = _payload()
    if not isinstance(data, dict):
        return fail("Request body must be a JSON object.", 400)
    patient, errors, ai_error = create_patient(data)
    if errors:
        return fail("Patient details are not valid. Nothing was saved.", 400, errors)
    message = "Patient record saved."
    if ai_error:
        message = "Patient record registered. Clinical analysis pending review."
    elif patient and patient.analysis_status == "completed":
        message = "Patient registered and clinical observations generated."
    return ok(patient.to_dict(), message, 201)


@patient_bp.put("/patients/<int:patient_id>")
def put_patient(patient_id: int):
    patient = _get_patient(patient_id)
    if patient is None:
        return fail("Patient not found.", 404)
    data = _payload()
    if not isinstance(data, dict):
        return fail("Request body must be a JSON object.", 400)
    errors, ai_error = update_patient(patient, data)
    if errors:
        return fail("Patient details are not valid. Nothing was changed.", 400, errors)
    message = "Patient updated."
    if ai_error:
        message = (
            "Patient record updated. Biomarker analysis could not be refreshed. You can retry."
        )
    return ok(patient.to_dict(), message)


@patient_bp.delete("/patients/<int:patient_id>")
def remove_patient(patient_id: int):
    patient = _get_patient(patient_id)
    if patient is None:
        return fail("Patient not found.", 404)
    delete_patient(patient)
    return ok(message="Patient deleted.")


@patient_bp.post("/patients/<int:patient_id>/reanalyze")
def post_reanalyze(patient_id: int):
    patient = _get_patient(patient_id)
    if patient is None:
        return fail("Patient not found.", 404)
    ai_error = reanalyze_patient(patient)
    if ai_error:
        return fail(ai_error.public_message, ai_error.http_status, code=ai_error.code)
    return ok(patient.to_dict(), "Clinical observations generated.")
