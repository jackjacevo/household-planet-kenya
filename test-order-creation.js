const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function testOrderCreation() {
  try {
    console.log('Testing order creation flow...');
    
    // 1. Test authentication
    console.log('\n1. Testing authentication...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✓ Authentication successful');
    
    // 2. Test cart functionality
    console.log('\n2. Testing cart functionality...');
    const cartResponse = await axios.get(`${API_URL}/api/cart`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✓ Cart fetch successful:', cartResponse.data);
    
    // 3. Test order creation (if cart has items)
    if (cartResponse.data.items && cartResponse.data.items.length > 0) {
      console.log('\n3. Testing order creation...');
      const orderData = {
        items: cartResponse.data.items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.product.price
        })),
        deliveryLocationId: 'nairobi-cbd',
        paymentMethod: 'CASH',
        notes: 'Test order'
      };
      
      const orderResponse = await axios.post(`${API_URL}/api/orders`, orderData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✓ Order created successfully:', orderResponse.data);
      
      // 4. Test fetching user orders
      console.log('\n4. Testing order retrieval...');
      const ordersResponse = await axios.get(`${API_URL}/api/orders/my-orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✓ Orders fetched successfully:', ordersResponse.data);
      
    } else {
      console.log('\n3. No items in cart - skipping order creation test');
    }
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('Note: Make sure you have a test user account or update the credentials');
    }
  }
}

testOrderCreation();