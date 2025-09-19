#!/bin/bash

echo "🔧 Fixing CORS configuration for production deployment..."

# Set production environment variables
export NODE_ENV=production
export CORS_ORIGIN="https://householdplanetkenya.co.ke,https://www.householdplanetkenya.co.ke"

echo "✅ Environment variables set:"
echo "NODE_ENV: $NODE_ENV"
echo "CORS_ORIGIN: $CORS_ORIGIN"

# Navigate to backend directory
cd household-planet-backend

echo "📦 Installing dependencies..."
npm install

echo "🏗️ Building backend..."
npm run build

echo "🔄 Restarting backend service..."
# If using PM2
if command -v pm2 &> /dev/null; then
    pm2 restart household-planet-backend || pm2 start dist/main.js --name household-planet-backend
fi

# If using Docker
if command -v docker &> /dev/null; then
    echo "🐳 Restarting Docker containers..."
    docker-compose -f ../docker-compose.prod.yml down
    docker-compose -f ../docker-compose.prod.yml up -d --build
fi

echo "✅ CORS fix deployment completed!"
echo "🧪 Testing CORS configuration..."

# Wait for service to start
sleep 10

# Test CORS
node ../test-cors-production.js

echo "🎉 CORS configuration fix completed!"