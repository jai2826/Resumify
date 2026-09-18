@echo off
title Resumify - Backend Server
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found at .venv
    pause
    exit /b 1
)

echo Starting Backend Server on http://localhost:8000 ...
".venv\Scripts\python.exe" -m uvicorn main:app --reload --port 8000 --host 0.0.0.0
pause

