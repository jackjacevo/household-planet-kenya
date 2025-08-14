@echo off
echo ========================================
echo   Live Chat & Email Marketing Setup
echo ========================================
echo.

cd /d "c:\Users\Lipaflex\Documents\VS PROJECTS\HouseholdPlanetKenya"

echo 1. Setting up database tables...
cd household-planet-backend
sqlite3 prisma/dev.db < ../create-chat-email-tables.sql
if %errorlevel% neq 0 (
    echo ❌ Failed to create database tables
    pause
    exit /b 1
)
echo ✅ Database tables created successfully

echo.
echo 2. Installing email dependencies...
npm install nodemailer @types/nodemailer
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully

echo.
echo 3. Building the backend...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build backend
    pause
    exit /b 1
)
echo ✅ Backend built successfully

echo.
echo 4. Starting the backend server...
start "Backend Server" cmd /k "npm run start:dev"

echo.
echo 5. Waiting for backend to start...
timeout /t 10 /nobreak > nul

echo.
echo 6. Starting the frontend server...
cd ../household-planet-frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo 7. Waiting for frontend to start...
timeout /t 10 /nobreak > nul

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo 📱 Backend: http://localhost:3001
echo 🌐 Frontend: http://localhost:3000
echo 💬 Chat Admin: http://localhost:3000/admin/chat
echo.
echo 🔧 Features Available:
echo ✅ Live chat widget on all pages
echo ✅ Auto-responses for common questions
echo ✅ Chat admin dashboard
echo ✅ Offline message capture
echo ✅ Email marketing automation
echo ✅ Abandoned cart recovery emails
echo ✅ Order confirmation emails
echo ✅ Birthday and promotional emails
echo.
echo Press any key to run tests...
pause > nul

echo.
echo 8. Running tests...
cd ../
node test-chat-email-complete.js

echo.
echo ========================================
echo   All tests completed!
echo ========================================
pause