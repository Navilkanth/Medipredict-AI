"""Seed script to populate exactly 10 patient records into the database with Gemini clinical observations."""

from __future__ import annotations

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app import create_app
from database.db import db
from models.patient import Patient
from services.patient_service import create_patient

SEED_PATIENTS = [
    {
        "full_name": "Robyn Pears",
        "dob": "28/01/1960",
        "email": "robyn@gmail.com",
        "glucose": 232,
        "haemoglobin": 13.5,
        "cholesterol": 180,
    },
    {
        "full_name": "John Hunter",
        "dob": "10/12/1990",
        "email": "hunter@gmail.com",
        "glucose": 94,
        "haemoglobin": 15.0,
        "cholesterol": 200,
    },
    {
        "full_name": "Darryl Tim",
        "dob": "12/11/1993",
        "email": "timd@smh.com.au",
        "glucose": 240,
        "haemoglobin": 18.6,
        "cholesterol": 326,
    },
    {
        "full_name": "Peter Larry",
        "dob": "30/11/2001",
        "email": "Larry@hotmail.com",
        "glucose": 88,
        "haemoglobin": 11.5,
        "cholesterol": 165,
    },
    {
        "full_name": "Sam Kerr",
        "dob": "09/12/2006",
        "email": "sam@news.com.au",
        "glucose": 198,
        "haemoglobin": 8.9,
        "cholesterol": 192,
    },
    {
        "full_name": "Robyn Pears",
        "dob": "28/01/1960",
        "email": "robyn@gmail.com",
        "glucose": 232,
        "haemoglobin": 13.5,
        "cholesterol": 180,
    },
    {
        "full_name": "Madison XI",
        "dob": "12/09/1998",
        "email": "madison@hotmail.com",
        "glucose": 85,
        "haemoglobin": 7.6,
        "cholesterol": 163,
    },
    {
        "full_name": "Kris Wu",
        "dob": "19/10/1995",
        "email": "kris.wu@gmail.com",
        "glucose": 79,
        "haemoglobin": 16.5,
        "cholesterol": 197,
    },
    {
        "full_name": "Tenille Singh",
        "dob": "30/11/1991",
        "email": "Tenille@yahoo.com",
        "glucose": 101,
        "haemoglobin": 15.0,
        "cholesterol": 310,
    },
    {
        "full_name": "Prem Kumar",
        "dob": "28/04/1990",
        "email": "prem@telstra.com",
        "glucose": 155,
        "haemoglobin": 12.5,
        "cholesterol": 265,
    },
]

def seed_database(clear_existing: bool = True):
    app = create_app()
    with app.app_context():
        if clear_existing:
            db.session.query(Patient).delete()
            db.session.commit()
            print("Existing patient records cleared.")

        print(f"Seeding {len(SEED_PATIENTS)} patient records into database...")
        success_count = 0

        for i, patient_data in enumerate(SEED_PATIENTS, 1):
            print(f"[{i}/{len(SEED_PATIENTS)}] Registering and analyzing: {patient_data['full_name']}...")
            patient, errors, ai_error = create_patient(patient_data)
            if errors:
                print(f"  Validation error: {errors}")
            else:
                success_count += 1
                ai_status = patient.analysis_status if patient else "unknown"
                print(f"  Saved (ID #{patient.id}, Status: {ai_status})")

        print(f"\nSeeding complete! Successfully added {success_count} patient records to the live database.")

if __name__ == "__main__":
    seed_database(clear_existing=True)

