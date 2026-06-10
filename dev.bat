@echo off
echo Starting Secondhand Books...
echo.

echo [1/2] Starting backend on http://localhost:3001
start "Secondhand Books - Backend" cmd /k "cd /d "%~dp0server" && npm run dev"

timeout /t 3 /nobreak > nul

echo [2/2] Starting frontend on http://localhost:5173
start "Secondhand Books - Frontend" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo Both services are starting. Open http://localhost:5173 in your browser.
