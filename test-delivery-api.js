const axios = require('axios');

async function testDeliveryAPI() {
  try {
    console.log('Testing delivery locations API...');
    
    const response = await axios.get('http://localhost:3001/api/simple-delivery/locations', {
      timeout: 10000,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('✅ Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data) {
      console.log(`✅ Found ${response.data.data.length} delivery locations`);
      
      // Show first few locations
      response.data.data.slice(0, 5).forEach((location, index) => {
        console.log(`  ${index + 1}. ${location.name} - Tier ${location.tier} - KSh ${location.price}`);
      });
    } else {
      console.log('❌ API returned unsuccessful response');
    }
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Backend server is not running on port 3001');
    }
  }
}

testDeliveryAPI();