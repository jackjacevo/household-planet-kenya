const fetch = require('node-fetch');

async function testDeliveryEndpoint() {
  console.log('🔍 Testing Delivery Endpoint Fix...\n');

  const endpoints = [
    'https://api.householdplanetkenya.co.ke/simple-delivery/locations',
    'https://api.householdplanetkenya.co.ke/api/simple-delivery/locations',
    'https://api.householdplanetkenya.co.ke/delivery/locations'
  ];

  for (const url of endpoints) {
    try {
      console.log(`Testing: ${url}`);
      const response = await fetch(url);
      console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ SUCCESS - Found ${data.data?.length || 0} locations\n`);
        return;
      } else {
        console.log(`❌ FAILED\n`);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}\n`);
    }
  }

  console.log('🔧 All endpoints failed. Backend may need restart.');
}

testDeliveryEndpoint();