@echo off
echo Starting Phase 8 WhatsApp Integration Test...
echo.

echo Starting Backend Server...
cd household-planet-backend
start "Backend Server" cmd /k "npm run start:dev"

echo Waiting for server to start...
timeout /t 10 /nobreak > nul

echo Running WhatsApp Integration Tests...
node test-whatsapp-integration.js

echo.
echo Phase 8 WhatsApp Integration Test Complete!
pause