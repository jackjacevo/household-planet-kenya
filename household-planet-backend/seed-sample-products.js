const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleProducts = [
  {
    name: 'Modern Kitchen Knife Set',
    slug: 'modern-kitchen-knife-set',
    description: 'Professional grade stainless steel kitchen knife set with ergonomic handles. Perfect for all your cooking needs.',
    shortDescription: 'Professional grade stainless steel kitchen knife set',
    sku: 'KNF-001',
    price: 2500,
    comparePrice: 3500,
    images: [
      'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop'
    ],
    tags: ['kitchen', 'knives', 'cooking', 'stainless steel'],
    features: ['Stainless steel blades', 'Ergonomic handles', 'Dishwasher safe'],
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Ceramic Dinner Plate Set',
    slug: 'ceramic-dinner-plate-set',
    description: 'Beautiful ceramic dinner plates perfect for everyday dining or special occasions. Microwave and dishwasher safe.',
    shortDescription: 'Beautiful ceramic dinner plates for everyday use',
    sku: 'PLT-001',
    price: 1800,
    comparePrice: 2200,
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop'
    ],
    tags: ['dinnerware', 'ceramic', 'plates', 'dining'],
    features: ['Microwave safe', 'Dishwasher safe', 'Chip resistant'],
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Luxury Bath Towel Set',
    slug: 'luxury-bath-towel-set',
    description: 'Ultra-soft cotton bath towels that provide maximum absorbency and comfort. Available in multiple colors.',
    shortDescription: 'Ultra-soft cotton bath towels for maximum comfort',
    sku: 'TWL-001',
    price: 3200,
    comparePrice: 4000,
    images: [
      'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1620912189820-e4e734b3e6b0?w=400&h=400&fit=crop'
    ],
    tags: ['bathroom', 'towels', 'cotton', 'luxury'],
    features: ['100% cotton', 'Quick dry', 'Machine washable'],
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Storage Basket Set',
    slug: 'storage-basket-set',
    description: 'Woven storage baskets perfect for organizing your home. Made from natural materials with sturdy construction.',
    shortDescription: 'Woven storage baskets for home organization',
    sku: 'BSK-001',
    price: 1500,
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop'
    ],
    tags: ['storage', 'organization', 'baskets', 'home'],
    features: ['Natural materials', 'Sturdy construction', 'Multiple sizes'],
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'LED Table Lamp',
    slug: 'led-table-lamp',
    description: 'Modern LED table lamp with adjustable brightness and color temperature. Perfect for reading or ambient lighting.',
    shortDescription: 'Modern LED table lamp with adjustable settings',
    sku: 'LMP-001',
    price: 2800,
    comparePrice: 3500,
    images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop'
    ],
    tags: ['lighting', 'LED', 'lamp', 'modern'],
    features: ['Adjustable brightness', 'Color temperature control', 'Energy efficient'],
    isActive: true,
    isFeatured: true,
  }
];

async function seedSampleProducts() {
  try {
    // Get the first category for products
    const category = await prisma.category.findFirst();
    if (!category) {
      console.error('No categories found. Please run the main seed first.');
      return;
    }

    console.log('Creating sample products...');
    
    for (const productData of sampleProducts) {
      const product = await prisma.product.upsert({
        where: { slug: productData.slug },
        update: {},
        create: {
          ...productData,
          categoryId: category.id,
          images: JSON.stringify(productData.images),
          tags: JSON.stringify(productData.tags),
          features: JSON.stringify(productData.features),
        },
      });

      // Create a variant for each product
      await prisma.productVariant.upsert({
        where: { 
          productId_sku: { 
            productId: product.id, 
            sku: `${productData.sku}-DEFAULT` 
          } 
        },
        update: {},
        create: {
          productId: product.id,
          name: 'Default',
          sku: `${productData.sku}-DEFAULT`,
          price: productData.price,
          stock: Math.floor(Math.random() * 50) + 10, // Random stock between 10-60
        },
      });

      console.log(`Created product: ${product.name}`);
    }

    console.log('Sample products created successfully!');
  } catch (error) {
    console.error('Error creating sample products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSampleProducts();