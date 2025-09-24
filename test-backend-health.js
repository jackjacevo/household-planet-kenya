const axios = require('axios');

const API_URL = 'https://api.householdplanetkenya.co.ke';

async function testBackendHealth() {
  console.log('🏥 Testing backend health...');
  
  try {
    // Test basic health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Health endpoint:', healthResponse.status, healthResponse.data);
  } catch (error) {
    console.log('❌ Health endpoint failed:', error.response?.status || error.message);
  }
  
  try {
    // Test root endpoint
    console.log('2. Testing root endpoint...');
    const rootResponse = await axios.get(`${API_URL}/`);
    console.log('✅ Root endpoint:', rootResponse.status, rootResponse.data);
  } catch (error) {
    console.log('❌ Root endpoint failed:', error.response?.status || error.message);
  }
  
  try {
    // Test if auth module is loaded
    console.log('3. Testing auth module availability...');
    const authResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@test.com',
      password: 'wrongpassword'
    });
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 400) {
      console.log('✅ Auth endpoint exists (got expected error):', error.response.status);
    } else if (error.response?.status === 404) {
      console.log('❌ Auth endpoint not found:', error.response.status);
    } else {
      console.log('⚠️ Auth endpoint error:', error.response?.status || error.message);
    }
  }
  
  try {
    // Test admin module
    console.log('4. Testing admin module availability...');
    const adminResponse = await axios.get(`${API_URL}/admin/dashboard`);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Admin endpoint exists (needs auth):', error.response.status);
    } else if (error.response?.status === 404) {
      console.log('❌ Admin endpoint not found:', error.response.status);
    } else {
      console.log('⚠️ Admin endpoint error:', error.response?.status || error.message);
    }
  }
  
  console.log('\n📋 Backend Status Summary:');
  console.log('- API URL:', API_URL);
  console.log('- Check if backend is running');
  console.log('- Check if modules are properly loaded');
}

testBackendHealth();