const axios = require('axios');

async function testExactSearch() {
  try {
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'HouseholdAdmin2024!'
    });

    const token = loginResponse.data.access_token;
    const headers = { 'Authorization': `Bearer ${token}` };

    // Test exact matches
    console.log('Testing exact "Peter"...');
    const peterResponse = await axios.get('http://localhost:3001/api/admin/activities?search=Peter', { headers });
    console.log(`Found ${peterResponse.data.data.length} activities for "Peter"`);

    console.log('Testing exact "LOGIN"...');
    const loginResponse2 = await axios.get('http://localhost:3001/api/admin/activities?search=LOGIN', { headers });
    console.log(`Found ${loginResponse2.data.data.length} activities for "LOGIN"`);

  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testExactSearch();