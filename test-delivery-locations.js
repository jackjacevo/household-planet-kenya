const axios = require('axios');

async function testDeliveryLocations() {
  try {
    console.log('Testing delivery locations endpoint...');
    
    // Test direct backend endpoint
    const response = await axios.get('http://localhost:3001/admin/delivery-locations', {
      headers: {
        'Authorization': 'Bearer test-token' // This will fail auth but should show if endpoint exists
      }
    });
    
    console.log('Response:', response.data);
  } catch (error) {
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('✅ Endpoint exists but requires authentication');
    } else if (error.response?.status === 404) {
      console.log('❌ Endpoint not found');
    }
  }
}

testDeliveryLocations();