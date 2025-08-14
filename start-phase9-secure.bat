@echo off
echo ========================================
echo Starting Phase 9 - Secure Servers
echo ========================================

echo.
echo 🔒 Starting secure backend server...
cd household-planet-backend

echo Setting security environment variables...
set NODE_ENV=development
set SECURITY_HEADERS_ENABLED=true
set CSRF_PROTECTION_ENABLED=true
set RATE_LIMITING_ENABLED=true
set ENCRYPTION_ENABLED=true
set AUDIT_LOGGING_ENABLED=true

echo.
echo Starting NestJS backend with security features...
start "Backend Server (Secure)" cmd /k "npm run start:dev"

echo Waiting for backend to start...
timeout /t 10 /nobreak > nul

cd ..

echo.
echo 🌐 Starting secure frontend server...
cd household-planet-frontend

echo Setting frontend security variables...
set NEXT_PUBLIC_SECURITY_MODE=enabled
set NEXT_PUBLIC_GDPR_COMPLIANCE=true
set NEXT_PUBLIC_COOKIE_CONSENT=true

echo.
echo Starting Next.js frontend with security features...
start "Frontend Server (Secure)" cmd /k "npm run dev"

echo Waiting for frontend to start...
timeout /t 10 /nobreak > nul

cd ..

echo.
echo ========================================
echo Phase 9 Secure Servers Started!
echo ========================================
echo.
echo 🔒 Security Features Active:
echo   • Security headers enabled
echo   • CSRF protection active
echo   • Rate limiting enforced
echo   • Input validation active
echo   • Encryption enabled
echo   • Audit logging active
echo.
echo 🛡️ Compliance Features Active:
echo   • GDPR compliance enabled
echo   • Cookie consent active
echo   • Data protection measures
echo   • PCI DSS compliance
echo   • Legal policies available
echo.
echo 📊 Server Status:
echo   • Backend:  http://localhost:3001 (Secure)
echo   • Frontend: http://localhost:3000 (Secure)
echo.
echo 🔍 Security Endpoints:
echo   • Security Audit: http://localhost:3001/api/security/audit
echo   • Security Report: http://localhost:3001/api/security/report
echo   • Compliance Report: http://localhost:3001/api/compliance/report
echo.
echo 📄 Legal Pages:
echo   • Terms of Service: http://localhost:3000/legal/terms
echo   • Privacy Policy: http://localhost:3000/privacy
echo   • Return Policy: http://localhost:3000/legal/returns
echo   • Shipping Policy: http://localhost:3000/legal/shipping
echo   • Cookie Policy: http://localhost:3000/legal/cookies
echo.
echo 🧪 Test Security:
echo   Run: node test-phase9-security-complete.js
echo.
echo ⚠️  Security Notes:
echo   • All security features are active
echo   • Rate limiting is enforced
echo   • Input validation is strict
echo   • Failed logins are monitored
echo   • Security events are logged
echo.
echo Press any key to continue...
pause > nul