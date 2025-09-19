const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedData() {
  try {
    console.log('Creating category...');
    
    // Create a default category first
    const category = await prisma.category.upsert({
      where: { slug: 'kitchen-appliances' },
      update: {},
      create: {
        name: 'Kitchen Appliances',
        slug: 'kitchen-appliances',
        description: 'Essential kitchen tools and appliances',
        isActive: true
      }
    });
    
    console.log('Creating products...');
    
    const products = [
      {
        name: "Premium Kitchen Knife Set",
        description: "Professional grade stainless steel kitchen knives",
        price: 2500,
        stock: 50,
        sku: "HP-KNIFE01",
        slug: "premium-kitchen-knife-set",
        images: JSON.stringify(["/images/kitchen-knife.jpg"]),
        tags: JSON.stringify(["kitchen", "knives"]),
        categoryId: category.id,
        isFeatured: true,
        isActive: true
      },
      {
        name: "Non-Stick Cooking Pan",
        description: "High quality non-stick frying pan",
        price: 1200,
        stock: 30,
        sku: "HP-PAN01",
        slug: "non-stick-cooking-pan",
        images: JSON.stringify(["/images/cooking-pan.jpg"]),
        tags: JSON.stringify(["cookware", "pan"]),
        categoryId: category.id,
        isFeatured: true,
        isActive: true
      }
    ];
    
    for (const product of products) {
      const existing = await prisma.product.findUnique({
        where: { sku: product.sku }
      });
      
      if (!existing) {
        await prisma.product.create({ data: product });
        console.log(`✅ Created: ${product.name}`);
      }
    }
    
    console.log('✅ Data seeded successfully');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();