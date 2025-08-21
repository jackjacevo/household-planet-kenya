#!/bin/bash

# Production Deployment Script
set -e

echo "🚀 Starting production deployment..."

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '#' | xargs)
fi

# Build and deploy backend
echo "📦 Building backend..."
cd ../household-planet-backend
npm run build

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy
npx prisma generate

# Build Docker images
echo "🐳 Building Docker images..."
cd ../deployment
docker-compose -f docker-compose.prod.yml build --no-cache

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Start new containers
echo "▶️ Starting new containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Health check
echo "🏥 Running health checks..."
curl -f http://localhost:3001/health || exit 1

# Deploy frontend to Vercel
echo "🌐 Deploying frontend to Vercel..."
cd ../household-planet-frontend
npx vercel --prod --yes

# Setup SSL certificates
echo "🔒 Setting up SSL certificates..."
cd ../deployment
chmod +x ssl-setup.sh
./ssl-setup.sh

# Configure Cloudflare
echo "☁️ Configuring Cloudflare..."
echo "Please manually configure Cloudflare DNS using cloudflare-dns.json"

echo "✅ Deployment completed successfully!"
echo "🌍 Frontend: https://householdplanet.co.ke"
echo "🔌 Backend API: https://api.householdplanet.co.ke"

# Show running containers
docker-compose -f docker-compose.prod.yml ps