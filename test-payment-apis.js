/**
 * Test Payment Admin APIs
 * Tests the fixed payment admin endpoints to ensure they work correctly
 */

const BASE_URL = 'https://householdplanetkenya.co.ke';

// Test credentials - replace with actual admin credentials
const TEST_CREDENTIALS = {
  email: 'admin@householdplanetkenya.co.ke',
  password: 'Admin@2024!'
};

async function testPaymentAPIs() {
  console.log('🧪 Testing Payment Admin APIs...\n');

  try {
    // Step 1: Login to get admin token
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_CREDENTIALS),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token || loginData.token;
    
    if (!token) {
      throw new Error('No token received from login');
    }
    
    console.log('✅ Login successful');

    // Step 2: Test Payment Stats API
    console.log('\n2️⃣ Testing Payment Stats API...');
    const statsResponse = await fetch(`${BASE_URL}/api/payments/admin/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`Stats API Response: ${statsResponse.status} ${statsResponse.statusText}`);
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ Payment Stats API working');
      console.log('📊 Stats preview:', JSON.stringify(statsData, null, 2).substring(0, 200) + '...');
    } else {
      const errorText = await statsResponse.text();
      console.log('❌ Payment Stats API failed');
      console.log('Error:', errorText);
    }

    // Step 3: Test Payment Transactions API
    console.log('\n3️⃣ Testing Payment Transactions API...');
    const transactionsResponse = await fetch(`${BASE_URL}/api/payments/admin/transactions?page=1&limit=10`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`Transactions API Response: ${transactionsResponse.status} ${transactionsResponse.statusText}`);
    
    if (transactionsResponse.ok) {
      const transactionsData = await transactionsResponse.json();
      console.log('✅ Payment Transactions API working');
      console.log('💳 Transactions preview:', JSON.stringify(transactionsData, null, 2).substring(0, 200) + '...');
    } else {
      const errorText = await transactionsResponse.text();
      console.log('❌ Payment Transactions API failed');
      console.log('Error:', errorText);
    }

    // Step 4: Test direct backend endpoints (bypass Next.js proxy)
    console.log('\n4️⃣ Testing direct backend endpoints...');
    
    const directStatsResponse = await fetch(`https://api.householdplanetkenya.co.ke/payments/admin/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`Direct Stats API Response: ${directStatsResponse.status} ${directStatsResponse.statusText}`);
    
    if (directStatsResponse.ok) {
      console.log('✅ Direct backend stats API working');
    } else {
      const errorText = await directStatsResponse.text();
      console.log('❌ Direct backend stats API failed');
      console.log('Error:', errorText);
    }

    const directTransactionsResponse = await fetch(`https://api.householdplanetkenya.co.ke/payments/admin/transactions?page=1&limit=10`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`Direct Transactions API Response: ${directTransactionsResponse.status} ${directTransactionsResponse.statusText}`);
    
    if (directTransactionsResponse.ok) {
      console.log('✅ Direct backend transactions API working');
    } else {
      const errorText = await directTransactionsResponse.text();
      console.log('❌ Direct backend transactions API failed');
      console.log('Error:', errorText);
    }

    console.log('\n🎉 Payment API testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testPaymentAPIs();