# MediPredict AI – Intelligent Patient Health Prediction & Management System

MediPredict AI is an enterprise-grade full-stack healthcare platform engineered for clinical patient management, physiological biomarker validation, and automated health assessment using Google Gemini.

Live:  https://medipredict-ai-beta-five.vercel.app/
---

## Key Features

- **Clinical Patient Directory:** Complete CRUD operations (Register, Inspect, Modify, and Remove patient records).
- **Dual-Layer Validation:** Strict demographic and physiological validation on both client (React) and server (Flask Python).
- **Automated Clinical Observations:** Automated adult reference range comparison and clinical observations powered by the Google GenAI Python SDK (`gemini-3.1-flash-lite` with high-demand fallbacks).
- **Live Biomarker Evaluator:** Interactive sandbox to test blood metrics on-demand via `POST /api/health/analyze`.
- **Epidemiological Health Analytics:** Cohort distributions for fasting glucose, total haemoglobin, and serum cholesterol with dynamic Recharts visualizations.
- **Modern Hospital UI/UX:**
  - Professional healthcare aesthetic with full **Dark Mode** and **Light Mode** support.
  - Interactive **Scrolling Date of Birth Picker** (Day, Month, Year).
  - Numerical lab value steppers and clinical interval reference badges.
  - User-configurable **Font Scaling** (Standard 16px, Medium 17.5px, Large 19px).
  - Practice & Facility personalization and CSV/JSON registry export.

---

## Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide React, Recharts.
- **Backend:** Python 3, Flask, Flask-CORS, Flask-SQLAlchemy.
- **Database:** SQLite / PostgreSQL persistence with SQLAlchemy ORM.
- **AI Integration:** Google GenAI Python SDK (Gemini API).

---

## Project Structure

```text
medipredict-ai/
  frontend/                  React + Vite dashboard
    src/components/          Forms, table, charts, modals
    src/context/             Theme & Toast providers
    src/pages/               Dashboard, patients, registration, analytics, AI, settings
    src/services/            API client
  backend/
    app.py                   Flask application factory and routes
    config.py                Environment and database configuration
    models/patient.py        SQLAlchemy Patient model
    routes/                  Patient, health, and dashboard blueprints
    services/                Gemini clinical intelligence service
    utils/                   Validators, reference ranges, responses
    database/db.py           Database initialization
  vercel.json                Vercel deployment configuration
  start_app.bat              One-click full-stack launcher
  README.md
```

---

## Installation & Local Development

### 1. Backend Setup

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Open `backend/.env` and supply your Gemini API Key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.1-flash-lite
```

Start the Flask API server:
```powershell
python app.py
```
Backend runs at `http://127.0.0.1:5000`.

### 2. Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

### 3. One-Click Launcher (Windows)
Double-click `start_app.bat` to launch both backend and frontend servers simultaneously.

---

## API Endpoints

| Method | Path | Description |
| :--- | :--- | :--- |
| `POST` | `/api/patients` | Register a patient and generate clinical observations |
| `GET` | `/api/patients` | Paginated search and retrieval of patient records |
| `GET` | `/api/patients/<id>` | Retrieve specific patient dossier |
| `PUT` | `/api/patients/<id>` | Update patient record (re-evaluates biomarkers if changed) |
| `DELETE` | `/api/patients/<id>` | Delete patient record with confirmation |
| `POST` | `/api/health/analyze` | Evaluate arbitrary laboratory metrics on-demand |
| `POST` | `/api/patients/<id>/reanalyze` | Refresh observations for existing patient |
| `GET` | `/api/dashboard/stats` | Real-time population metrics & distribution counts |
| `GET` | `/api/health/status` | System health and AI engine connectivity |

---

## Deployment to Vercel

The project includes `vercel.json` configured for seamless deployment:

1. Import the repository in [Vercel](https://vercel.com).
2. Set Root Directory to `./` (or `./frontend` for frontend-only hosting).
3. If deploying frontend with external backend, provide `VITE_API_BASE_URL` in Vercel environment variables.
4. For full-stack deployment on Vercel, the Python serverless API functions are routed via `vercel.json`.
