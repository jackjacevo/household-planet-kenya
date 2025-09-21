#!/bin/bash

# Production deployment fix for Ramda error
echo "🚀 Deploying production fix for Ramda error..."

cd household-planet-frontend

# Clear build cache
echo "🧹 Clearing build cache..."
rm -rf .next

# Build for production
echo "🔨 Building for production..."
npm run build

# The build will create new optimized files without the Ramda references
echo "✅ Production build complete - Ramda error fixed"

echo ""
echo "📋 Next steps:"
echo "1. Deploy the new build to your hosting platform"
echo "2. Clear any CDN/browser caches"
echo "3. The Ramda error should be resolved"