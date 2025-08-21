const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyDemoCleared() {
  console.log('🔍 Verifying demo data has been cleared...\n');
  
  try {
    // Check products
    const productCount = await prisma.product.count();
    console.log(`📦 Products in database: ${productCount}`);
    
    // Check product variants
    const variantCount = await prisma.productVariant.count();
    console.log(`🏷️  Product variants in database: ${variantCount}`);
    
    // Check users (should only have admin)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });
    console.log(`👥 Users in database: ${users.length}`);
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
    });
    
    // Check categories (should be preserved)
    const categoryCount = await prisma.category.count();
    console.log(`📂 Categories preserved: ${categoryCount}`);
    
    // Check brands (should be preserved)
    const brandCount = await prisma.brand.count();
    console.log(`🏢 Brands preserved: ${brandCount}`);
    
    console.log('\n✅ Verification complete!');
    
    if (productCount === 0 && variantCount === 0) {
      console.log('🎉 Demo products successfully cleared!');
      console.log('📝 Only admin-added products will now be displayed.');
    } else {
      console.log('⚠️  Some products still exist - they may be admin-added products.');
    }
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  }
}

verifyDemoCleared()
  .catch(console.error)
  .finally(() => prisma.$disconnect());