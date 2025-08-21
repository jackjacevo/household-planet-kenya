const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedProducts() {
  try {
    // First, ensure we have categories
    let kitchenCategory = await prisma.category.findFirst({ where: { name: 'Kitchen' } });
    if (!kitchenCategory) {
      kitchenCategory = await prisma.category.create({
        data: {
          name: 'Kitchen',
          slug: 'kitchen',
          description: 'Kitchen appliances and utensils',
          isActive: true
        }
      });
    }

    let bathroomCategory = await prisma.category.findFirst({ where: { name: 'Bathroom' } });
    if (!bathroomCategory) {
      bathroomCategory = await prisma.category.create({
        data: {
          name: 'Bathroom',
          slug: 'bathroom',
          description: 'Bathroom accessories and fixtures',
          isActive: true
        }
      });
    }

    // Sample products with proper image URLs
    const products = [
      {
        name: 'Non-Stick Frying Pan',
        slug: 'non-stick-frying-pan',
        description: 'High-quality non-stick frying pan perfect for everyday cooking',
        shortDescription: 'Durable non-stick frying pan',
        sku: 'PAN001',
        price: 2500,
        comparePrice: 3000,
        categoryId: kitchenCategory.id,
        images: JSON.stringify(['http://localhost:3001/uploads/products/placeholder.svg']),
        tags: JSON.stringify(['kitchen', 'cookware', 'non-stick']),
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Ceramic Dinner Set',
        slug: 'ceramic-dinner-set',
        description: 'Beautiful ceramic dinner set for 6 people',
        shortDescription: '6-piece ceramic dinner set',
        sku: 'DIN001',
        price: 4500,
        comparePrice: 5500,
        categoryId: kitchenCategory.id,
        images: JSON.stringify(['http://localhost:3001/uploads/products/placeholder.svg']),
        tags: JSON.stringify(['kitchen', 'dinnerware', 'ceramic']),
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Stainless Steel Water Bottle',
        slug: 'stainless-steel-water-bottle',
        description: 'Insulated stainless steel water bottle keeps drinks hot or cold',
        shortDescription: 'Insulated water bottle 500ml',
        sku: 'BOT001',
        price: 1200,
        comparePrice: 1500,
        categoryId: kitchenCategory.id,
        images: JSON.stringify(['http://localhost:3001/uploads/products/placeholder.svg']),
        tags: JSON.stringify(['kitchen', 'bottle', 'stainless-steel']),
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Bathroom Towel Set',
        slug: 'bathroom-towel-set',
        description: 'Soft and absorbent cotton towel set for bathroom',
        shortDescription: '3-piece cotton towel set',
        sku: 'TOW001',
        price: 1800,
        comparePrice: 2200,
        categoryId: bathroomCategory.id,
        images: JSON.stringify(['http://localhost:3001/uploads/products/placeholder.svg']),
        tags: JSON.stringify(['bathroom', 'towels', 'cotton']),
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Shower Curtain',
        slug: 'shower-curtain',
        description: 'Waterproof shower curtain with modern design',
        shortDescription: 'Waterproof shower curtain',
        sku: 'CUR001',
        price: 800,
        comparePrice: 1000,
        categoryId: bathroomCategory.id,
        images: JSON.stringify(['http://localhost:3001/uploads/products/placeholder.svg']),
        tags: JSON.stringify(['bathroom', 'curtain', 'waterproof']),
        isActive: true,
        isFeatured: false
      }
    ];

    // Create products and their variants
    for (const productData of products) {
      const existingProduct = await prisma.product.findFirst({
        where: { slug: productData.slug }
      });

      let product;
      if (!existingProduct) {
        product = await prisma.product.create({ data: productData });
        console.log(`Created product: ${productData.name}`);
      } else {
        product = await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            images: productData.images
          }
        });
        console.log(`Updated product: ${productData.name}`);
      }

      // Create a default variant for each product
      const existingVariant = await prisma.productVariant.findFirst({
        where: { productId: product.id }
      });

      if (!existingVariant) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            name: 'Default',
            sku: `${productData.sku}-DEFAULT`,
            price: productData.price,
            stock: 50
          }
        });
        console.log(`Created variant for: ${productData.name}`);
      }
    }

    console.log('Products seeded successfully!');
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedProducts();