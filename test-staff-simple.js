const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testStaffEndpoint() {
  try {
    // Login
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'HouseholdAdmin2024!'
    });
    
    console.log('Login successful, token received');
    console.log('Login response:', loginResponse.data);
    const token = loginResponse.data.accessToken;
    
    // Test staff endpoint
    const headers = { 'Authorization': `Bearer ${token}` };
    console.log('Making request to /api/admin/staff...');
    
    const response = await axios.get(`${API_URL}/admin/staff`, { headers });
    console.log('✅ Staff endpoint works!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
    console.log('Headers sent:', error.config?.headers);
  }
}

testStaffEndpoint();