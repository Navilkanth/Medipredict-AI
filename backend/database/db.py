

from __future__ import annotations

from pathlib import Path

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def _ensure_sqlite_parent(uri: str) -> None:
    if not uri.startswith("sqlite:///"):
        return
    if uri in {"sqlite://", "sqlite:///:memory:"} or uri.endswith(":memory:"):
        return
    raw_path = uri[len("sqlite:///") :]
    path = Path(raw_path)
    if path.parent and str(path.parent) not in {"", "."}:
        path.parent.mkdir(parents=True, exist_ok=True)


def init_db(app) -> None:
    uri = app.config["SQLALCHEMY_DATABASE_URI"]
    _ensure_sqlite_parent(uri)

    engine_options = dict(app.config.get("SQLALCHEMY_ENGINE_OPTIONS") or {})
    if uri.startswith("sqlite"):
        # Flask can use more than one thread. SQLite needs this flag
        # so those threads can share the same database file.
        engine_options["connect_args"] = {"check_same_thread": False}
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = engine_options

    db.init_app(app)
    with app.app_context():
        from models.patient import Patient  # noqa: F401

        db.create_all()

        try:
            if Patient.query.first() is None:
                from services.patient_service import seed_patient_records
                seed_patient_records(clear_existing=False)
        except Exception:
            pass
