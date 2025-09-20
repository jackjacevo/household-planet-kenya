#!/bin/bash

echo "🚀 Deploying categories fix to production..."

# Copy the fix script to the backend directory
cp fix-production-categories.js household-planet-backend/

# Navigate to backend directory
cd household-planet-backend

echo "📦 Installing dependencies..."
npm install

echo "🔧 Running categories fix..."
node fix-production-categories.js

echo "🔄 Restarting the application..."
# This will depend on your deployment setup
# For Docker Compose:
# docker-compose restart backend

# For PM2:
# pm2 restart household-planet-backend

# For systemd:
# sudo systemctl restart household-planet-backend

echo "✅ Categories fix deployment completed!"

# Test the API
echo "🧪 Testing the API..."
sleep 5
curl -X GET "https://api.householdplanetkenya.co.ke/api/categories/hierarchy" \
  -H "Accept: application/json" \
  -w "\nStatus: %{http_code}\n"

echo "🎉 Deployment script finished!"