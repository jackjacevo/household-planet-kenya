#!/bin/bash

# Setup Monitoring Stack for Household Planet Kenya

set -e

echo "🔧 Setting up monitoring stack..."

# Create monitoring network if it doesn't exist
docker network create monitoring 2>/dev/null || true

# Start monitoring services
cd "$(dirname "$0")"
docker-compose -f docker-compose.monitoring.yml up -d

echo "✅ Monitoring stack deployed!"
echo ""
echo "📊 Services available at:"
echo "   • Grafana: http://localhost:3030 (admin/HouseholdPlanet2024!)"
echo "   • Dozzle (Logs): http://localhost:8080"
echo ""
echo "🔧 Next steps:"
echo "1. Configure Grafana dashboards"
echo "2. Set up alerts for critical metrics"
echo "3. Add reverse proxy rules for external access"
