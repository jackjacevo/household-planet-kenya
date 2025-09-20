const fetch = require('node-fetch');

async function testDeliveryAPI() {
  try {
    console.log('🧪 Testing Delivery Locations API...');
    
    // Test the backend API directly
    const backendUrl = 'http://localhost:3001/simple-delivery/locations';
    console.log(`📡 Testing backend: ${backendUrl}`);
    
    const response = await fetch(backendUrl);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend API Response:', {
        success: data.success,
        locationCount: data.data?.length || 0,
        firstLocation: data.data?.[0]?.name || 'None'
      });
    } else {
      console.log('❌ Backend API Error:', response.status, response.statusText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDeliveryAPI();