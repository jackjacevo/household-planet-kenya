// Test CORS configuration
const testCORS = async () => {
  console.log('Testing CORS configuration...');
  
  const apiUrl = 'https://api.householdplanetkenya.co.ke/api/products?limit=6&featured=true';
  const frontendUrl = 'https://householdplanetkenya.co.ke';
  
  try {
    // Test with credentials: 'include'
    const response = await fetch(apiUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Origin': frontendUrl,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:');
    for (let [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ CORS is working correctly');
      console.log('Data received:', data);
    } else {
      console.log('❌ Response not OK:', response.statusText);
    }
    
  } catch (error) {
    console.error('❌ CORS test failed:', error.message);
  }
};

// Test without credentials
const testCORSWithoutCredentials = async () => {
  console.log('\nTesting CORS without credentials...');
  
  const apiUrl = 'https://api.householdplanetkenya.co.ke/api/products?limit=6&featured=true';
  
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:');
    for (let [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Request without credentials works');
    } else {
      console.log('❌ Response not OK:', response.statusText);
    }
    
  } catch (error) {
    console.error('❌ Test without credentials failed:', error.message);
  }
};

// Run tests
testCORS();
testCORSWithoutCredentials();