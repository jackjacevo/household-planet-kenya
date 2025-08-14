@echo off
echo ========================================
echo   WhatsApp Business Setup Script
echo ========================================
echo.

cd /d "c:\Users\Lipaflex\Documents\VS PROJECTS\HouseholdPlanetKenya"

echo 1. Setting up WhatsApp Business database tables...
cd household-planet-backend
sqlite3 prisma/dev.db < create-whatsapp-business-tables.sql
if %errorlevel% neq 0 (
    echo ❌ Failed to create WhatsApp Business tables
    pause
    exit /b 1
)
echo ✅ WhatsApp Business tables created successfully

echo.
echo 2. Installing additional dependencies...
npm install --save @nestjs/schedule node-cron
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
echo   WhatsApp Business Setup Complete!
echo ========================================
echo.
echo 📱 Backend running on: http://localhost:3001
echo 🌐 Frontend running on: http://localhost:3000
echo 📊 Admin Panel: http://localhost:3000/admin/whatsapp
echo.
echo 🔧 Next Steps:
echo 1. Open WhatsApp Admin Panel
echo 2. Scan QR code to connect WhatsApp Business
echo 3. Configure business hours and auto-replies
echo 4. Create customer segments and campaigns
echo.
echo Press any key to run WhatsApp Business tests...
pause > nul

echo.
echo 8. Running WhatsApp Business tests...
cd ../
node test-whatsapp-business-complete.js

echo.
echo ========================================
echo   All tests completed!
echo ========================================
echo.
echo 📋 WhatsApp Business Features:
echo ✅ Business hours management
echo ✅ Auto-reply system
echo ✅ Customer segmentation
echo ✅ Broadcast campaigns
echo ✅ Contact management
echo ✅ Analytics and reporting
echo ✅ Bulk operations
echo ✅ Template management
echo.
pause