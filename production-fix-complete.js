#!/usr/bin/env node

/**
 * Complete Production Fix Script
 * This script fixes the categories API issue on production
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Initialize Prisma with the correct database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./dev.db'
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

async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function seedCategories() {
  console.log('🌱 Starting category seeding...');
  
  try {
    // Check existing categories
    const existingCount = await prisma.category.count();
    console.log(`📋 Found ${existingCount} existing categories`);
    
    if (existingCount > 0) {
      console.log('⚠️ Categories already exist. Skipping seeding.');
      return existingCount;
    }
    
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
    
    console.log(`🎉 Successfully created ${createdCount} categories`);
    return createdCount;
    
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
}

async function verifyCategories() {
  console.log('🔍 Verifying categories...');
  
  try {
    // Test hierarchy query
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
    
    console.log(`✅ Hierarchy query successful`);
    console.log(`📊 Found ${hierarchyCategories.length} parent categories`);
    
    hierarchyCategories.forEach(cat => {
      console.log(`   - ${cat.name}: ${cat.children.length} children`);
    });
    
    return hierarchyCategories;
    
  } catch (error) {
    console.error('❌ Error verifying categories:', error);
    throw error;
  }
}

async function createHealthCheckScript() {
  const healthCheckScript = `#!/bin/bash
# Health check script for production

echo "🏥 Running production health check..."

# Check if the application is running
if pgrep -f "node.*main.js" > /dev/null; then
    echo "✅ Application process is running"
else
    echo "❌ Application process not found"
    exit 1
fi

# Check database
echo "🗄️ Checking database..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.category.count()
  .then(count => {
    console.log(\`✅ Database accessible, \${count} categories found\`);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Database error:', err.message);
    process.exit(1);
  })
  .finally(() => prisma.\$disconnect());
"

# Check API endpoint
echo "🌐 Checking API endpoint..."
curl -f -s "http://localhost:3001/api/categories/hierarchy" > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ API endpoint responding"
else
    echo "❌ API endpoint not responding"
    exit 1
fi

echo "🎉 All health checks passed!"
`;

  fs.writeFileSync('health-check.sh', healthCheckScript);
  console.log('📝 Created health-check.sh script');
}

async function main() {
  console.log('🚀 Starting complete production fix...\n');
  
  try {
    // Step 1: Check database connection
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      throw new Error('Cannot connect to database');
    }
    
    // Step 2: Seed categories if needed
    await seedCategories();
    
    // Step 3: Verify categories work
    await verifyCategories();
    
    // Step 4: Create health check script
    await createHealthCheckScript();
    
    console.log('\n🎉 Production fix completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Restart your application server');
    console.log('2. Run ./health-check.sh to verify everything works');
    console.log('3. Test the frontend at https://householdplanetkenya.co.ke');
    
  } catch (error) {
    console.error('\n❌ Production fix failed:', error);
    console.error('\n🔧 Troubleshooting steps:');
    console.error('1. Check if the database file exists and is writable');
    console.error('2. Verify environment variables are set correctly');
    console.error('3. Ensure the application has proper permissions');
    console.error('4. Check server logs for additional errors');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
main();