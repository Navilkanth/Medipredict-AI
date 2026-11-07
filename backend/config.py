"""Application settings.

Values come from the environment or from backend/.env. The Gemini API key
is read only on the server. The React app never receives it.

DATABASE_URL chooses the persistent database:

- Default: a SQLite file at backend/database/medipredict.db
  This matches the assignment and survives a restart.
- Optional: a PostgreSQL URL. SQLAlchemy uses the same Patient model.
  Example: postgresql+psycopg://user:password@localhost:5432/medipredict
"""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_SQLITE_PATH = BASE_DIR / "database" / "medipredict.db"
DEFAULT_SQLITE_URL = "sqlite:///" + DEFAULT_SQLITE_PATH.as_posix()

load_dotenv(BASE_DIR / ".env", override=True)


def normalize_database_url(url: str) -> str:
    """Accept the short postgres:// form used by some hosts."""
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url[len("postgres://") :]
    if url.startswith("postgresql://") and "+psycopg" not in url:
        return "postgresql+psycopg://" + url[len("postgresql://") :]
    return url


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-change-me")
    SQLALCHEMY_DATABASE_URI = normalize_database_url(
        os.getenv("DATABASE_URL", DEFAULT_SQLITE_URL)
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    GEMINI_API_KEY = (
        os.getenv("GEMINI_API_KEY")
        or os.getenv("gemini")
        or os.getenv("GEMINI")
        or ""
    ).strip()
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite").strip()
    GEMINI_TIMEOUT_SECONDS = int(os.getenv("GEMINI_TIMEOUT_SECONDS", "30"))
    PORT = int(os.getenv("PORT", "5000"))
