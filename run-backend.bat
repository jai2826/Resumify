@echo off
title Resumify - Backend Server
cd /d "%~dp0backend"

if not exist ".venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found at backend\.venv
    echo Please ensure the Python virtualenv is set up.
    pause
    exit /b 1
)

echo ===================================================
echo   Starting Resumify - Backend (Port 8000)
echo ===================================================
echo Swagger Docs: http://localhost:8000/docs
echo Health Check: http://localhost:8000/api/health
echo Press Ctrl+C to stop the server.
echo.

".venv\Scripts\python.exe" -m uvicorn main:app --reload --port 8000 --host 0.0.0.0
pause

