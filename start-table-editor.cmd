@echo off
setlocal
cd /d "%~dp0"

where python >nul 2>nul
if errorlevel 1 (
  echo Python was not found. Install Python or add it to PATH.
  pause
  exit /b 1
)

start "Table Editor Server" /min python server.py --host 127.0.0.1 --port 4173
timeout /t 1 /nobreak >nul
start "" "http://127.0.0.1:4173/table-editor/"

