const axios = require('axios');

const API_URL = 'https://api.householdplanetkenya.co.ke';

async function testOrderCreation() {
  console.log('📝 Testing Order Creation...');
  
  try {
    // Login
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@householdplanet.co.ke',
      password: 'Admin@2025'
    });
    const token = loginResponse.data.accessToken;
    console.log('✅ Login successful');

    // Test orders endpoint
    console.log('\n📋 Testing orders GET...');
    try {
      const ordersResponse = await axios.get(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Orders GET successful:', ordersResponse.data.length || 'Got orders');
    } catch (error) {
      console.log('❌ Orders GET failed:', error.response?.status, error.response?.data?.message);
    }

    // Get a product for order items
    const productsResponse = await axios.get(`${API_URL}/api/products?limit=1`);
    const products = productsResponse.data.products || productsResponse.data;
    
    if (products.length === 0) {
      console.log('❌ No products available for testing');
      return;
    }

    // Test simple order creation
    console.log('\n📝 Testing simple order creation...');
    const simpleOrder = {
      items: [{
        productId: products[0].id,
        quantity: 1,
        price: products[0].price
      }],
      paymentMethod: 'MPESA',
      customerName: 'Test User',
      customerPhone: '+254700000000',
      deliveryLocation: 'Nairobi',
      promoCode: 'WELCOME10',
      discountAmount: 50
    };

    try {
      const orderResponse = await axios.post(`${API_URL}/api/orders`, simpleOrder, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Simple order created:', orderResponse.data);
    } catch (error) {
      console.log('❌ Simple order failed:', error.response?.status, error.response?.data?.message);
      console.log('Error details:', error.response?.data);
    }

    // Test admin orders endpoint
    console.log('\n📋 Testing admin orders...');
    try {
      const adminOrdersResponse = await axios.get(`${API_URL}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Admin orders successful');
    } catch (error) {
      console.log('❌ Admin orders failed:', error.response?.status, error.response?.data?.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testOrderCreation();