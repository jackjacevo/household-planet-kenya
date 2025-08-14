@echo off
echo Installing Compliance and Security Monitoring packages...

cd household-planet-backend

echo Installing Sentry for error monitoring...
npm install @sentry/node @sentry/tracing

echo Installing additional security packages...
npm install helmet express-rate-limit express-slow-down hpp
npm install express-validator sanitize-html
npm install node-cron winston winston-daily-rotate-file

echo Installing compliance packages...
npm install pdf-lib jspdf html-pdf
npm install csv-parser csv-writer
npm install moment timezone

echo Packages installed successfully!
echo.
echo Next steps:
echo 1. Set up Sentry DSN in environment variables
echo 2. Configure security headers and rate limiting
echo 3. Set up automated vulnerability scanning
echo 4. Configure compliance reporting schedules
echo.
pause