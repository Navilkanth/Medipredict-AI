from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# In Vercel serverless lambdas, only /tmp is writable
if not os.getenv("DATABASE_URL") and os.getenv("VERCEL"):
    tmp_db = Path("/tmp") / "medipredict.db"
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_db.as_posix()}"

from app import create_app

app = create_app()
