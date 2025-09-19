const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleProducts = [
  {
    name: "Premium Kitchen Knife Set",
    description: "Professional grade stainless steel kitchen knives",
    price: 2500,
    stock: 50,
    sku: "HP-KNIFE01",
    slug: "premium-kitchen-knife-set",
    images: JSON.stringify(["/images/kitchen-knife.jpg"]),
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
    isFeatured: true,
    isActive: true
  },
  {
    name: "Glass Storage Containers",
    description: "Set of 6 glass food storage containers",
    price: 1800,
    stock: 25,
    sku: "HP-GLASS01",
    slug: "glass-storage-containers",
    images: JSON.stringify(["/images/storage-containers.jpg"]),
    isFeatured: false,
    isActive: true
  }
];

async function seedProducts() {
  try {
    console.log('Seeding sample products...');
    
    for (const product of sampleProducts) {
      await prisma.product.create({
        data: product
      });
      console.log(`✅ Created: ${product.name}`);
    }
    
    console.log('✅ Sample products seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedProducts();