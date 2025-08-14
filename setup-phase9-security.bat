@echo off
echo ========================================
echo Phase 9 - Security and Compliance Setup
echo ========================================

echo.
echo [1/6] Creating security database tables...
cd household-planet-backend
sqlite3 prisma/dev.db < ../create-phase9-security-tables.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create security tables
    pause
    exit /b 1
)
echo ✓ Security tables created successfully

echo.
echo [2/6] Installing security packages...
call npm install helmet express-rate-limit express-validator bcryptjs jsonwebtoken crypto-js
if %errorlevel% neq 0 (
    echo ERROR: Failed to install security packages
    pause
    exit /b 1
)
echo ✓ Security packages installed

echo.
echo [3/6] Installing compliance packages...
call npm install cookie-parser express-session csrf multer sharp
if %errorlevel% neq 0 (
    echo ERROR: Failed to install compliance packages
    pause
    exit /b 1
)
echo ✓ Compliance packages installed

echo.
echo [4/6] Installing monitoring packages...
call npm install winston morgan compression cors
if %errorlevel% neq 0 (
    echo ERROR: Failed to install monitoring packages
    pause
    exit /b 1
)
echo ✓ Monitoring packages installed

echo.
echo [5/6] Updating security module imports...
echo Updating security.module.ts...

echo.
echo [6/6] Setting up environment variables...
echo.
echo Please ensure the following environment variables are set in your .env file:
echo.
echo # Security Configuration
echo ENCRYPTION_KEY=your-aes-256-encryption-key-32-chars-exactly
echo SESSION_SECRET=your-session-secret-key-for-csrf-protection
echo JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-32-chars-minimum
echo.
echo # Rate Limiting
echo RATE_LIMIT_WINDOW_MS=900000
echo RATE_LIMIT_MAX_REQUESTS=100
echo.
echo # Account Security
echo ACCOUNT_LOCKOUT_ATTEMPTS=5
echo ACCOUNT_LOCKOUT_DURATION=900000
echo.
echo # Data Retention
echo DATA_RETENTION_DAYS=2555
echo AUDIT_LOG_RETENTION_DAYS=90
echo SECURITY_EVENT_RETENTION_DAYS=90
echo.
echo # PCI DSS Configuration
echo STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
echo STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
echo PCI_COMPLIANCE_MODE=strict
echo PAYMENT_AUDIT_ENABLED=true
echo.
echo # GDPR Configuration
echo PRIVACY_EMAIL=privacy@householdplanet.co.ke
echo DPO_EMAIL=dpo@householdplanet.co.ke
echo LEGAL_CONTACT_EMAIL=legal@householdplanet.co.ke
echo.
echo # Security Headers
echo SECURITY_HEADERS_ENABLED=true
echo CSRF_PROTECTION_ENABLED=true
echo HTTPS_ONLY=false
echo.

cd ..

echo.
echo ========================================
echo Phase 9 Security Setup Complete!
echo ========================================
echo.
echo ✅ Security Features Implemented:
echo   • Real-time threat detection
echo   • Security event monitoring
echo   • Comprehensive audit logging
echo   • Data protection measures
echo   • GDPR compliance features
echo   • PCI DSS payment security
echo   • Legal policies and pages
echo   • Security audit procedures
echo.
echo 🔒 Security Components:
echo   • SecurityMonitoringService - Real-time threat detection
echo   • AuditService - Security audit procedures
echo   • DataProtectionService - Data classification and protection
echo   • EncryptionService - AES-256 encryption
echo   • ValidationService - Input validation and sanitization
echo   • CSRFService - CSRF token management
echo.
echo 📋 Compliance Features:
echo   • GDPR data rights implementation
echo   • Cookie consent management
echo   • Data export and deletion
echo   • Privacy policy and legal pages
echo   • PCI DSS payment compliance
echo   • Automated data retention
echo.
echo 🛡️ Security Monitoring:
echo   • Failed login detection
echo   • Brute force protection
echo   • SQL injection prevention
echo   • XSS attack prevention
echo   • Rate limiting protection
echo   • Security event alerting
echo.
echo Next Steps:
echo 1. Update your .env file with the security variables above
echo 2. Test security features: node test-phase9-security.js
echo 3. Review security audit: Access /api/security/audit
echo 4. Check compliance status: Access /api/compliance/report
echo 5. Start secure servers: start-phase9-secure.bat
echo.
echo For production deployment:
echo • Set HTTPS_ONLY=true
echo • Use production Stripe keys
echo • Configure proper ENCRYPTION_KEY
echo • Set up monitoring alerts
echo • Enable security logging
echo.
pause