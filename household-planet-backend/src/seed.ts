import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding categories...');
  
  const categories = [
    { name: 'Kitchen and Dining', slug: 'kitchen-dining', description: 'Cookware, Utensils, Dinnerware, Appliances, Storage', sortOrder: 1 },
    { name: 'Bathroom Accessories', slug: 'bathroom-accessories', description: 'Towels, Mats, Organizers, Fixtures, Decor', sortOrder: 2 },
    { name: 'Cleaning and Laundry', slug: 'cleaning-laundry', description: 'Cleaning Supplies, Tools, Laundry Accessories', sortOrder: 3 },
    { name: 'Beddings and Bedroom Accessories', slug: 'beddings-bedroom', description: 'Sheets, Comforters, Pillows, Mattress Protectors', sortOrder: 4 },
    { name: 'Storage and Organization', slug: 'storage-organization', description: 'Containers, Shelving, Closet Organizers, Baskets', sortOrder: 5 },
    { name: 'Home Decor and Accessories', slug: 'home-decor', description: 'Wall Art, Decorative Items, Rugs, Curtains', sortOrder: 6 },
    { name: 'Jewelry', slug: 'jewelry', description: 'Fashion Jewelry, Jewelry Boxes, Accessories', sortOrder: 7 },
    { name: 'Humidifier, Candles and Aromatherapy', slug: 'aromatherapy', description: 'Essential Oils, Diffusers, Scented Candles', sortOrder: 8 },
    { name: 'Beauty and Cosmetics', slug: 'beauty-cosmetics', description: 'Skincare, Makeup, Tools, Mirrors', sortOrder: 9 },
    { name: 'Home Appliances', slug: 'home-appliances', description: 'Small Appliances, Kitchen Gadgets, Electronics', sortOrder: 10 },
    { name: 'Furniture', slug: 'furniture', description: 'Living Room, Bedroom, Dining, Office Furniture', sortOrder: 11 },
    { name: 'Outdoor and Garden', slug: 'outdoor-garden', description: 'Patio Furniture, Garden Tools, Planters', sortOrder: 12 },
    { name: 'Lighting and Electrical', slug: 'lighting-electrical', description: 'Lamps, Fixtures, Bulbs, Extension Cords', sortOrder: 13 }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    });
  }

  console.log('Categories seeded successfully!');

  console.log('Seeding WhatsApp business settings...');
  await prisma.whatsAppBusinessSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      businessName: 'Household Planet Kenya',
      businessPhone: '+254790227760',
      businessEmail: 'info@householdplanet.co.ke',
      welcomeMessage: 'Welcome to Household Planet Kenya! How can we help you today?',
      awayMessage: 'Thank you for contacting us. We will get back to you soon.',
      businessHours: 'Monday - Friday: 8AM - 6PM, Saturday: 9AM - 5PM'
    }
  });

  console.log('WhatsApp business settings seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });