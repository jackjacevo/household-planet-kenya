@echo off
echo ========================================
echo   HOUSEHOLD PLANET KENYA - PHASE 5
echo   Starting Servers with Correct Ports
echo ========================================
echo.

echo Stopping any existing servers...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak > nul

echo Starting Backend Server on Port 3001...
cd household-planet-backend
start "Backend Server (Port 3001)" cmd /k "npm run start:dev"
echo.

timeout /t 5 /nobreak > nul

echo Starting Frontend Server on Port 3000...
cd ..\household-planet-frontend
start "Frontend Server (Port 3000)" cmd /k "npm run dev"
echo.

timeout /t 3 /nobreak > nul

echo ========================================
echo   SERVERS STARTED!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:3001
echo.
echo Press any key to exit...
pause > nul