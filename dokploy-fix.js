const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixCategories() {
  try {
    console.log('🔧 Fixing categories...');
    
    const count = await prisma.category.count();
    console.log(`Current categories: ${count}`);
    
    if (count === 0) {
      const categories = [
        { name: 'Kitchen & Dining', slug: 'kitchen-dining', description: 'Kitchen essentials', image: '/images/categories/kitchen.svg' },
        { name: 'Bathroom', slug: 'bathroom', description: 'Bathroom accessories', image: '/images/categories/bathroom.svg' },
        { name: 'Cleaning', slug: 'cleaning', description: 'Cleaning supplies', image: '/images/categories/cleaning.svg' },
        { name: 'Home Decor', slug: 'home-decor', description: 'Decorative items', image: '/images/categories/decor.svg' },
        { name: 'Storage', slug: 'storage', description: 'Storage solutions', image: '/images/categories/storage.svg' }
      ];
      
      for (let i = 0; i < categories.length; i++) {
        await prisma.category.create({
          data: { ...categories[i], isActive: true, sortOrder: i }
        });
        console.log(`✅ Created: ${categories[i].name}`);
      }
    }
    
    const newCount = await prisma.category.count();
    console.log(`✅ Total categories: ${newCount}`);
    
    // Test hierarchy
    const hierarchy = await prisma.category.findMany({
      where: { parentId: null, isActive: true },
      include: { children: true }
    });
    console.log(`✅ Hierarchy working: ${hierarchy.length} categories`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCategories();