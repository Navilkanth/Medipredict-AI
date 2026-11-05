"""Dashboard numbers calculated from stored patients."""

from __future__ import annotations

from collections import Counter

from flask import Blueprint
from sqlalchemy import func

from database.db import db
from models.patient import Patient
from utils.reference_ranges import (
    CHOLESTEROL_BANDS,
    GLUCOSE_BANDS,
    GLUCOSE_HIGH_FROM,
    HAEMOGLOBIN_BANDS,
    cholesterol_band,
    glucose_band,
    haemoglobin_band,
)
from utils.responses import ok

dashboard_bp = Blueprint("dashboard", __name__)


def _band_counts(patients, band_fn, labels) -> list[dict]:
    counts = Counter(band_fn(patient) for patient in patients)
    return [{"label": label, "count": counts.get(label, 0)} for label in labels]


def _band_fn_glucose(patient: Patient) -> str:
    return glucose_band(patient.glucose)


def _band_fn_cholesterol(patient: Patient) -> str:
    return cholesterol_band(patient.cholesterol)


def _band_fn_haemoglobin(patient: Patient) -> str:
    return haemoglobin_band(patient.haemoglobin)


def _average(values: list[float]) -> float | None:
    if not values:
        return None
    return round(sum(values) / len(values), 2)


@dashboard_bp.get("/dashboard/stats")
def dashboard_stats():
    patients = db.session.query(Patient).order_by(Patient.created_at.desc()).all()
    total = len(patients)
    pending = sum(1 for patient in patients if patient.analysis_status != "completed")
    high_glucose = sum(1 for patient in patients if patient.glucose >= GLUCOSE_HIGH_FROM)

    registration_rows = (
        db.session.query(func.date(Patient.created_at), func.count(Patient.id))
        .group_by(func.date(Patient.created_at))
        .order_by(func.date(Patient.created_at).asc())
        .all()
    )

    recent = patients[:5]
    recent_remarks = [
        patient for patient in patients if patient.analysis_status == "completed" and patient.remarks
    ][:5]

    glucose_values = [patient.glucose for patient in patients]
    haemoglobin_values = [patient.haemoglobin for patient in patients]
    cholesterol_values = [patient.cholesterol for patient in patients]

    return ok(
        {
            "total_patients": total,
            "valid_records": total,
            "pending_ai": pending,
            "high_glucose": high_glucose,
            "high_glucose_threshold": GLUCOSE_HIGH_FROM,
            "registration_by_day": [
                {"date": str(day), "count": count} for day, count in registration_rows
            ],
            "recent_patients": [patient.to_dict() for patient in recent],
            "recent_remarks": [
                {
                    "id": patient.id,
                    "full_name": patient.full_name,
                    "remarks": patient.remarks,
                    "updated_at": patient.updated_at.isoformat() if patient.updated_at else None,
                }
                for patient in recent_remarks
            ],
            "blood_tests": {
                "average_glucose": _average(glucose_values),
                "average_haemoglobin": _average(haemoglobin_values),
                "average_cholesterol": _average(cholesterol_values),
                "glucose_distribution": _band_counts(patients, _band_fn_glucose, GLUCOSE_BANDS),
                "cholesterol_distribution": _band_counts(
                    patients, _band_fn_cholesterol, CHOLESTEROL_BANDS
                ),
                "haemoglobin_distribution": _band_counts(
                    patients, _band_fn_haemoglobin, HAEMOGLOBIN_BANDS
                ),
            },
        }
    )
