"""AI analysis and service health."""

from __future__ import annotations

from flask import Blueprint, request
from sqlalchemy import text

from config import Config
from database.db import db
from services.gemini_service import GeminiServiceError, analyze_blood_tests, gemini_is_configured
from utils.responses import fail, ok
from utils.validators import validate_lab_value

health_bp = Blueprint("health", __name__)


@health_bp.get("/health/status")
def health_status():
    database_ok = True
    database_message = "connected"
    try:
        db.session.execute(text("SELECT 1"))
    except Exception:
        database_ok = False
        database_message = "unavailable"

    uri = Config.SQLALCHEMY_DATABASE_URI
    if uri.startswith("sqlite"):
        engine = "sqlite"
    elif uri.startswith("postgres"):
        engine = "postgresql"
    else:
        engine = "other"

    return ok(
        {
            "backend": "ok",
            "database": database_message if database_ok else "unavailable",
            "database_engine": engine,
            "gemini_configured": gemini_is_configured(),
            "gemini_model": Config.GEMINI_MODEL,
        }
    )


@health_bp.post("/health/analyze")
def analyze():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return fail("Request body must be a JSON object.", 400)

    errors = {}
    values = {}
    for key, label in (
        ("glucose", "Glucose"),
        ("haemoglobin", "Haemoglobin"),
        ("cholesterol", "Cholesterol"),
    ):
        number, error = validate_lab_value(data.get(key), label)
        if error:
            errors[key] = error
        else:
            values[key] = number
    if errors:
        return fail("Blood test values are not valid.", 400, errors)

    try:
        observations = analyze_blood_tests(
            values["glucose"],
            values["haemoglobin"],
            values["cholesterol"],
        )
    except GeminiServiceError as exc:
        return fail(exc.public_message, exc.http_status, code=exc.code)

    return ok(observations, "Preliminary observations generated. This is not a diagnosis.")
