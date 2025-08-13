@echo off
echo Starting Phase 8 - WhatsApp Integration Servers...

echo Starting Backend Server...
cd household-planet-backend
start "Backend Server" cmd /k "npm run start:dev"

echo Starting Frontend Server...
cd ..\household-planet-frontend
start "Frontend Server" cmd /k "npm run dev"

echo Both servers starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
pause