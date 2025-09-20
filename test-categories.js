
const { PrismaClient } = require('@prisma/client');

async function testCategories() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Testing categories query...');
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: {
        children: {
          where: { isActive: true },
          include: {
            children: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' },
    });
    
    console.log(`✅ Found ${categories.length} categories`);
    categories.forEach(cat => console.log(`  - ${cat.name}`));
    
  } catch (error) {
    console.error('❌ Categories query failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testCategories();
