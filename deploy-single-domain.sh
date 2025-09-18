#!/bin/bash

# Single Domain Deployment Script for Dokploy
echo "🚀 Deploying Household Planet Kenya - Single Domain Setup"

# Stop existing containers
echo "📦 Stopping existing containers..."
docker-compose -f docker-compose.single-domain.yml down

# Remove old images to force rebuild
echo "🧹 Cleaning up old images..."
docker image prune -f

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.single-domain.yml up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
docker-compose -f docker-compose.single-domain.yml ps

# Test backend health
echo "🏥 Testing backend health..."
docker-compose -f docker-compose.single-domain.yml exec household-planet-backend node healthcheck.js

# Show logs
echo "📋 Recent logs:"
docker-compose -f docker-compose.single-domain.yml logs --tail=20

echo "✅ Deployment complete!"
echo "🌐 Your site should be available at: https://householdplanet.co.ke"
echo "📊 Check logs with: docker-compose -f docker-compose.single-domain.yml logs -f"