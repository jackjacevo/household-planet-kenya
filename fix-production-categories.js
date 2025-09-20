const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

// Initialize Prisma with SQLite for production
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
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
      { name: 'Kitchen Appliances', slug: 'kitchen-appliances', description: 'Small kitchen appliances' }
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
      { name: 'Bathroom Organizers', slug: 'bathroom-organizers', description: 'Storage and organization solutions' }
    ]
  },
  {
    name: 'Cleaning and Laundry',
    slug: 'cleaning-laundry',
    description: 'Cleaning supplies and laundry essentials',
    image: '/images/categories/cleaning.svg',
    children: [
      { name: 'Cleaning Supplies', slug: 'cleaning-supplies', description: 'Detergents, disinfectants, and cleaners' },
      { name: 'Cleaning Tools', slug: 'cleaning-tools', description: 'Mops, brooms, and cleaning equipment' }
    ]
  },
  {
    name: 'Home Decor',
    slug: 'home-decor',
    description: 'Beautiful decor items to enhance your home',
    image: '/images/categories/decor.svg',
    children: [
      { name: 'Wall Art', slug: 'wall-art', description: 'Paintings, prints, and wall decorations' },
      { name: 'Decorative Items', slug: 'decorative-items', description: 'Vases, sculptures, and ornaments' }
    ]
  },
  {
    name: 'Storage and Organization',
    slug: 'storage-organization',
    description: 'Smart storage solutions for every space',
    image: '/images/categories/storage.svg',
    children: [
      { name: 'Storage Containers', slug: 'storage-containers', description: 'Boxes, bins, and containers' },
      { name: 'Shelving', slug: 'shelving', description: 'Wall shelves and storage units' }
    ]
  }
];

async function fixProductionCategories() {
  console.log('🔧 Fixing production categories...\n');
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection established');

    // Check current categories
    const existingCategories = await prisma.category.findMany();
    console.log(`📋 Found ${existingCategories.length} existing categories`);

    if (existingCategories.length === 0) {
      console.log('🌱 No categories found, seeding...');
      
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
        console.log(`🆕 Created parent: ${categoryData.name}`);

        // Create subcategories
        if (categoryData.children) {
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
            console.log(`  🆕 Created child: ${childData.name}`);
          }
        }
      }

      console.log(`\n🎉 Created ${createdCount} categories`);
    } else {
      console.log('✅ Categories already exist');
    }

    // Test the hierarchy endpoint
    const hierarchyCategories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    console.log(`\n📊 Hierarchy test results:`);
    console.log(`   - Parent categories: ${hierarchyCategories.length}`);
    
    hierarchyCategories.forEach(cat => {
      console.log(`   - ${cat.name}: ${cat.children.length} children`);
    });

    // Test API endpoint if possible
    console.log('\n🌐 Testing API endpoint...');
    try {
      const response = await fetch('http://localhost:3001/api/categories/hierarchy');
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ API returned ${data.length} categories`);
      } else {
        console.log(`⚠️ API returned status: ${response.status}`);
      }
    } catch (apiError) {
      console.log('⚠️ Could not test API (server may not be running locally)');
    }

    console.log('\n✅ Production categories fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing production categories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixProductionCategories()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });