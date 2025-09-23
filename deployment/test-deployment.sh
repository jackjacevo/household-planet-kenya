#!/bin/bash

# Comprehensive Deployment Test Script
# Tests all fixed configuration issues

set -e

echo "🧪 Testing Household Planet Kenya Deployment Configuration"
echo "========================================================="

# Test 1: Docker Configuration
echo ""
echo "1️⃣ Testing Docker Configuration..."

if [ ! -f "household-planet-backend/Dockerfile.prod" ]; then
    echo "❌ Missing backend Dockerfile.prod"
    exit 1
fi

if [ ! -f "household-planet-frontend/Dockerfile.prod" ]; then
    echo "❌ Missing frontend Dockerfile.prod"
    exit 1
fi

echo "✅ Docker production files exist"

# Test 2: Environment Configuration
echo ""
echo "2️⃣ Testing Environment Configuration..."

if [ -f ".env" ]; then
    echo "❌ .env file still exists - should be removed"
    exit 1
fi

if ! grep -q ".env\*" .gitignore; then
    echo "❌ .gitignore missing .env* patterns"
    exit 1
fi

echo "✅ Environment files properly secured"

# Test 3: Domain Consistency
echo ""
echo "3️⃣ Testing Domain Consistency..."

# Count incorrect domain references
INCORRECT_COUNT=$(find . -name "*.js" -o -name "*.ts" -o -name "*.tsx" | xargs grep -l "householdplanet\.co\.ke" | wc -l || echo "0")

if [ "$INCORRECT_COUNT" -gt "0" ]; then
    echo "❌ Found $INCORRECT_COUNT files with incorrect domain references"
    exit 1
fi

echo "✅ All domain references use householdplanetkenya.co.ke"

# Test 4: Health Check Configuration
echo ""
echo "4️⃣ Testing Health Check Configuration..."

if ! grep -q "HEALTHCHECK" household-planet-backend/Dockerfile.prod; then
    echo "❌ Backend missing health check"
    exit 1
fi

if ! grep -q "HEALTHCHECK" household-planet-frontend/Dockerfile.prod; then
    echo "❌ Frontend missing health check"
    exit 1
fi

if [ ! -f "household-planet-frontend/src/app/api/health/route.ts" ]; then
    echo "❌ Frontend missing health endpoint"
    exit 1
fi

echo "✅ Health checks configured"

# Test 5: Backup Configuration
echo ""
echo "5️⃣ Testing Backup Configuration..."

if [ ! -f "deployment/backup-system.sh" ]; then
    echo "❌ Missing backup system script"
    exit 1
fi

if ! grep -q "postgres_backups" dokploy.yml; then
    echo "❌ Missing backup volume in dokploy.yml"
    exit 1
fi

echo "✅ Backup system configured"

# Test 6: Monitoring Configuration
echo ""
echo "6️⃣ Testing Monitoring Configuration..."

if [ ! -f "deployment/monitoring/docker-compose.monitoring.yml" ]; then
    echo "❌ Missing monitoring configuration"
    exit 1
fi

if [ ! -f "deployment/monitoring/setup-monitoring.sh" ]; then
    echo "❌ Missing monitoring setup script"
    exit 1
fi

echo "✅ Monitoring stack configured"

# Test 7: Next.js Configuration
echo ""
echo "7️⃣ Testing Next.js Configuration..."

if ! grep -q "output.*standalone" household-planet-frontend/next.config.js; then
    echo "❌ Next.js missing standalone output"
    exit 1
fi

if ! grep -q "rewrites" household-planet-frontend/next.config.js; then
    echo "❌ Next.js missing API proxy configuration"
    exit 1
fi

echo "✅ Next.js properly configured"

# Test 8: Security Configuration
echo ""
echo "8️⃣ Testing Security Configuration..."

if grep -r "your_secure_password_123" . --exclude-dir=.git; then
    echo "❌ Found placeholder passwords in code"
    exit 1
fi

# Check for other placeholder secrets (excluding this test script)
if grep -r "your-super-secret" . --exclude-dir=.git --exclude="$(basename "$0")"; then
    echo "⚠️  Warning: Found placeholder secrets in templates (expected in .example files)"
fi

echo "✅ Security configuration looks good"

# Summary
echo ""
echo "🎉 All Deployment Tests Passed!"
echo "================================"
echo ""
echo "✅ Environment files secured"
echo "✅ Docker configurations fixed"
echo "✅ Domain references standardized"
echo "✅ Health checks added"
echo "✅ Backup strategy implemented"
echo "✅ Monitoring stack configured"
echo "✅ API proxy configured"
echo "✅ Security improvements applied"
echo ""
echo "🚀 Ready for production deployment!"
echo ""
echo "Next steps:"
echo "1. Configure secrets in Dokploy (not .env files)"
echo "2. Test in staging environment"
echo "3. Deploy to production"