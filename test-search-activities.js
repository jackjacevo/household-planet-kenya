const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testSearchActivities() {
  try {
    // Login first
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@householdplanet.co.ke',
      password: 'HouseholdAdmin2024!'
    });

    const token = loginResponse.data.access_token;
    const headers = { 'Authorization': `Bearer ${token}` };

    // Test without search
    console.log('Testing without search...');
    const allActivities = await axios.get(`${API_URL}/admin/activities`, { headers });
    console.log(`Found ${allActivities.data.data.length} activities total`);
    
    if (allActivities.data.data.length > 0) {
      console.log('Sample activity:', allActivities.data.data[0]);
    }

    // Test with search for "peter"
    console.log('\nTesting search for "peter"...');
    const searchResponse = await axios.get(`${API_URL}/admin/activities?search=peter`, { headers });
    console.log(`Found ${searchResponse.data.data.length} activities for "peter"`);

    // Test with search for "LOGIN"
    console.log('\nTesting search for "LOGIN"...');
    const loginSearch = await axios.get(`${API_URL}/admin/activities?search=LOGIN`, { headers });
    console.log(`Found ${loginSearch.data.data.length} activities for "LOGIN"`);

  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testSearchActivities();