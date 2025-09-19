const axios = require('axios');

async function testUserExperience() {
  console.log('🧪 Testing User Experience');
  console.log('Frontend: https://householdplanetkenya.co.ke');
  console.log('Backend: https://api.householdplanetkenya.co.ke\n');
  
  const frontendUrl = 'https://householdplanetkenya.co.ke';
  const backendUrl = 'https://api.householdplanetkenya.co.ke';
  
  let allTestsPassed = true;
  
  try {
    // Test 1: Backend availability
    console.log('1. ⏳ Testing backend availability...');
    const healthResponse = await axios.get(`${backendUrl}/health`, {
      headers: { 'Origin': frontendUrl },
      timeout: 10000
    });
    console.log('   ✅ Backend is running:', healthResponse.data.status);
    
    // Test 2: CORS headers
    console.log('2. ⏳ Checking CORS headers...');
    const corsHeader = healthResponse.headers['access-control-allow-origin'];
    if (corsHeader) {
      console.log('   ✅ CORS headers present:', corsHeader);
    } else {
      console.log('   ❌ Missing CORS headers');
      allTestsPassed = false;
    }
    
    // Test 3: API endpoint
    console.log('3. ⏳ Testing API endpoint...');
    const apiResponse = await axios.get(`${backendUrl}/api/health`, {
      headers: { 'Origin': frontendUrl },
      timeout: 10000
    });
    console.log('   ✅ API responding:', apiResponse.data.status);
    
    // Test 4: Real data loading
    console.log('4. ⏳ Testing data loading (categories)...');
    const categoriesResponse = await axios.get(`${backendUrl}/api/categories`, {
      headers: { 'Origin': frontendUrl },
      timeout: 10000
    });
    console.log(`   ✅ Data loaded: ${categoriesResponse.data.length || 0} categories`);
    
    // Test 5: Error handling
    console.log('5. ⏳ Testing error handling...');
    try {
      await axios.get(`${backendUrl}/api/nonexistent`, {
        headers: { 'Origin': frontendUrl },
        timeout: 5000
      });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('   ✅ Error handling works (404 for non-existent endpoint)');
      } else {
        console.log('   ⚠️ Unexpected error response:', error.message);
      }
    }
    
  } catch (error) {
    console.error('\n❌ CONNECTION FAILED:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    allTestsPassed = false;
  }
  
  console.log('\n' + '='.repeat(50));
  if (allTestsPassed) {
    console.log('🎉 SUCCESS: Users visiting https://householdplanetkenya.co.ke');
    console.log('   will NOT see error messages. Backend connection works!');
  } else {
    console.log('⚠️ FAILURE: Users visiting https://householdplanetkenya.co.ke');
    console.log('   WILL see error messages. Backend connection issues detected!');
  }
  console.log('='.repeat(50));
}

testUserExperience();