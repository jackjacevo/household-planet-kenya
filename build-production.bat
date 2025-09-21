@echo off
REM Production Build Script for Household Planet Kenya (Windows)
REM This script builds both frontend and backend for production deployment

echo 🚀 Starting Production Build for Household Planet Kenya...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are available
echo.

REM Build Frontend
echo 📦 Building Frontend...
cd household-planet-frontend

if not exist "package.json" (
    echo ❌ Frontend package.json not found!
    pause
    exit /b 1
)

echo ✅ Installing frontend dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Frontend dependency installation failed!
    pause
    exit /b 1
)

echo ✅ Building frontend for production...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)

echo ✅ Frontend build completed successfully!
echo.

REM Build Backend
echo 📦 Building Backend...
cd ..\household-planet-backend

if not exist "package.json" (
    echo ❌ Backend package.json not found!
    pause
    exit /b 1
)

echo ✅ Installing backend dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Backend dependency installation failed!
    pause
    exit /b 1
)

echo ✅ Building backend for production...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Backend build failed!
    pause
    exit /b 1
)

echo ✅ Backend build completed successfully!
echo.

REM Final checks
echo 🔍 Running final checks...

REM Check if frontend build directory exists
if exist "..\household-planet-frontend\.next" (
    echo ✅ Frontend build directory exists
) else (
    echo ⚠️  Frontend build directory not found
)

REM Check if backend dist directory exists
if exist "dist" (
    echo ✅ Backend build directory exists
) else (
    echo ⚠️  Backend build directory not found
)

echo.
echo ✅ 🎉 Production build completed successfully!
echo.
echo 📋 Next steps:
echo 1. Copy .env.production to .env.local in frontend directory
echo 2. Configure your production environment variables
echo 3. Set up your database and run migrations
echo 4. Deploy to your production server
echo 5. Configure nginx and SSL certificates
echo 6. Set up PM2 for process management
echo.
echo 📖 See DEPLOYMENT.md for detailed deployment instructions
echo.
pause