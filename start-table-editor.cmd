@echo off
setlocal
cd /d "%~dp0"

where python >nul 2>nul
if errorlevel 1 (
  echo Python was not found. Install Python or add it to PATH.
  pause
  exit /b 1
)

echo Stopping existing Table Editor server processes...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$projectScript=[IO.Path]::GetFullPath('%~dp0server.py'); $listenerPids=@(Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess); Get-CimInstance Win32_Process | Where-Object { $_.Name -match '^python(?:w)?\.exe$' -and (($_.CommandLine -like ('*'+$projectScript+'*')) -or (($_.CommandLine -match '(?i)\bserver\.py\b') -and (($_.CommandLine -match '(?i)--port\s+4173\b') -or ($listenerPids -contains $_.ProcessId)))) } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }; Start-Sleep -Milliseconds 300"
if errorlevel 1 (
  echo Failed to stop an existing Table Editor server process.
  pause
  exit /b 1
)

powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue) { exit 1 }"
if errorlevel 1 (
  echo Port 4173 is still in use by another process. Startup was cancelled.
  pause
  exit /b 1
)

echo Starting Table Editor server...
start "Table Editor Server" /min python "%~dp0server.py" --host 127.0.0.1 --port 4173
timeout /t 1 /nobreak >nul
start "" "http://127.0.0.1:4173/table-editor/"
exit /b 0
