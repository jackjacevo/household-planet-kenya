const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategories() {
  try {
    console.log('=== Checking Categories Database State ===\n');
    
    // Check all categories
    const allCategories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    console.log('Total categories:', allCategories.length);
    
    if (allCategories.length === 0) {
      console.log('❌ No categories found in database');
      return;
    }
    
    console.log('\n=== All Categories ===');
    allCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ID: ${cat.id}, Name: ${cat.name}, Slug: ${cat.slug}, Active: ${cat.isActive}, Parent ID: ${cat.parentId || 'NULL'}`);
    });
    
    // Check active categories only
    const activeCategories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    console.log('\n=== Active Categories ===');
    console.log('Total active categories:', activeCategories.length);
    
    // Check parent categories (parentId: null)
    const parentCategories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: {
        children: {
          where: { isActive: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    console.log('\n=== Parent Categories (Active, No Parent) ===');
    console.log('Total parent categories:', parentCategories.length);
    
    if (parentCategories.length > 0) {
      parentCategories.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name} - Children: ${cat.children.length}`);
        cat.children.forEach((child, childIndex) => {
          console.log(`   - ${childIndex + 1}. ${child.name}`);
        });
      });
    } else {
      console.log('No parent categories found with isActive=true and parentId=null');
    }
    
  } catch (error) {
    console.error('Error checking categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
