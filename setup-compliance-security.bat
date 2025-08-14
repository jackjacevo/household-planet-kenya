@echo off
echo Setting up Compliance and Security Features...

echo Creating database tables...
sqlite3 household-planet-backend/prisma/dev.db < create-compliance-security-tables.sql

echo Installing required packages...
call install-compliance-security-packages.bat

echo Setting up environment variables...
cd household-planet-backend

echo.
echo Adding environment variables to .env file...
echo # Compliance and Security Configuration >> .env
echo SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id >> .env
echo SECURITY_MONITORING_ENABLED=true >> .env
echo VULNERABILITY_SCAN_ENABLED=true >> .env
echo COMPLIANCE_REPORTING_ENABLED=true >> .env
echo SECURITY_TRAINING_REQUIRED=true >> .env
echo VAT_RATE=0.16 >> .env
echo BUSINESS_KRA_PIN=P051234567X >> .env
echo BUSINESS_VAT_NUMBER=VAT123456789 >> .env

echo.
echo Compliance and Security setup completed!
echo.
echo Features enabled:
echo - Age verification for restricted products
echo - Geographic restrictions handling
echo - Kenya VAT compliance and reporting
echo - Consumer rights and dispute resolution
echo - Real-time security monitoring with Sentry
echo - Automated vulnerability scanning
echo - Security incident response procedures
echo - Staff security training system
echo.
echo Please update the Sentry DSN and business registration details in .env file
echo.
pause