const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function quickSeed() {
  try {
    console.log('Starting quick seed...');

    // Create categories
    const categories = [
      { name: 'Kitchen & Dining', slug: 'kitchen-dining', description: 'Kitchen appliances and dining essentials' },
      { name: 'Home Decor', slug: 'home-decor', description: 'Beautiful items to decorate your home' },
      { name: 'Bathroom', slug: 'bathroom', description: 'Bathroom essentials and accessories' },
      { name: 'Storage & Organization', slug: 'storage-organization', description: 'Storage solutions for your home' },
      { name: 'Lighting', slug: 'lighting', description: 'Indoor and outdoor lighting solutions' }
    ];

    console.log('Creating categories...');
    for (const categoryData of categories) {
      await prisma.category.upsert({
        where: { slug: categoryData.slug },
        update: {},
        create: categoryData
      });
    }

    // Get created categories
    const kitchenCategory = await prisma.category.findUnique({ where: { slug: 'kitchen-dining' } });
    const homeDecorCategory = await prisma.category.findUnique({ where: { slug: 'home-decor' } });
    const bathroomCategory = await prisma.category.findUnique({ where: { slug: 'bathroom' } });
    const storageCategory = await prisma.category.findUnique({ where: { slug: 'storage-organization' } });
    const lightingCategory = await prisma.category.findUnique({ where: { slug: 'lighting' } });

    // Create products
    const products = [
      {
        name: 'Modern Kitchen Knife Set',
        slug: 'modern-kitchen-knife-set',
        description: 'Professional grade stainless steel kitchen knife set with ergonomic handles. Perfect for all your cooking needs.',
        shortDescription: 'Professional grade stainless steel kitchen knife set',
        sku: 'KNF-001',
        price: 2500,
        comparePrice: 3500,
        categoryId: kitchenCategory.id,
        images: JSON.stringify([
          '/images/products/knife-set-1.jpg',
          '/images/products/knife-set-2.jpg'
        ]),
        tags: JSON.stringify(['kitchen', 'knives', 'cooking', 'stainless steel']),
        isActive: true,
        isFeatured: true,
        stock: 25
      },
      {
        name: 'Ceramic Dinner Plate Set',
        slug: 'ceramic-dinner-plate-set',
        description: 'Beautiful ceramic dinner plates perfect for everyday dining or special occasions. Microwave and dishwasher safe.',
        shortDescription: 'Beautiful ceramic dinner plates for everyday use',
        sku: 'PLT-001',
        price: 1800,
        comparePrice: 2200,
        categoryId: kitchenCategory.id,
        images: JSON.stringify([
          '/images/products/plates-1.jpg',
          '/images/products/plates-2.jpg'
        ]),
        tags: JSON.stringify(['dinnerware', 'ceramic', 'plates', 'dining']),
        isActive: true,
        isFeatured: false,
        stock: 40
      },
      {
        name: 'Luxury Bath Towel Set',
        slug: 'luxury-bath-towel-set',
        description: 'Ultra-soft cotton bath towels that provide maximum absorbency and comfort. Available in multiple colors.',
        shortDescription: 'Ultra-soft cotton bath towels for maximum comfort',
        sku: 'TWL-001',
        price: 3200,
        comparePrice: 4000,
        categoryId: bathroomCategory.id,
        images: JSON.stringify([
          '/images/products/towels-1.jpg',
          '/images/products/towels-2.jpg'
        ]),
        tags: JSON.stringify(['bathroom', 'towels', 'cotton', 'luxury']),
        isActive: true,
        isFeatured: true,
        stock: 15
      },
      {
        name: 'Storage Basket Set',
        slug: 'storage-basket-set',
        description: 'Woven storage baskets perfect for organizing your home. Made from natural materials with sturdy construction.',
        shortDescription: 'Woven storage baskets for home organization',
        sku: 'BSK-001',
        price: 1500,
        categoryId: storageCategory.id,
        images: JSON.stringify([
          '/images/products/baskets-1.jpg',
          '/images/products/baskets-2.jpg'
        ]),
        tags: JSON.stringify(['storage', 'organization', 'baskets', 'home']),
        isActive: true,
        isFeatured: false,
        stock: 30
      },
      {
        name: 'LED Table Lamp',
        slug: 'led-table-lamp',
        description: 'Modern LED table lamp with adjustable brightness and color temperature. Perfect for reading or ambient lighting.',
        shortDescription: 'Modern LED table lamp with adjustable settings',
        sku: 'LMP-001',
        price: 2800,
        comparePrice: 3500,
        categoryId: lightingCategory.id,
        images: JSON.stringify([
          '/images/products/lamp-1.jpg',
          '/images/products/lamp-2.jpg'
        ]),
        tags: JSON.stringify(['lighting', 'LED', 'lamp', 'modern']),
        isActive: true,
        isFeatured: true,
        stock: 20
      },
      {
        name: 'Non-Stick Frying Pan',
        slug: 'non-stick-frying-pan',
        description: 'High-quality non-stick frying pan with ceramic coating. Perfect for healthy cooking with minimal oil.',
        shortDescription: 'High-quality non-stick frying pan with ceramic coating',
        sku: 'PAN-001',
        price: 1200,
        comparePrice: 1500,
        categoryId: kitchenCategory.id,
        images: JSON.stringify([
          '/images/products/pan-1.jpg',
          '/images/products/pan-2.jpg'
        ]),
        tags: JSON.stringify(['kitchen', 'cookware', 'non-stick', 'ceramic']),
        isActive: true,
        isFeatured: false,
        stock: 35
      },
      {
        name: 'Decorative Wall Mirror',
        slug: 'decorative-wall-mirror',
        description: 'Elegant decorative wall mirror with ornate frame. Perfect for adding style and light to any room.',
        shortDescription: 'Elegant decorative wall mirror with ornate frame',
        sku: 'MIR-001',
        price: 4500,
        comparePrice: 5500,
        categoryId: homeDecorCategory.id,
        images: JSON.stringify([
          '/images/products/mirror-1.jpg',
          '/images/products/mirror-2.jpg'
        ]),
        tags: JSON.stringify(['home decor', 'mirror', 'wall art', 'elegant']),
        isActive: true,
        isFeatured: true,
        stock: 12
      },
      {
        name: 'Bamboo Cutting Board',
        slug: 'bamboo-cutting-board',
        description: 'Eco-friendly bamboo cutting board with antimicrobial properties. Gentle on knives and easy to clean.',
        shortDescription: 'Eco-friendly bamboo cutting board',
        sku: 'CUT-001',
        price: 800,
        categoryId: kitchenCategory.id,
        images: JSON.stringify([
          '/images/products/cutting-board-1.jpg',
          '/images/products/cutting-board-2.jpg'
        ]),
        tags: JSON.stringify(['kitchen', 'bamboo', 'eco-friendly', 'cutting board']),
        isActive: true,
        isFeatured: false,
        stock: 50
      }
    ];

    console.log('Creating products...');
    for (const productData of products) {
      await prisma.product.upsert({
        where: { slug: productData.slug },
        update: {},
        create: productData
      });
      console.log(`Created product: ${productData.name}`);
    }

    console.log('Quick seed completed successfully!');
    
    // Show summary
    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();
    console.log(`Created ${categoryCount} categories and ${productCount} products`);

  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

quickSeed();