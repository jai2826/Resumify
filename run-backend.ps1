# Resumify - Backend Launcher
$BackendDir = Join-Path $PSScriptRoot "backend"
$PythonExe = Join-Path $BackendDir ".venv\Scripts\python.exe"

if (-not (Test-Path $PythonExe)) {
    Write-Error "Virtual environment not found at $PythonExe"
    exit 1
}

Set-Location $BackendDir
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Starting Resumify - Backend (Port 8000) " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Swagger Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "Health Check: http://localhost:8000/api/health" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server.`n"

& $PythonExe -m uvicorn main:app --reload --port 8000 --host 0.0.0.0

