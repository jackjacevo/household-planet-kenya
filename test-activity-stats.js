const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
const credentials = {
  email: 'householdplanet819@gmail.com',
  password: 'Admin@2025'
};

async function testActivityStats() {
  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, credentials);
    const { accessToken, user } = loginResponse.data;
    
    console.log('User role:', user.role);
    
    const headers = { Authorization: `Bearer ${accessToken}` };
    
    // Test the specific endpoint
    try {
      const response = await axios.get(`${API_BASE}/admin/activities/stats`, { headers });
      console.log('✅ Activity Stats:', response.status, response.data);
    } catch (error) {
      console.log('❌ Activity Stats Error:', error.response?.status, error.response?.data);
    }
    
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
  }
}

testActivityStats();