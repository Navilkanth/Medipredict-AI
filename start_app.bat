@echo off
echo ========================================================
echo  Launching MediPredict AI (Backend + Frontend)
echo ========================================================
start "MediPredict AI - Backend API (Port 5000)" cmd /k "cd /d "%~dp0backend" && venv\Scripts\python.exe app.py"
start "MediPredict AI - React Frontend (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"
echo.
echo Both servers have been launched in separate windows!
echo - Backend API:  http://127.0.0.1:5000
echo - Web Dashboard: http://127.0.0.1:5173
echo.
pause

