@echo off
echo Setting up PCI DSS and Legal Compliance...

REM Navigate to backend directory
cd /d "%~dp0household-planet-backend"

REM Install Stripe for PCI compliant payments
echo Installing Stripe SDK...
npm install @stripe/stripe-js stripe --save

REM Create PCI compliance tables
echo Creating PCI compliance database tables...
sqlite3 prisma/dev.db < ../create-pci-compliance-tables.sql

REM Navigate to frontend directory
cd /d "%~dp0household-planet-frontend"

REM Install Stripe React components
echo Installing Stripe React components...
npm install @stripe/react-stripe-js --save

REM Navigate back to root
cd /d "%~dp0"

echo.
echo ========================================
echo PCI DSS and Legal Compliance Setup Complete!
echo ========================================
echo.
echo PCI DSS Features Implemented:
echo ✓ Secure card data handling (never store card details)
echo ✓ PCI DSS compliant payment processing with Stripe
echo ✓ Secure payment form implementation
echo ✓ Payment token management
echo ✓ Payment audit logging
echo ✓ Compliance monitoring
echo.
echo Legal Pages Created:
echo ✓ Terms of Service (/legal/terms)
echo ✓ Return and Refund Policy (/legal/returns)
echo ✓ Shipping and Delivery Policy (/legal/shipping)
echo ✓ Cookie Policy (/legal/cookies)
echo ✓ Privacy Policy (/privacy) - Already created
echo.
echo Next Steps:
echo 1. Add your Stripe keys to environment variables:
echo    - STRIPE_SECRET_KEY=sk_test_...
echo    - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
echo.
echo 2. Update your app.module.ts to include PCI compliance service
echo.
echo 3. Add SecurePaymentForm to your checkout process
echo.
echo 4. Configure payment webhooks for Stripe
echo.
echo 5. Review and customize legal policies for your business
echo.
echo 6. Set up regular PCI compliance monitoring
echo.
echo Security Notes:
echo • Never store card numbers, CVV, or expiry dates
echo • Use Stripe tokens for all payment processing
echo • All payment data is encrypted in transit
echo • Payment audit logs track all activities
echo • Regular compliance checks are automated
echo.
pause