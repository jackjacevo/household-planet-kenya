const http = require('http');

async function testOrdersFetching() {
  console.log('🔍 Testing Orders Fetching...\n');

  try {
    // Test 1: Register a test user
    console.log('1. Registering test user...');
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`,
      password: 'Password123!',
      phone: '+254700000000'
    };

    const registerResponse = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    if (registerResponse.ok) {
      console.log('✅ Registration successful');
      
      // Test 2: Login
      console.log('2. Logging in...');
      const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Login successful');
        
        const token = loginData.accessToken;
        console.log('Token received:', token ? 'Yes' : 'No');
        
        if (token) {
          // Test 3: Test orders endpoint
          console.log('3. Testing orders endpoint...');
          const ordersResponse = await fetch('http://localhost:3001/api/orders/my-orders', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (ordersResponse.ok) {
            const ordersData = await ordersResponse.json();
            console.log('✅ Orders API working correctly!');
            console.log(`📊 Response structure:`, {
              hasOrders: !!ordersData.orders,
              ordersCount: ordersData.orders?.length || 0,
              isArray: Array.isArray(ordersData.orders)
            });
            
            console.log('\n🎉 CONCLUSION: Orders fetching is working properly!');
            console.log('The user account/orders page should be able to fetch orders correctly.');
            
            if (ordersData.orders?.length === 0) {
              console.log('📝 Note: No orders found (normal for new user)');
            }
          } else {
            const errorText = await ordersResponse.text();
            console.log('❌ Orders API failed:', ordersResponse.status, errorText);
          }
        } else {
          console.log('❌ No token received from login');
        }
      } else {
        const errorText = await loginResponse.text();
        console.log('❌ Login failed:', errorText);
      }
    } else {
      const errorText = await registerResponse.text();
      console.log('❌ Registration failed:', errorText);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// Use node-fetch if available, otherwise use built-in fetch
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

testOrdersFetching();