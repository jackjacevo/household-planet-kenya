const axios = require('axios');

async function testConnection() {
  console.log('🔗 Testing Frontend-Backend Communication...\n');
  
  const frontendUrl = 'https://householdplanetkenya.co.ke';
  const backendUrl = 'https://api.householdplanetkenya.co.ke';
  
  try {
    // Test 1: Backend health check
    console.log('1. Testing backend health...');
    const healthResponse = await axios.get(`${backendUrl}/health`);
    console.log('✅ Backend health:', healthResponse.data);
    
    // Test 2: CORS test
    console.log('\n2. Testing CORS...');
    const corsResponse = await axios.get(`${backendUrl}/cors-test`, {
      headers: {
        'Origin': frontendUrl
      }
    });
    console.log('✅ CORS test:', corsResponse.data);
    
    // Test 3: API endpoint
    console.log('\n3. Testing API endpoint...');
    const apiResponse = await axios.get(`${backendUrl}/api/health`);
    console.log('✅ API health:', apiResponse.data);
    
    // Test 4: Categories endpoint (public)
    console.log('\n4. Testing categories endpoint...');
    const categoriesResponse = await axios.get(`${backendUrl}/api/categories`);
    console.log('✅ Categories loaded:', categoriesResponse.data?.length || 0, 'categories');
    
    console.log('\n🎉 All tests passed! Frontend-Backend communication is working properly.');
    
  } catch (error) {
    console.error('\n❌ Connection test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testConnection();