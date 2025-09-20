#!/bin/bash
# Force production rebuild with PostgreSQL

echo "🔧 Forcing production rebuild..."

# Remove compiled Prisma client
rm -rf household-planet-backend/node_modules/.prisma
rm -rf household-planet-backend/dist

# Regenerate Prisma client
cd household-planet-backend
npx prisma generate --force
npm run build

echo "✅ Production rebuild complete"