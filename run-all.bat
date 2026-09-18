@echo off
title Resumify - Full Stack Launcher
cd /d "%~dp0"

echo ===================================================
echo   Starting Resumify (Full Stack)
echo ===================================================
echo Starting Backend on http://localhost:8000 ...
start "Resumify - Backend" cmd /k "cd /d %~dp0backend && .venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000 --host 0.0.0.0"

timeout /t 2 /nobreak >nul

echo Starting Frontend on http://localhost:5173 ...
start "Resumify - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers are starting in separate windows!
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:8000/docs
echo.

