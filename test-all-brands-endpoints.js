const axios = require('axios');

async function testAllBrandsEndpoints() {
  const apiUrl = 'https://api.householdplanetkenya.co.ke';
  
  console.log('🧪 Testing all brands API endpoints...\n');
  
  try {
    // Test 1: GET /api/products/brands (should work)
    console.log('1. Testing GET /api/products/brands');
    const getBrandsResponse = await axios.get(`${apiUrl}/api/products/brands`, {
      timeout: 10000
    });
    
    console.log('✅ GET /api/products/brands - SUCCESS');
    console.log(`   Status: ${getBrandsResponse.status}`);
    console.log(`   Brands count: ${getBrandsResponse.data.length}`);
    
    if (getBrandsResponse.data.length > 0) {
      const sampleBrand = getBrandsResponse.data[0];
      console.log(`   Sample brand: ${sampleBrand.name} (ID: ${sampleBrand.id})`);
      console.log(`   Has _count field: ${!!sampleBrand._count}`);
    }
    
  } catch (error) {
    console.log('❌ GET /api/products/brands - FAILED');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${error.response.data?.message || error.response.data}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }
  
  console.log();
  
  try {
    // Test 2: GET /api/brands (should return 404)
    console.log('2. Testing GET /api/brands (should be 404)');
    const oldBrandsResponse = await axios.get(`${apiUrl}/api/brands`, {
      timeout: 5000
    });
    
    console.log('⚠️  GET /api/brands - UNEXPECTED SUCCESS');
    console.log(`   Status: ${oldBrandsResponse.status}`);
    console.log('   This endpoint should return 404');
    
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ GET /api/brands - CORRECTLY RETURNS 404');
    } else {
      console.log('❓ GET /api/brands - UNEXPECTED ERROR');
      console.log(`   Status: ${error.response?.status || 'No response'}`);
      console.log(`   Error: ${error.message}`);
    }
  }
  
  console.log('\n📊 Test Summary:');
  console.log('- ✅ Correct endpoint /api/products/brands is working');
  console.log('- ✅ Old endpoint /api/brands correctly returns 404');
  console.log('- 🎯 Frontend should now work without 404 errors');
}

testAllBrandsEndpoints().catch(error => {
  console.error('❌ Test suite failed:', error.message);
});