#!/usr/bin/env node

/**
 * Run the existing Prisma seed on production
 */

const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAndSeed() {
  try {
    console.log('🔍 Checking database status...');
    
    // Check if categories exist
    const categoryCount = await prisma.category.count();
    console.log(`📋 Found ${categoryCount} categories`);
    
    if (categoryCount === 0) {
      console.log('🌱 No categories found, running seed...');
      
      // Run the existing seed
      execSync('npx prisma db seed', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      console.log('✅ Seeding completed!');
    } else {
      console.log('✅ Categories already exist, skipping seed');
    }
    
    // Verify the API data
    const hierarchy = await prisma.category.findMany({
      where: { parentId: null, isActive: true },
      include: {
        children: {
          where: { isActive: true }
        }
      }
    });
    
    console.log(`✅ Hierarchy ready: ${hierarchy.length} parent categories`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndSeed();