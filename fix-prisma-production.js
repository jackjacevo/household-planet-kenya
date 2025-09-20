#!/usr/bin/env node

// Quick fix for Prisma production deployment
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Prisma configuration for production...');

// Ensure we're using PostgreSQL in production
const schemaPath = path.join(__dirname, 'household-planet-backend', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Replace SQLite with PostgreSQL
if (schema.includes('provider = "sqlite"')) {
  schema = schema.replace('provider = "sqlite"', 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, schema);
  console.log('✅ Updated schema to use PostgreSQL');
}

// Change to backend directory and regenerate Prisma client
process.chdir(path.join(__dirname, 'household-planet-backend'));

try {
  console.log('🔄 Generating Prisma client...');
  execSync('npx prisma generate --schema=./prisma/schema.prisma', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully');
  
  console.log('🔨 Building backend...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Backend built successfully');
  
  console.log('🎉 Production fix complete!');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}