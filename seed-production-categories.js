const { PrismaClient } = require('@prisma/client');

// Use production database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://householdplanet_user:householdplanet_password@postgres:5432/householdplanet_db'
    }
  }
});

const categories = [
  {
    name: 'Kitchen and Dining',
    slug: 'kitchen-dining',
    description: 'Complete kitchen essentials and dining accessories',
    image: '/images/categories/kitchen.svg',
    children: [
      { name: 'Cookware', slug: 'cookware', description: 'Pots, pans, and cooking vessels' },
      { name: 'Utensils', slug: 'utensils', description: 'Kitchen tools and utensils' },
      { name: 'Dinnerware', slug: 'dinnerware', description: 'Plates, bowls, and serving dishes' },
      { name: 'Kitchen Appliances', slug: 'kitchen-appliances', description: 'Small kitchen appliances' },
      { name: 'Kitchen Storage', slug: 'kitchen-storage', description: 'Food storage and organization' }
    ]
  },
  {
    name: 'Bathroom Accessories',
    slug: 'bathroom-accessories',
    description: 'Essential bathroom items and accessories',
    image: '/images/categories/bathroom.svg',
    children: [
      { name: 'Towels', slug: 'towels', description: 'Bath towels and washcloths' },
      { name: 'Bath Mats', slug: 'bath-mats', description: 'Non-slip bathroom mats' },
      { name: 'Bathroom Organizers', slug: 'bathroom-organizers', description: 'Storage and organization solutions' },
      { name: 'Bathroom Fixtures', slug: 'bathroom-fixtures', description: 'Faucets, handles, and hardware' },
      { name: 'Bathroom Decor', slug: 'bathroom-decor', description: 'Decorative bathroom accessories' }
    ]
  },
  {
    name: 'Cleaning and Laundry',
    slug: 'cleaning-laundry',
    description: 'Cleaning supplies and laundry essentials',
    image: '/images/categories/cleaning.svg',
    children: [
      { name: 'Cleaning Supplies', slug: 'cleaning-supplies', description: 'Detergents, disinfectants, and cleaners' },
      { name: 'Cleaning Tools', slug: 'cleaning-tools', description: 'Mops, brooms, and cleaning equipment' },
      { name: 'Laundry Accessories', slug: 'laundry-accessories', description: 'Baskets, hangers, and laundry aids' }
    ]
  },
  {
    name: 'Beddings and Bedroom Accessories',
    slug: 'beddings-bedroom',
    description: 'Comfortable bedding and bedroom essentials',
    image: '/images/categories/bedroom.svg',
    children: [
      { name: 'Bed Sheets', slug: 'bed-sheets', description: 'Quality bed sheets and pillowcases' },
      { name: 'Comforters', slug: 'comforters', description: 'Duvets, comforters, and blankets' },
      { name: 'Pillows', slug: 'pillows', description: 'Sleeping and decorative pillows' },
      { name: 'Mattress Protectors', slug: 'mattress-protectors', description: 'Mattress covers and protectors' }
    ]
  },
  {
    name: 'Storage and Organization',
    slug: 'storage-organization',
    description: 'Smart storage solutions for every space',
    image: '/images/categories/storage.svg',
    children: [
      { name: 'Storage Containers', slug: 'storage-containers', description: 'Boxes, bins, and containers' },
      { name: 'Shelving', slug: 'shelving', description: 'Wall shelves and storage units' },
      { name: 'Closet Organizers', slug: 'closet-organizers', description: 'Wardrobe and closet organization' },
      { name: 'Storage Baskets', slug: 'storage-baskets', description: 'Decorative and functional baskets' }
    ]
  }
];

async function seedProductionCategories() {
  console.log('🌱 Starting production category seeding...');
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection established');

    // Clear existing categories
    await prisma.category.deleteMany({});
    console.log('🗑️ Cleared existing categories');

    let createdCount = 0;

    for (const categoryData of categories) {
      // Create parent category
      const parentCategory = await prisma.category.create({
        data: {
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          image: categoryData.image,
          isActive: true,
          sortOrder: createdCount
        }
      });
      createdCount++;
      console.log(`🆕 Created parent category: ${categoryData.name}`);

      // Create subcategories
      if (categoryData.children && categoryData.children.length > 0) {
        for (let i = 0; i < categoryData.children.length; i++) {
          const childData = categoryData.children[i];
          
          await prisma.category.create({
            data: {
              name: childData.name,
              slug: childData.slug,
              description: childData.description,
              parentId: parentCategory.id,
              isActive: true,
              sortOrder: i
            }
          });
          createdCount++;
          console.log(`  🆕 Created subcategory: ${childData.name}`);
        }
      }
    }

    console.log(`\n🎉 Production category seeding completed!`);
    console.log(`📊 Created: ${createdCount} categories`);
    
    // Verify categories
    const totalCategories = await prisma.category.count();
    const hierarchyTest = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: true
      }
    });
    
    console.log(`✅ Total categories in database: ${totalCategories}`);
    console.log(`✅ Parent categories: ${hierarchyTest.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding production categories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedProductionCategories()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });