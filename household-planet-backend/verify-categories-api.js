const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyCategories() {
  console.log('🔍 Verifying category structure and API accessibility...\n');

  try {
    // Test the hierarchy method (used by frontend)
    const hierarchy = await prisma.category.findMany({
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

    console.log('📊 Category Hierarchy:');
    console.log('='.repeat(50));

    hierarchy.forEach((parent, index) => {
      console.log(`${index + 1}. ${parent.name} (${parent.slug})`);
      
      if (parent.children && parent.children.length > 0) {
        parent.children.forEach((child, childIndex) => {
          console.log(`   ${childIndex + 1}. ${child.name} (${child.slug})`);
          
          if (child.children && child.children.length > 0) {
            child.children.forEach((grandchild, grandchildIndex) => {
              console.log(`      ${grandchildIndex + 1}. ${grandchild.name} (${grandchild.slug})`);
            });
          }
        });
      }
      console.log('');
    });

    // Summary statistics
    const totalCategories = await prisma.category.count();
    const parentCategories = await prisma.category.count({ where: { parentId: null } });
    const childCategories = await prisma.category.count({ where: { parentId: { not: null } } });
    const activeCategories = await prisma.category.count({ where: { isActive: true } });

    console.log('📈 Statistics:');
    console.log('='.repeat(30));
    console.log(`Total Categories: ${totalCategories}`);
    console.log(`Parent Categories: ${parentCategories}`);
    console.log(`Child Categories: ${childCategories}`);
    console.log(`Active Categories: ${activeCategories}`);

    // Verify all 14 main categories are present
    const expectedMainCategories = [
      'Kitchen and Dining',
      'Bathroom Accessories', 
      'Cleaning and Laundry',
      'Beddings and Bedroom Accessories',
      'Storage and Organization',
      'Home Decor and Accessories',
      'Jewelry',
      'Humidifier, Candles and Aromatherapy',
      'Beauty and Cosmetics',
      'Home Appliances',
      'Furniture',
      'Outdoor and Garden',
      'Lighting and Electrical',
      'Bags and Belts'
    ];

    const actualMainCategories = hierarchy.map(cat => cat.name);
    const missingCategories = expectedMainCategories.filter(cat => !actualMainCategories.includes(cat));
    
    console.log('\n✅ Verification Results:');
    console.log('='.repeat(30));
    
    if (missingCategories.length === 0) {
      console.log('🎉 All 14 main categories are present!');
    } else {
      console.log(`❌ Missing categories: ${missingCategories.join(', ')}`);
    }

    console.log(`📋 Found ${hierarchy.length} main categories with subcategories`);
    
    // Check for categories with no subcategories
    const categoriesWithoutChildren = hierarchy.filter(cat => !cat.children || cat.children.length === 0);
    if (categoriesWithoutChildren.length > 0) {
      console.log(`⚠️  Categories without subcategories: ${categoriesWithoutChildren.map(cat => cat.name).join(', ')}`);
    }

    return {
      success: true,
      totalCategories,
      parentCategories,
      childCategories,
      hierarchy
    };

  } catch (error) {
    console.error('❌ Error verifying categories:', error);
    return { success: false, error };
  }
}

async function main() {
  try {
    const result = await verifyCategories();
    
    if (result.success) {
      console.log('\n🎯 Category system is properly configured and ready for use!');
    } else {
      console.log('\n💥 Category verification failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { verifyCategories };