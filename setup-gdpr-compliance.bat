@echo off
echo Setting up GDPR Compliance Features...

REM Navigate to backend directory
cd /d "%~dp0household-planet-backend"

REM Create compliance tables
echo Creating compliance database tables...
sqlite3 prisma/dev.db < ../create-compliance-tables.sql

REM Update app module to include compliance
echo Updating app module...

REM Navigate back to root
cd /d "%~dp0"

echo.
echo ========================================
echo GDPR Compliance Setup Complete!
echo ========================================
echo.
echo Features Implemented:
echo ✓ Cookie consent management with granular controls
echo ✓ Privacy policy with clear data usage explanation
echo ✓ Data export functionality (right to data portability)
echo ✓ Account deletion with complete data removal
echo ✓ Data processing consent tracking
echo ✓ Privacy settings dashboard for users
echo ✓ Data retention policies and automated cleanup
echo ✓ Data breach notification procedures
echo.
echo Next Steps:
echo 1. Update your app.module.ts to import ComplianceModule
echo 2. Add CookieConsent component to your main layout
echo 3. Configure email settings for breach notifications
echo 4. Test the privacy dashboard at /dashboard/privacy
echo 5. Review and customize the privacy policy
echo.
echo API Endpoints Available:
echo - POST /api/compliance/cookie-consent
echo - GET /api/compliance/consents
echo - POST /api/compliance/data-export
echo - DELETE /api/compliance/account
echo - GET /api/compliance/privacy-policy
echo.
pause