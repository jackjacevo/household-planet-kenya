const axios = require('axios');

async function testAdminDeliveryLocations() {
  try {
    console.log('🔍 Testing admin delivery locations endpoint...\n');

    // First, login as admin to get token
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin123!@#'
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Admin login successful');

    // Test the admin delivery locations endpoint
    console.log('\n2. Testing admin delivery locations endpoint...');
    const locationsResponse = await axios.get('http://localhost:3001/admin/delivery-locations', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Admin delivery locations response:', locationsResponse.data);
    console.log(`Found ${locationsResponse.data.data?.length || 0} delivery locations`);

    // Test getting locations by tier
    console.log('\n3. Testing locations by tier...');
    for (let tier = 1; tier <= 4; tier++) {
      const tierResponse = await axios.get(`http://localhost:3001/admin/delivery-locations/tiers?tier=${tier}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(`Tier ${tier}: ${tierResponse.data.data?.length || 0} locations`);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAdminDeliveryLocations();