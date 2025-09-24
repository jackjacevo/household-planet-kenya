#!/bin/bash

# Instant Rollback Script for Household Planet Kenya

echo "🚨 Emergency Rollback Plan"

# 1. Disable all feature flags immediately
echo "Disabling all feature flags..."
export NEXT_PUBLIC_FEATURE_NEW_DIALOGS=false
export NEXT_PUBLIC_FEATURE_VALIDATION=false
export NEXT_PUBLIC_FEATURE_IMPROVED_LOADING=false
export NEXT_PUBLIC_FEATURE_UNIFIED_DASHBOARD=false
export NEXT_PUBLIC_FEATURE_ADVANCED_CACHING=false

# 2. Restart frontend service
echo "Restarting frontend service..."
cd household-planet-frontend
npm run build
npm start &

# 3. Restart backend service
echo "Restarting backend service..."
cd ../household-planet-backend
npm run start:prod &

echo "✅ Services restarted with all features disabled"
echo "Monitor logs and verify functionality"