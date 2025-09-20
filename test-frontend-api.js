const fetch = require('node-fetch');

async function testFrontendAPI() {
  console.log('🔍 Testing Frontend API Fix...\n');

  try {
    const response = await fetch('http://localhost:3000/api/delivery/locations');
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ SUCCESS - Frontend API returns ${data.data?.length || 0} locations`);
    } else {
      console.log(`❌ FAILED - Frontend API error`);
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    console.log('Make sure frontend is running on localhost:3000');
  }
}

testFrontendAPI();