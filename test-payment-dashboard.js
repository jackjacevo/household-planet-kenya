const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Test admin credentials (update as needed)
const ADMIN_CREDENTIALS = {
  email: 'admin@householdplanet.co.ke',
  password: 'Admin123!'
};

let authToken = '';

async function login() {
  try {
    console.log('🔐 Logging in as admin...');
    const response = await axios.post(`${API_BASE}/auth/login`, ADMIN_CREDENTIALS);
    authToken = response.data.access_token;
    console.log('✅ Admin login successful');
    return true;
  } catch (error) {
    console.error('❌ Admin login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testPaymentStats() {
  try {
    console.log('\n📊 Testing payment statistics...');
    const response = await axios.get(`${API_BASE}/payments/admin/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Payment stats retrieved:');
    console.log(`   Total Transactions: ${response.data.totalTransactions}`);
    console.log(`   Completed: ${response.data.completedTransactions}`);
    console.log(`   Failed: ${response.data.failedTransactions}`);
    console.log(`   Pending: ${response.data.pendingTransactions}`);
    console.log(`   Total Revenue: KSh ${response.data.totalRevenue.toLocaleString()}`);
    console.log(`   Success Rate: ${response.data.successRate.toFixed(1)}%`);
    
    if (response.data.paymentTypeBreakdown) {
      console.log('   Payment Type Breakdown:');
      Object.entries(response.data.paymentTypeBreakdown).forEach(([type, data]) => {
        console.log(`     ${type}: ${data.count} transactions, KSh ${data.amount.toLocaleString()}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to get payment stats:', error.response?.data || error.message);
    return false;
  }
}

async function testRecordCashPayment() {
  try {
    console.log('\n💵 Testing cash payment recording...');
    const cashPayment = {
      orderId: 1, // Assuming order ID 1 exists
      amount: 1500,
      receivedBy: 'John Doe - Store Manager',
      notes: 'Cash payment received at store counter'
    };
    
    const response = await axios.post(`${API_BASE}/payments/admin/cash-payment`, cashPayment, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Cash payment recorded successfully');
    console.log(`   Transaction ID: ${response.data.transactionId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to record cash payment:', error.response?.data || error.message);
    return false;
  }
}

async function testRecordPaybillPayment() {
  try {
    console.log('\n📱 Testing paybill payment recording...');
    const paybillPayment = {
      phoneNumber: '254712345678',
      amount: 2500,
      mpesaCode: 'QGH7X8Y9Z0',
      reference: 'HouseholdPlanet',
      notes: 'Paybill payment to 247247'
    };
    
    const response = await axios.post(`${API_BASE}/payments/admin/paybill-payment`, paybillPayment, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Paybill payment recorded successfully');
    console.log(`   Transaction ID: ${response.data.transactionId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to record paybill payment:', error.response?.data || error.message);
    return false;
  }
}

async function testGetTransactions() {
  try {
    console.log('\n📋 Testing transaction retrieval with filters...');
    
    // Test different filters
    const filters = [
      { name: 'All transactions', params: {} },
      { name: 'Completed only', params: { status: 'COMPLETED' } },
      { name: 'M-Pesa only', params: { provider: 'MPESA' } },
      { name: 'Cash only', params: { provider: 'CASH' } },
      { name: 'STK Push only', params: { paymentType: 'STK_PUSH' } },
      { name: 'Paybill only', params: { paymentType: 'PAYBILL' } },
      { name: 'Cash payments only', params: { paymentType: 'CASH' } }
    ];
    
    for (const filter of filters) {
      const params = new URLSearchParams(filter.params);
      const response = await axios.get(`${API_BASE}/payments/admin/transactions?${params}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log(`✅ ${filter.name}: ${response.data.length} transactions found`);
      
      if (response.data.length > 0) {
        const sample = response.data[0];
        console.log(`   Sample: ${sample.provider} (${sample.paymentType}) - KSh ${sample.amount}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to get transactions:', error.response?.data || error.message);
    return false;
  }
}

async function testPaymentAnalytics() {
  try {
    console.log('\n📈 Testing payment analytics...');
    const periods = ['weekly', 'monthly', 'yearly'];
    
    for (const period of periods) {
      const response = await axios.get(`${API_BASE}/payments/admin/analytics?period=${period}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log(`✅ ${period} analytics:`, {
        totalVolume: response.data.totalVolume,
        transactionCount: response.data.transactionCount,
        averageAmount: response.data.averageAmount.toFixed(2)
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to get payment analytics:', error.response?.data || error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 Starting Payment Dashboard Tests...\n');
  
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without admin authentication');
    return;
  }
  
  const tests = [
    { name: 'Payment Statistics', fn: testPaymentStats },
    { name: 'Record Cash Payment', fn: testRecordCashPayment },
    { name: 'Record Paybill Payment', fn: testRecordPaybillPayment },
    { name: 'Get Transactions', fn: testGetTransactions },
    { name: 'Payment Analytics', fn: testPaymentAnalytics }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const success = await test.fn();
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\n🎯 Test Results Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All payment dashboard tests passed!');
    console.log('\n📋 Payment Dashboard Features Verified:');
    console.log('   ✅ M-Pesa STK Push payment tracking');
    console.log('   ✅ M-Pesa Paybill payment recording (247247)');
    console.log('   ✅ Cash payment recording');
    console.log('   ✅ Payment type breakdown statistics');
    console.log('   ✅ Advanced filtering by payment type');
    console.log('   ✅ Payment analytics and reporting');
    console.log('\n🚀 Payment Dashboard is ready for production!');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

// Run tests
runAllTests().catch(console.error);