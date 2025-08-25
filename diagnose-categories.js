const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function diagnoseCategoriesIssue() {
  console.log('🔍 Diagnosing Categories Issue...\n');

  // 1. Check database connection and categories
  console.log('1. Checking database connection and categories...');
  try {
    const categories = await prisma.category.findMany({
      select: { 
        id: true, 
        name: true, 
        slug: true, 
        parentId: true, 
        isActive: true 
      }
    });
    
    console.log(`✅ Database connected. Found ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`   - ID: ${cat.id}, Name: "${cat.name}", Slug: "${cat.slug}", Active: ${cat.isActive}, Parent: ${cat.parentId}`);
    });
    
    if (categories.length === 0) {
      console.log('❌ No categories found in database!');
    }
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
  }

  console.log('\n2. Checking API server status...');
  
  // 2. Check if backend server is running
  const apiUrl = 'http://localhost:3001';
  try {
    const healthResponse = await fetch(`${apiUrl}/api/health`);
    if (healthResponse.ok) {
      console.log('✅ Backend server is running');
    } else {
      console.log(`⚠️ Backend server responded with status: ${healthResponse.status}`);
    }
  } catch (error) {
    console.log('❌ Backend server is not running or not accessible:', error.message);
    console.log('   Make sure to run: cd household-planet-backend && npm run start:dev');
  }

  // 3. Test categories API endpoint
  console.log('\n3. Testing categories API endpoint...');
  try {
    const categoriesResponse = await fetch(`${apiUrl}/api/categories/hierarchy`);
    console.log(`   Status: ${categoriesResponse.status}`);
    
    if (categoriesResponse.ok) {
      const data = await categoriesResponse.json();
      console.log(`✅ Categories API working. Returned ${Array.isArray(data) ? data.length : 'non-array'} items`);
      if (Array.isArray(data) && data.length > 0) {
        console.log('   Sample category:', JSON.stringify(data[0], null, 2));
      }
    } else {
      const errorText = await categoriesResponse.text();
      console.log('❌ Categories API failed:', errorText);
    }
  } catch (error) {
    console.log('❌ Categories API request failed:', error.message);
  }

  // 4. Check CORS configuration
  console.log('\n4. Checking CORS configuration...');
  try {
    const corsResponse = await fetch(`${apiUrl}/api/categories/hierarchy`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET'
      }
    });
    console.log(`   CORS preflight status: ${corsResponse.status}`);
    const corsHeaders = corsResponse.headers.get('access-control-allow-origin');
    console.log(`   CORS allow origin: ${corsHeaders}`);
  } catch (error) {
    console.log('❌ CORS check failed:', error.message);
  }

  console.log('\n📋 Diagnosis Summary:');
  console.log('   - Check if backend server is running: npm run start:dev');
  console.log('   - Check if database has categories: run seed script if empty');
  console.log('   - Check browser console for detailed error messages');
  console.log('   - Verify API URL in frontend .env.local file');

  await prisma.$disconnect();
}

diagnoseCategoriesIssue().catch(console.error);