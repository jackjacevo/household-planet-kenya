@echo off
echo Installing security dependencies for Household Planet Kenya...

echo.
echo Installing backend security dependencies...
cd household-planet-backend
call npm install isomorphic-dompurify
call npm install @types/dompurify --save-dev

echo.
echo Installing frontend security dependencies...
cd ../household-planet-frontend
call npm install isomorphic-dompurify
call npm install @types/dompurify --save-dev

echo.
echo Security dependencies installed successfully!
echo.
echo Next steps:
echo 1. Update your .env files with secure values
echo 2. Add SecurityEnhancedModule to your main app module
echo 3. Configure HTTPS for production
echo 4. Run security tests
echo.
pause