#!/bin/bash

# Complete Data Migration Script
set -e

echo "🚀 Starting complete data migration..."

# Set environment
export NODE_ENV=production

# Run database migrations
echo "📊 Running database migrations..."
cd ../household-planet-backend
npx prisma migrate deploy
npx prisma generate

# Seed categories and products
echo "🛍️ Seeding products and categories..."
cd ../data-migration
node seed-products.js

# Create staff accounts
echo "👥 Creating staff accounts..."
node seed-staff.js

# Create content pages
echo "📄 Creating content pages..."
node seed-content.js

# Verify data
echo "✅ Verifying migration..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  const categories = await prisma.category.count();
  const products = await prisma.product.count();
  const users = await prisma.user.count();
  const pages = await prisma.contentPage.count();
  const locations = await prisma.deliveryLocation.count();
  
  console.log('Migration Summary:');
  console.log('- Categories:', categories);
  console.log('- Products:', products);
  console.log('- Users:', users);
  console.log('- Content Pages:', pages);
  console.log('- Delivery Locations:', locations);
  
  await prisma.\$disconnect();
}

verify().catch(console.error);
"

echo "🎉 Data migration completed successfully!"