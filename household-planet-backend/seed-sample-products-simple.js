const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedSampleProducts() {
  try {
    console.log('🌱 Seeding sample products...');
    
    // Get first available category
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      take: 1
    });
    
    if (categories.length === 0) {
      console.log('❌ No categories found. Please seed categories first.');
      return;
    }
    
    const categoryId = categories[0].id;
    console.log('✅ Using category:', categories[0].name, '(ID:', categoryId, ')');
    
    // Check if products already exist
    const existingProducts = await prisma.product.count();
    console.log('ℹ️  Existing products in database:', existingProducts);
    
    // Force add products for testing
    console.log('🔄 Force adding sample products for testing...');
    
    // Sample products
    const sampleProducts = [
      {
        name: 'Premium Kitchen Knife Set',
        slug: 'premium-kitchen-knife-set',
        description: 'High-quality stainless steel kitchen knife set with wooden handles. Perfect for professional and home cooking.',
        shortDescription: 'Professional kitchen knife set',
        sku: 'KIT-KNIFE-001',
        price: 2500,
        comparePrice: 3000,
        categoryId: categoryId,
        stock: 50,
        lowStockThreshold: 10,
        trackStock: true,
        isActive: true,
        isFeatured: true,
        images: JSON.stringify(['/images/products/placeholder.svg']),
        tags: JSON.stringify(['kitchen', 'knives', 'cooking']),
        weight: 1.5,
        totalSales: 15,
        averageRating: 4.5,
        totalReviews: 8
      },
      {
        name: 'Ceramic Dinner Plates Set',
        slug: 'ceramic-dinner-plates-set',
        description: 'Beautiful ceramic dinner plates set of 6 pieces. Elegant design perfect for family dining.',
        shortDescription: 'Elegant ceramic dinner plates',
        sku: 'DIN-PLATE-001',
        price: 1800,
        comparePrice: 2200,
        categoryId: categoryId,
        stock: 30,
        lowStockThreshold: 5,
        trackStock: true,
        isActive: true,
        isFeatured: false,
        images: JSON.stringify(['/images/products/placeholder.svg']),
        tags: JSON.stringify(['dining', 'plates', 'ceramic']),
        weight: 2.0,
        totalSales: 8,
        averageRating: 4.2,
        totalReviews: 5
      },
      {
        name: 'Non-Stick Frying Pan',
        slug: 'non-stick-frying-pan',
        description: 'Premium non-stick frying pan with heat-resistant handle. Perfect for healthy cooking.',
        shortDescription: 'Professional non-stick pan',
        sku: 'PAN-NSTK-001',
        price: 1200,
        categoryId: categoryId,
        stock: 25,
        lowStockThreshold: 8,
        trackStock: true,
        isActive: true,
        isFeatured: true,
        images: JSON.stringify(['/images/products/placeholder.svg']),
        tags: JSON.stringify(['cooking', 'pan', 'non-stick']),
        weight: 0.8,
        totalSales: 12,
        averageRating: 4.7,
        totalReviews: 10
      },
      {
        name: 'Glass Water Bottle Set',
        slug: 'glass-water-bottle-set',
        description: 'Eco-friendly glass water bottles set of 4. BPA-free and dishwasher safe.',
        shortDescription: 'Eco-friendly glass bottles',
        sku: 'BTL-GLASS-001',
        price: 800,
        comparePrice: 1000,
        categoryId: categoryId,
        stock: 40,
        lowStockThreshold: 10,
        trackStock: true,
        isActive: true,
        isFeatured: false,
        images: JSON.stringify(['/images/products/placeholder.svg']),
        tags: JSON.stringify(['bottles', 'glass', 'eco-friendly']),
        weight: 1.2,
        totalSales: 6,
        averageRating: 4.0,
        totalReviews: 3
      },
      {
        name: 'Stainless Steel Cookware Set',
        slug: 'stainless-steel-cookware-set',
        description: 'Complete stainless steel cookware set with 8 pieces. Professional grade quality.',
        shortDescription: 'Professional cookware set',
        sku: 'COOK-SS-001',
        price: 4500,
        comparePrice: 5500,
        categoryId: categoryId,
        stock: 15,
        lowStockThreshold: 3,
        trackStock: true,
        isActive: true,
        isFeatured: true,
        images: JSON.stringify(['/images/products/placeholder.svg']),
        tags: JSON.stringify(['cookware', 'stainless-steel', 'professional']),
        weight: 5.0,
        totalSales: 4,
        averageRating: 4.8,
        totalReviews: 6
      }
    ];
    
    console.log('📦 Creating products...');
    
    for (const productData of sampleProducts) {
      const product = await prisma.product.create({
        data: productData
      });
      console.log(`✅ Created: ${product.name} (ID: ${product.id})`);
    }
    
    console.log('🎉 Sample products seeded successfully!');
    console.log('📊 Total products created:', sampleProducts.length);
    
  } catch (error) {
    console.error('❌ Error seeding products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSampleProducts();