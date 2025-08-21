const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeProductsOnly() {
  console.log('🗑️ Removing demo products and variants...');
  
  try {
    // Delete all product variants first (due to foreign key constraints)
    const deletedVariants = await prisma.productVariant.deleteMany();
    console.log(`✅ Deleted ${deletedVariants.count} product variants`);
    
    // Delete all products
    const deletedProducts = await prisma.product.deleteMany();
    console.log(`✅ Deleted ${deletedProducts.count} products`);
    
    console.log('✅ Demo products removed successfully!');
    console.log('📦 Categories, brands, and admin user preserved');
    
  } catch (error) {
    console.error('❌ Error removing products:', error);
  }
}

removeProductsOnly()
  .catch(console.error)
  .finally(() => prisma.$disconnect());