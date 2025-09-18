#!/bin/bash

# Household Planet Kenya - Dokploy Deployment Script

echo "🚀 Starting Dokploy deployment for Household Planet Kenya..."

# Check if git repo is clean
if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  Warning: You have uncommitted changes. Committing them now..."
    git add .
    git commit -m "Pre-deployment commit: $(date)"
    git push origin master
fi

# Ensure latest code is pushed
echo "📤 Pushing latest code to GitHub..."
git push origin master

echo "✅ Code pushed successfully!"
echo ""
echo "📋 Next steps for Dokploy deployment:"
echo ""
echo "1. Login to your Dokploy dashboard"
echo "2. Create a new Docker Compose application"
echo "3. Use the repository: https://github.com/jackjacevo/household-planet-kenya"
echo "4. Set the compose file path to: docker-compose.dokploy-optimized.yml"
echo "5. Add the environment variables from .env.dokploy.final"
echo "6. Configure domain: householdplanetkenya.co.ke"
echo "7. Deploy the application"
echo ""
echo "🌐 Your application will be available at: https://householdplanetkenya.co.ke"
echo ""
echo "📊 Monitor deployment logs in Dokploy dashboard"