const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function migrateToPostgres() {
  console.log('🔄 Starting migration to PostgreSQL...');
  
  try {
    // Initialize Prisma client
    const prisma = new PrismaClient();
    
    // Run database migrations
    console.log('📦 Running Prisma migrations...');
    const { exec } = require('child_process');
    
    await new Promise((resolve, reject) => {
      exec('npx prisma migrate deploy', { cwd: './household-planet-backend' }, (error, stdout, stderr) => {
        if (error) {
          console.error('Migration error:', error);
          reject(error);
        } else {
          console.log('Migration output:', stdout);
          resolve();
        }
      });
    });
    
    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    await new Promise((resolve, reject) => {
      exec('npx prisma generate', { cwd: './household-planet-backend' }, (error, stdout, stderr) => {
        if (error) {
          console.error('Generate error:', error);
          reject(error);
        } else {
          console.log('Generate output:', stdout);
          resolve();
        }
      });
    });
    
    console.log('✅ Migration to PostgreSQL completed successfully!');
    console.log('🚀 Ready for production deployment');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateToPostgres();