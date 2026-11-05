# MediPredict AI

Intelligent patient health prediction and management system. The React dashboard talks to a Flask API. Patient rows live in SQLite. Valid blood test values are sent to Google Gemini, and the returned remarks are stored with the patient.

This is a Python skills evaluation project. The interface is JavaScript (React + Vite), not TypeScript.

## Features

- Register, search, update, and delete patients.
- Validate name, date of birth, email, glucose, haemoglobin, and cholesterol in the browser and again in Flask.
- Process the 10 company test records without changing the supplied values.
- Reject invalid emails and impossible or future dates, and explain why.
- Keep the duplicate Robyn Pears row, because the assignment does not ask for duplicate rejection.
- Ask Gemini for structured observations and store them only when the API returns usable JSON.
- Leave remarks empty when Gemini fails, so the user can retry.
- Dashboard totals, charts, and recent remarks are calculated from the database.

## Technology stack

- React, Vite, JavaScript, Tailwind CSS, Lucide React, Recharts
- Python, Flask, Flask-CORS, Flask-SQLAlchemy
- SQLite
- Google GenAI Python SDK

## Architecture

The browser never holds the Gemini key. Vite proxies `/api` to Flask on port 5000.

1. The form checks the fields.
2. `POST /api/patients` checks them again in `utils/validators.py`.
3. A valid row is sent to `services/gemini_service.py`.
4. SQLAlchemy writes the patient, and the remarks if Gemini succeeded, to `backend/database/medipredict.db`.

## Project structure

```text
medipredict-ai/
  frontend/          React dashboard (JavaScript)
    src/components/  Forms, table, charts, dialogs
    src/pages/       Dashboard, patients, analytics, AI, settings, test data
    src/services/    API client
  backend/
    app.py           Flask app and error handlers
    config.py        Environment settings
    models/patient.py
    routes/          patients, health, dashboard
    services/        Gemini and patient workflows
    utils/           validators, test data, JSON responses
    database/db.py   SQLite startup
  README.md
  .gitignore
```

## Installation

Use two terminals from the project folder.

### Backend

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Open `.env` and set `GEMINI_API_KEY` to your Google AI Studio key. The database file is created the first time Flask starts. You do not run a separate database setup step.

```powershell
venv\Scripts\python app.py
```

The API listens on http://127.0.0.1:5000.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open http://127.0.0.1:5173.

## Gemini configuration

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Server-only key. Leave it out of the React app and out of git. |
| `GEMINI_MODEL` | Defaults to `gemini-3.1-flash-lite` (with intelligent fallback to `gemini-3.8-flash` if transient high demand occurs). |
| `GEMINI_TIMEOUT_SECONDS` | Request limit. Default 30. |

If the key is missing, the quota is exceeded, the response is not valid JSON, or the call times out, the patient can still be saved. Remarks stay empty and the screen shows a retry action.

## API endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/patients` | Create a patient |
| GET | `/api/patients` | List patients, with `q`, `field`, `page`, `per_page` |
| GET | `/api/patients/<id>` | One patient |
| PUT | `/api/patients/<id>` | Update a patient |
| DELETE | `/api/patients/<id>` | Delete a patient |
| POST | `/api/health/analyze` | Analyse three lab values |
| POST | `/api/patients/<id>/reanalyze` | Regenerate remarks |
| POST | `/api/patients/import-test-data` | Process the 10 company rows |
| GET | `/api/dashboard/stats` | Dashboard numbers |
| GET | `/api/health/status` | Backend, database, and Gemini configuration |

## Assignment walkthrough

1. Open **Test Data**.
2. Leave “Clear existing patients” checked and click **Process all 10 records**.
3. Read the report. Expect 7 created and 3 rejected:
   - Test 2: `hunter@gmail` has an incomplete domain.
   - Test 4: `31.11.2001` is not a real date. November has 30 days.
   - Test 8: `19.10.2030` is in the future, and `Kris.wu.gmail.com` has no `@`.
4. Test 6 is the same person as Test 1 and is saved on purpose.
5. Use **Update email** to set one saved patient to `gokul@infocare.com`.
6. Delete one saved patient from the remaining list and confirm the dialog.
7. The table reloads from SQLite and shows who is left.

## Screenshots

Capture these after the app is running:

1. Dashboard with live totals and charts.
2. Patient table after the test import.
3. Validation report showing the three rejected rows.
4. AI analysis detail for one patient.
5. Success toast after the email update and after delete.

## GitHub

```powershell
git init
git add .
git commit -m "Add MediPredict AI patient dashboard"
git branch -M main
git remote add origin https://github.com/<your-user>/medipredict-ai.git
git push -u origin main
```

Do not commit `backend/.env`, `backend/venv`, or `frontend/node_modules`. Those paths are listed in `.gitignore`.
