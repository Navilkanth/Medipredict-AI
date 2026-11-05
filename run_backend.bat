@echo off
echo ========================================================
echo  MediPredict AI - Intelligent Patient Health Management
echo ========================================================
echo Starting Backend on http://127.0.0.1:5000...
cd /d "%~dp0backend"
venv\Scripts\python.exe app.py
pause
