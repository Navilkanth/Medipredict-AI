"""MediPredict AI Flask application.

Start from the backend folder:

    venv\\Scripts\\python app.py

The React app calls the routes under /api. SQLite is created on startup
if the database file does not exist yet.
"""

from __future__ import annotations

import sys
from pathlib import Path

from flask import Flask
from flask_cors import CORS

BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from config import Config
from database.db import init_db
from routes.dashboard_routes import dashboard_bp
from routes.health_routes import health_bp
from routes.patient_routes import patient_bp
from utils.responses import fail, ok


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    init_db(app)

    app.register_blueprint(patient_bp, url_prefix="/api")
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(dashboard_bp, url_prefix="/api")

    @app.get("/")
    def root():
        return ok(
            {
                "name": "MediPredict AI",
                "endpoints": [
                    "POST /api/patients",
                    "GET /api/patients",
                    "GET /api/patients/<id>",
                    "PUT /api/patients/<id>",
                    "DELETE /api/patients/<id>",
                    "POST /api/health/analyze",
                    "POST /api/patients/<id>/reanalyze",
                    "GET /api/dashboard/stats",
                    "GET /api/health/status",
                ],
            }
        )

    @app.errorhandler(404)
    def not_found(_error):
        return fail("The requested resource was not found.", 404)

    @app.errorhandler(405)
    def method_not_allowed(_error):
        return fail("This HTTP method is not allowed for that URL.", 405)

    @app.errorhandler(500)
    def server_error(_error):
        return fail("The server could not complete that request.", 500)

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=Config.PORT, debug=True)
