const axios = require('axios');

// Test API integration
async function testApiIntegration() {
  const baseURL = 'http://localhost:3001';
  
  console.log('🔍 Testing API Integration...\n');
  
  // Test 1: Health check
  try {
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${baseURL}/health`, { timeout: 5000 });
    console.log('✅ Health check:', healthResponse.status, healthResponse.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
  
  // Test 2: Auth endpoint structure
  try {
    console.log('\n2. Testing auth login endpoint structure...');
    const authResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'test@example.com',
      password: 'wrongpassword'
    }, { timeout: 5000 });
  } catch (error) {
    if (error.response) {
      console.log('✅ Auth endpoint accessible:', error.response.status);
      console.log('   Response structure:', Object.keys(error.response.data));
    } else {
      console.log('❌ Auth endpoint failed:', error.message);
    }
  }
  
  // Test 3: Admin endpoints (without auth)
  try {
    console.log('\n3. Testing admin dashboard endpoint...');
    const adminResponse = await axios.get(`${baseURL}/admin/dashboard`, { timeout: 5000 });
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Admin endpoint accessible (requires auth):', error.response.status);
    } else {
      console.log('❌ Admin endpoint failed:', error.message);
    }
  }
  
  // Test 4: Products endpoint
  try {
    console.log('\n4. Testing products endpoint...');
    const productsResponse = await axios.get(`${baseURL}/products`, { timeout: 5000 });
    console.log('✅ Products endpoint:', productsResponse.status);
    console.log('   Data structure:', typeof productsResponse.data, Array.isArray(productsResponse.data) ? 'Array' : 'Object');
  } catch (error) {
    if (error.response) {
      console.log('⚠️ Products endpoint accessible but returned:', error.response.status);
    } else {
      console.log('❌ Products endpoint failed:', error.message);
    }
  }
  
  // Test 5: Categories endpoint
  try {
    console.log('\n5. Testing categories endpoint...');
    const categoriesResponse = await axios.get(`${baseURL}/categories`, { timeout: 5000 });
    console.log('✅ Categories endpoint:', categoriesResponse.status);
  } catch (error) {
    if (error.response) {
      console.log('⚠️ Categories endpoint accessible but returned:', error.response.status);
    } else {
      console.log('❌ Categories endpoint failed:', error.message);
    }
  }
  
  console.log('\n📊 API Integration Test Complete');
}

testApiIntegration().catch(console.error);