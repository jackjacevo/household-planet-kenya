const axios = require('axios');

async function testBrandsCRUD() {
  const apiUrl = 'https://api.householdplanetkenya.co.ke';
  
  // You'll need to get a valid admin token for testing POST/PUT/DELETE
  // For now, we'll test the GET endpoint which should work without auth
  
  try {
    console.log('🧪 Testing Brands CRUD API...\n');
    
    // Test 1: GET /api/products/brands
    console.log('1. Testing GET /api/products/brands');
    const getBrandsResponse = await axios.get(`${apiUrl}/api/products/brands`, {
      timeout: 10000
    });
    
    console.log('✅ GET brands successful');
    console.log(`   Status: ${getBrandsResponse.status}`);
    console.log(`   Brands found: ${getBrandsResponse.data.length}`);
    
    if (getBrandsResponse.data.length > 0) {
      const sampleBrand = getBrandsResponse.data[0];
      console.log(`   Sample brand: ${sampleBrand.name} (ID: ${sampleBrand.id})`);
      console.log(`   Has _count field: ${!!sampleBrand._count}`);
    }
    
    console.log('\n✅ All accessible brand endpoints are working correctly!');
    console.log('\n📝 Note: POST, PUT, DELETE endpoints require admin authentication');
    console.log('   These will be tested after deployment when admin can log in.');
    
  } catch (error) {
    console.log('❌ Brand API test failed:');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${error.response.data?.message || error.response.data}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    process.exit(1);
  }
}

testBrandsCRUD();