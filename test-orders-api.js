const fetch = require('node-fetch');

async function testOrdersAPI() {
  const API_URL = 'http://localhost:3001';
  
  console.log('🔍 Testing Orders API...\n');

  // Test 1: Check if backend is running
  try {
    console.log('1. Testing backend connection...');
    const healthResponse = await fetch(`${API_URL}/api/auth/health`);
    if (healthResponse.ok) {
      console.log('✅ Backend is running');
    } else {
      console.log('❌ Backend health check failed');
      return;
    }
  } catch (error) {
    console.log('❌ Backend is not running:', error.message);
    console.log('💡 Please start the backend with: cd household-planet-backend && npm run start:dev');
    return;
  }

  // Test 2: Try to access orders endpoint without auth (should fail)
  try {
    console.log('\n2. Testing orders endpoint without authentication...');
    const ordersResponse = await fetch(`${API_URL}/api/orders/my-orders`);
    if (ordersResponse.status === 401) {
      console.log('✅ Orders endpoint properly requires authentication');
    } else {
      console.log('⚠️ Orders endpoint should require authentication');
    }
  } catch (error) {
    console.log('❌ Error testing orders endpoint:', error.message);
  }

  // Test 3: Check if we can create a test user and login
  try {
    console.log('\n3. Testing user registration and login...');
    
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      phone: '+254700000000'
    };

    // Register test user
    const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    if (registerResponse.ok) {
      console.log('✅ User registration successful');
      
      // Login with test user
      const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        const token = loginData.access_token;
        console.log('✅ User login successful');

        // Test 4: Test orders endpoint with authentication
        console.log('\n4. Testing orders endpoint with authentication...');
        const myOrdersResponse = await fetch(`${API_URL}/api/orders/my-orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (myOrdersResponse.ok) {
          const ordersData = await myOrdersResponse.json();
          console.log('✅ Orders API working correctly');
          console.log(`📊 Found ${ordersData.orders?.length || 0} orders for user`);
          
          if (ordersData.orders && ordersData.orders.length > 0) {
            console.log('📋 Sample order structure:');
            const sampleOrder = ordersData.orders[0];
            console.log({
              id: sampleOrder.id,
              orderNumber: sampleOrder.orderNumber,
              status: sampleOrder.status,
              total: sampleOrder.total,
              itemsCount: sampleOrder.items?.length || 0
            });
          } else {
            console.log('📝 No orders found (this is normal for a new user)');
          }
        } else {
          const errorText = await myOrdersResponse.text();
          console.log('❌ Orders API failed:', myOrdersResponse.status, errorText);
        }
      } else {
        console.log('❌ User login failed');
      }
    } else {
      const errorText = await registerResponse.text();
      console.log('❌ User registration failed:', errorText);
    }
  } catch (error) {
    console.log('❌ Error in authentication test:', error.message);
  }

  console.log('\n🏁 Test completed!');
}

testOrdersAPI().catch(console.error);