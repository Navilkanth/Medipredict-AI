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


class VercelPathFix:
    """Ensure Flask PATH_INFO matches the original requested path before Vercel rewrites."""

    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        orig_path = (
            environ.get("HTTP_X_MATCHED_PATH")
            or environ.get("HTTP_X_VERCEL_MATCHED_PATH")
            or environ.get("HTTP_X_FORWARDED_PATH")
            or environ.get("HTTP_X_ORIGINAL_URL")
        )
        if orig_path:
            path_only = orig_path.split("?")[0]
            if (
                not path_only.endswith("/index.py")
                and not path_only.endswith("/index")
                and path_only != "/api"
            ):
                environ["PATH_INFO"] = path_only
        return self.wsgi_app(environ, start_response)


app.wsgi_app = VercelPathFix(app.wsgi_app)
