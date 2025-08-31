const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testAdminActivities() {
  try {
    console.log('🧪 Testing Admin Activities API...');

    // First, login as admin to get token
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@householdplanet.co.ke',
      password: 'HouseholdAdmin2024!'
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Admin login successful');

    const headers = { 'Authorization': `Bearer ${token}` };

    // Test activities endpoint
    console.log('\n📊 Testing activities endpoint...');
    const activitiesResponse = await axios.get(`${API_URL}/admin/activities`, { headers });
    console.log(`✅ Activities fetched: ${activitiesResponse.data.data.length} activities`);
    console.log(`📄 Total pages: ${activitiesResponse.data.meta.totalPages}`);

    // Test stats endpoint
    console.log('\n📈 Testing stats endpoint...');
    const statsResponse = await axios.get(`${API_URL}/admin/activities/stats`, { headers });
    console.log('✅ Stats fetched successfully:');
    console.log(`   Total Activities: ${statsResponse.data.totalActivities}`);
    console.log(`   Last 24h: ${statsResponse.data.activitiesLast24h}`);
    console.log(`   Last 7d: ${statsResponse.data.activitiesLast7d}`);
    console.log(`   Top Actions: ${statsResponse.data.topActions.length}`);
    console.log(`   Active Users: ${statsResponse.data.activeUsers.length}`);

    // Test with filters
    console.log('\n🔍 Testing with filters...');
    const filteredResponse = await axios.get(`${API_URL}/admin/activities?action=LOGIN&limit=5`, { headers });
    console.log(`✅ Filtered activities: ${filteredResponse.data.data.length} activities`);

    console.log('\n🎉 All tests passed! Admin Activities API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAdminActivities();