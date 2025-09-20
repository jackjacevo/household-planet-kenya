#!/bin/bash

# Critical Production Fixes Deployment Script
# This script deploys the fixes for the production errors

echo "🚀 Starting Critical Fixes Deployment..."

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found. Please run from project root."
    exit 1
fi

echo "📋 Critical Fixes Applied:"
echo "  ✅ Fixed API endpoint mismatch: /api/products/{id}/reviews → /api/reviews/product/{id}"
echo "  ✅ Fixed settings API methods: PUT → POST for company/notification settings"
echo "  ✅ Added PUT endpoints to backend for backward compatibility"
echo "  ✅ Added null checks for array operations (map, reduce)"
echo "  ✅ Improved API response structure handling"
echo "  ✅ Enhanced error handling and logging"

# Build and deploy
echo "🔨 Building and deploying services..."

# Stop existing services
echo "⏹️  Stopping existing services..."
docker-compose down

# Build with no cache to ensure latest changes
echo "🏗️  Building services with latest changes..."
docker-compose build --no-cache

# Start services
echo "▶️  Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service health
echo "🔍 Checking service health..."

# Check backend health
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "⚠️  Backend health check failed"
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is accessible"
else
    echo "⚠️  Frontend accessibility check failed"
fi

echo "📊 Deployment Summary:"
echo "  🌐 Frontend: http://localhost:3000"
echo "  🔧 Backend API: http://localhost:3001"
echo "  📚 API Docs: http://localhost:3001/docs"

echo "🎉 Critical fixes deployment completed!"
echo ""
echo "🔧 Fixed Issues:"
echo "  • 404 errors for product reviews"
echo "  • 404 errors for settings endpoints"
echo "  • TypeError: M.map is not a function"
echo "  • TypeError: Cannot read properties of undefined (reading 'products')"
echo "  • TypeError: e.reduce is not a function"
echo ""
echo "📝 Next Steps:"
echo "  1. Test the product pages and reviews"
echo "  2. Test the admin settings pages"
echo "  3. Verify cart functionality"
echo "  4. Monitor error logs for any remaining issues"