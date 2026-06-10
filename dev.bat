@echo off
echo Starting Secondhand Books...
echo.

echo [1/3] Initializing database...
cd /d "%~dp0server"
call npm run db:init
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Database initialization failed. Shelf features will not work.
    echo See README ^> Troubleshooting for help with auth errors.
    echo.
    ping 127.0.0.1 -n 6 > nul
)
cd /d "%~dp0"

echo [2/3] Starting backend on http://localhost:3001
start "Secondhand Books - Backend" cmd /k "cd /d "%~dp0server" && npm run dev"

ping 127.0.0.1 -n 4 > nul

echo [3/3] Starting frontend on http://localhost:5173
start "Secondhand Books - Frontend" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo Both services are starting. Open http://localhost:5173 in your browser.
