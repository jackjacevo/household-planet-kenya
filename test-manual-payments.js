const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

// Test manual payment functionality
async function testManualPayments() {
  try {
    console.log('🧪 Testing Manual Payment Functionality...\n');

    // First, let's get an admin token (you'll need to replace with actual admin credentials)
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@householdplanet.co.ke',
      password: 'Admin123!'
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Admin login successful');

    const headers = { 'Authorization': `Bearer ${token}` };

    // Test 1: Record cash payment with order number
    console.log('\n📝 Test 1: Recording cash payment with order number...');
    try {
      const cashPaymentResponse = await axios.post(`${API_URL}/payments/admin/cash-payment`, {
        orderId: 'WA-1756163997824-4200',
        amount: 4200,
        receivedBy: 'John Doe',
        notes: 'Cash payment received at store'
      }, { headers });

      console.log('✅ Cash payment recorded:', cashPaymentResponse.data);
    } catch (error) {
      console.log('⚠️ Cash payment test (expected if order doesn\'t exist):', error.response?.data?.message || error.message);
    }

    // Test 2: Record cash payment with numeric order ID
    console.log('\n📝 Test 2: Recording cash payment with numeric order ID...');
    try {
      const cashPaymentResponse2 = await axios.post(`${API_URL}/payments/admin/cash-payment`, {
        orderId: 1,
        amount: 2500,
        receivedBy: 'Jane Smith',
        notes: 'Cash payment for order #1'
      }, { headers });

      console.log('✅ Cash payment recorded:', cashPaymentResponse2.data);
    } catch (error) {
      console.log('⚠️ Cash payment test (expected if order doesn\'t exist):', error.response?.data?.message || error.message);
    }

    // Test 3: Record paybill payment with order number
    console.log('\n📝 Test 3: Recording paybill payment with order number...');
    try {
      const paybillResponse = await axios.post(`${API_URL}/payments/admin/paybill-payment`, {
        phoneNumber: '254712345678',
        amount: 3500,
        mpesaCode: 'QHX7Y8Z9',
        reference: 'HouseholdPlanet',
        notes: 'Paybill payment via 247247',
        orderId: 'WA-1756163997824-4200'
      }, { headers });

      console.log('✅ Paybill payment recorded:', paybillResponse.data);
    } catch (error) {
      console.log('⚠️ Paybill payment test (expected if order doesn\'t exist):', error.response?.data?.message || error.message);
    }

    // Test 4: Record paybill payment without order (standalone)
    console.log('\n📝 Test 4: Recording standalone paybill payment...');
    try {
      const standalonePaybillResponse = await axios.post(`${API_URL}/payments/admin/paybill-payment`, {
        phoneNumber: '254798765432',
        amount: 1500,
        mpesaCode: 'ABC123XYZ',
        reference: 'HouseholdPlanet',
        notes: 'Standalone paybill payment'
      }, { headers });

      console.log('✅ Standalone paybill payment recorded:', standalonePaybillResponse.data);
    } catch (error) {
      console.log('❌ Standalone paybill payment failed:', error.response?.data?.message || error.message);
    }

    // Test 5: Get payment stats
    console.log('\n📊 Test 5: Getting payment statistics...');
    try {
      const statsResponse = await axios.get(`${API_URL}/payments/admin/stats`, { headers });
      console.log('✅ Payment stats retrieved:', {
        totalTransactions: statsResponse.data.totalTransactions,
        totalRevenue: statsResponse.data.totalRevenue,
        successRate: statsResponse.data.successRate
      });
    } catch (error) {
      console.log('❌ Failed to get payment stats:', error.response?.data?.message || error.message);
    }

    // Test 6: Get recent transactions
    console.log('\n📋 Test 6: Getting recent transactions...');
    try {
      const transactionsResponse = await axios.get(`${API_URL}/payments/admin/transactions?limit=5`, { headers });
      console.log('✅ Recent transactions retrieved:', transactionsResponse.data.length, 'transactions');
      
      if (transactionsResponse.data.length > 0) {
        console.log('Latest transaction:', {
          id: transactionsResponse.data[0].id,
          amount: transactionsResponse.data[0].amount,
          status: transactionsResponse.data[0].status,
          provider: transactionsResponse.data[0].provider,
          paymentType: transactionsResponse.data[0].paymentType
        });
      }
    } catch (error) {
      console.log('❌ Failed to get transactions:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Manual payment tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testManualPayments();