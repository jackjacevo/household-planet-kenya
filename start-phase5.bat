@echo off
echo ========================================
echo   HOUSEHOLD PLANET KENYA - PHASE 5
echo   Complete Frontend Implementation
echo ========================================
echo.

echo Starting Backend Server...
cd household-planet-backend
start "Backend Server" cmd /k "npm run start:dev"
echo Backend server starting on http://localhost:3001
echo.

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
cd ..\household-planet-frontend
start "Frontend Server" cmd /k "npm run dev"
echo Frontend server starting on http://localhost:3000
echo.

timeout /t 5 /nobreak > nul

echo Running Phase 5 Tests...
cd ..
node test-phase5-complete.js

echo.
echo ========================================
echo   PHASE 5 COMPLETE!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:3001
echo.
echo Press any key to exit...
pause > nul