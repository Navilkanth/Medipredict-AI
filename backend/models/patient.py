"""Patient table.

One row is one registered patient plus the latest AI observations.
Invalid company test rows are never inserted.
"""

from __future__ import annotations

from datetime import datetime, timezone

from database.db import db


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Patient(db.Model):
    __tablename__ = "patients"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False, index=True)
    dob = db.Column(db.Date, nullable=False)
    email = db.Column(db.String(254), nullable=False, index=True)
    glucose = db.Column(db.Float, nullable=False)
    haemoglobin = db.Column(db.Float, nullable=False)
    cholesterol = db.Column(db.Float, nullable=False)

    # These stay empty when Gemini does not return a usable analysis.
    # The application must not fill them with invented text.
    glucose_observation = db.Column(db.Text, nullable=True)
    haemoglobin_observation = db.Column(db.Text, nullable=True)
    cholesterol_observation = db.Column(db.Text, nullable=True)
    remarks = db.Column(db.Text, nullable=True)
    recommendations = db.Column(db.Text, nullable=True)

    # pending: not successfully analysed yet
    # completed: Gemini returned every required field
    # failed: the API call failed or the response could not be parsed
    analysis_status = db.Column(db.String(20), nullable=False, default="pending")
    analysis_error = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "full_name": self.full_name,
            "dob": self.dob.strftime("%d/%m/%Y") if self.dob else None,
            "email": self.email,
            "glucose": self.glucose,
            "haemoglobin": self.haemoglobin,
            "cholesterol": self.cholesterol,
            "glucose_observation": self.glucose_observation,
            "haemoglobin_observation": self.haemoglobin_observation,
            "cholesterol_observation": self.cholesterol_observation,
            "remarks": self.remarks,
            "recommendations": self.recommendations,
            "analysis_status": self.analysis_status,
            "analysis_error": self.analysis_error,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
