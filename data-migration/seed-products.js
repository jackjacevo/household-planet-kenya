const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
  { name: 'Kitchen & Dining', slug: 'kitchen-dining', description: 'Essential kitchen and dining items' },
  { name: 'Cleaning Supplies', slug: 'cleaning-supplies', description: 'Household cleaning products' },
  { name: 'Home Decor', slug: 'home-decor', description: 'Decorative items for your home' },
  { name: 'Storage & Organization', slug: 'storage-organization', description: 'Storage solutions' },
  { name: 'Bedding & Bath', slug: 'bedding-bath', description: 'Bedroom and bathroom essentials' },
  { name: 'Furniture', slug: 'furniture', description: 'Home furniture items' },
  { name: 'Electronics', slug: 'electronics', description: 'Home electronics and appliances' },
  { name: 'Garden & Outdoor', slug: 'garden-outdoor', description: 'Garden and outdoor items' },
  { name: 'Baby & Kids', slug: 'baby-kids', description: 'Baby and children products' },
  { name: 'Health & Beauty', slug: 'health-beauty', description: 'Health and beauty products' },
  { name: 'Tools & Hardware', slug: 'tools-hardware', description: 'Tools and hardware items' },
  { name: 'Pet Supplies', slug: 'pet-supplies', description: 'Pet care products' },
  { name: 'Office & Stationery', slug: 'office-stationery', description: 'Office and stationery items' }
];

// Demo products removed - ready for real product creation

const deliveryLocations = [
  { name: 'Nairobi CBD', fee: 200, estimatedDays: 1 },
  { name: 'Westlands', fee: 250, estimatedDays: 1 },
  { name: 'Karen', fee: 300, estimatedDays: 2 },
  { name: 'Kiambu', fee: 400, estimatedDays: 2 },
  { name: 'Thika', fee: 500, estimatedDays: 3 },
  { name: 'Nakuru', fee: 800, estimatedDays: 3 },
  { name: 'Mombasa', fee: 1000, estimatedDays: 4 },
  { name: 'Kisumu', fee: 1200, estimatedDays: 4 }
];

async function seedData() {
  console.log('🌱 Seeding database...');

  // Create categories
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    });
  }

  // Products will be created through admin panel

  // Create delivery locations
  for (const location of deliveryLocations) {
    await prisma.deliveryLocation.upsert({
      where: { name: location.name },
      update: {},
      create: location
    });
  }

  console.log('✅ Database seeded successfully');
}

seedData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());