#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

async function migrateDatabase() {
  console.log('Starting database migration...');
  
  try {
    // Change to the backend directory
    process.chdir(path.join(__dirname, '..'));
    
    // Generate Prisma client
    console.log('Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Push database schema
    console.log('Pushing database schema...');
    execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
    
    console.log('Database migration completed successfully!');
  } catch (error) {
    console.error('Database migration failed:', error.message);
    process.exit(1);
  }
}

migrateDatabase();