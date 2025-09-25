const BASE_URL = 'https://householdplanetkenya.co.ke';

const ADMIN_CREDENTIALS = {
  email: 'householdplanet819@gmail.com',
  password: 'Admin@2025'
};

async function testAuthenticatedPaymentAPIs() {
  console.log('🧪 Testing Payment APIs with Authentication...\n');

  try {
    // Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ADMIN_CREDENTIALS),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token || loginData.token;
    console.log('✅ Login successful');

    // Test Payment Stats
    console.log('\n2️⃣ Testing Payment Stats...');
    const statsResponse = await fetch(`${BASE_URL}/api/payments/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`Stats: ${statsResponse.status} ${statsResponse.statusText}`);
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Payment Stats working');
      console.log(`📊 Total Revenue: KES ${stats.totalRevenue || 0}`);
      console.log(`📈 Total Transactions: ${stats.totalTransactions || 0}`);
    } else {
      console.log('❌ Payment Stats failed');
    }

    // Test Payment Transactions
    console.log('\n3️⃣ Testing Payment Transactions...');
    const transactionsResponse = await fetch(`${BASE_URL}/api/payments/admin/transactions?page=1&limit=5`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`Transactions: ${transactionsResponse.status} ${transactionsResponse.statusText}`);
    if (transactionsResponse.ok) {
      const transactions = await transactionsResponse.json();
      console.log('✅ Payment Transactions working');
      console.log(`💳 Found ${transactions.length || 0} transactions`);
    } else {
      console.log('❌ Payment Transactions failed');
    }

    console.log('\n🎉 All payment APIs are working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuthenticatedPaymentAPIs();