// Quick production fix for categories
// Run this directly on your Dokploy server

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const quickCategories = [
  { name: 'Kitchen & Dining', slug: 'kitchen-dining', description: 'Kitchen essentials', image: '/images/categories/kitchen.svg' },
  { name: 'Bathroom', slug: 'bathroom', description: 'Bathroom accessories', image: '/images/categories/bathroom.svg' },
  { name: 'Cleaning', slug: 'cleaning', description: 'Cleaning supplies', image: '/images/categories/cleaning.svg' },
  { name: 'Home Decor', slug: 'home-decor', description: 'Decorative items', image: '/images/categories/decor.svg' },
  { name: 'Storage', slug: 'storage', description: 'Storage solutions', image: '/images/categories/storage.svg' }
];

async function quickFix() {
  try {
    console.log('🔧 Quick fix starting...');
    
    // Check if categories exist
    const count = await prisma.category.count();
    console.log(`Current categories: ${count}`);
    
    if (count === 0) {
      console.log('Creating categories...');
      
      for (let i = 0; i < quickCategories.length; i++) {
        const cat = quickCategories[i];
        await prisma.category.create({
          data: {
            ...cat,
            isActive: true,
            sortOrder: i
          }
        });
        console.log(`✅ Created: ${cat.name}`);
      }
    }
    
    // Verify
    const newCount = await prisma.category.count();
    console.log(`✅ Total categories now: ${newCount}`);
    
    // Test hierarchy
    const hierarchy = await prisma.category.findMany({
      where: { parentId: null, isActive: true },
      include: { children: true }
    });
    
    console.log(`✅ Hierarchy working: ${hierarchy.length} parent categories`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

quickFix();