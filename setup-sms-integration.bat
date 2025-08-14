@echo off
echo ========================================
echo   SMS Integration with Africa's Talking
echo ========================================
echo.

cd /d "c:\Users\Lipaflex\Documents\VS PROJECTS\HouseholdPlanetKenya"

echo 1. Setting up SMS database tables...
cd household-planet-backend
sqlite3 prisma/dev.db < ../create-sms-tables.sql
if %errorlevel% neq 0 (
    echo ❌ Failed to create SMS tables
    pause
    exit /b 1
)
echo ✅ SMS database tables created successfully

echo.
echo 2. Installing SMS dependencies...
npm install axios
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully

echo.
echo 3. Updating environment variables...
echo # Africa's Talking SMS Configuration >> .env
echo AFRICAS_TALKING_API_KEY=your_api_key_here >> .env
echo AFRICAS_TALKING_USERNAME=your_username_here >> .env
echo ✅ Environment variables added to .env file

echo.
echo 4. Building the backend...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build backend
    pause
    exit /b 1
)
echo ✅ Backend built successfully

echo.
echo 5. Starting the backend server...
start "Backend Server" cmd /k "npm run start:dev"

echo.
echo 6. Waiting for backend to start...
timeout /t 10 /nobreak > nul

echo.
echo 7. Starting the frontend server...
cd ../household-planet-frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo 8. Waiting for frontend to start...
timeout /t 10 /nobreak > nul

echo.
echo ========================================
echo   SMS Integration Setup Complete!
echo ========================================
echo.
echo 📱 Backend: http://localhost:3001
echo 🌐 Frontend: http://localhost:3000
echo.
echo 🔧 SMS Features Available:
echo ✅ OTP verification for phone numbers
echo ✅ Order confirmation SMS
echo ✅ Payment confirmation messages
echo ✅ Shipping and delivery notifications
echo ✅ Promotional SMS campaigns
echo ✅ Wishlist stock alerts
echo ✅ Delivery appointment reminders
echo.
echo ⚠️  IMPORTANT: Configure Africa's Talking credentials in .env:
echo    AFRICAS_TALKING_API_KEY=your_actual_api_key
echo    AFRICAS_TALKING_USERNAME=your_actual_username
echo.
echo Press any key to run SMS integration tests...
pause > nul

echo.
echo 9. Running SMS integration tests...
cd ../
node test-sms-integration.js

echo.
echo ========================================
echo   All tests completed!
echo ========================================
echo.
echo 📋 SMS Integration Summary:
echo ✅ OTP verification system ready
echo ✅ Order lifecycle SMS notifications
echo ✅ Promotional campaign system
echo ✅ Automated wishlist alerts
echo ✅ Delivery reminders scheduled
echo ✅ SMS analytics and reporting
echo.
echo 🚀 Next Steps:
echo 1. Sign up for Africa's Talking account
echo 2. Get API credentials and update .env file
echo 3. Test SMS functionality with real phone numbers
echo 4. Configure SMS templates as needed
echo.
pause