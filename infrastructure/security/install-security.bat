@echo off
echo Installing Infrastructure Security Components...

REM Make scripts executable (for Linux deployment)
echo Setting up security scripts...

REM Install Node.js dependencies for security monitoring
cd /d "%~dp0..\..\household-planet-backend"
npm install nodemailer --save

REM Create security directories
if not exist "logs" mkdir logs
if not exist "backups" mkdir backups

REM Copy security configuration files
echo Copying security configurations...

REM Create environment variables for security
echo.
echo Adding security environment variables to .env...
echo.
echo # Security Monitoring Configuration >> .env
echo SMTP_HOST=smtp.gmail.com >> .env
echo SMTP_PORT=587 >> .env
echo ALERT_EMAIL_USER=your-alert-email@gmail.com >> .env
echo ALERT_EMAIL_PASS=your-app-password >> .env
echo ADMIN_EMAIL=admin@householdplanet.co.ke >> .env
echo SECURITY_WEBHOOK_URL=https://your-monitoring-service.com/webhook >> .env
echo WEBHOOK_TOKEN=your-webhook-token >> .env

REM Create security monitoring service
echo Creating security monitoring service...

REM Create Windows service script for security monitoring
echo @echo off > start-security-monitoring.bat
echo echo Starting Security Monitoring... >> start-security-monitoring.bat
echo node "%~dp0infrastructure\security\security-alerts.js" >> start-security-monitoring.bat

echo.
echo ========================================
echo Infrastructure Security Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Update .env file with your email credentials
echo 2. For Linux deployment, run the shell scripts:
echo    - chmod +x infrastructure/security/*.sh
echo    - sudo ./infrastructure/security/server-hardening.sh
echo    - sudo ./infrastructure/security/firewall-config.sh
echo    - sudo ./infrastructure/security/monitoring-setup.sh
echo.
echo 3. Set up encrypted backups:
echo    - sudo ./infrastructure/security/backup-encryption.sh
echo    - Add to crontab: 0 2 * * * /path/to/backup-encryption.sh
echo.
echo 4. Configure database security:
echo    - Run infrastructure/security/database-security.sql on your database
echo.
echo 5. Configure Nginx with DDoS protection:
echo    - Copy infrastructure/security/ddos-protection.conf to /etc/nginx/
echo.
echo 6. Start security monitoring:
echo    - start-security-monitoring.bat (Windows)
echo    - node infrastructure/security/security-alerts.js (Linux)
echo.
pause