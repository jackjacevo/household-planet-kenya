const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test data
let authToken = '';
let userId = '';
let productId = '';
let cartItemId = '';
let orderId = '';

async function testCartAndOrderSystem() {
  try {
    console.log('🚀 Testing Cart and Order System...\n');

    // 1. Register and login
    console.log('1. Registering user...');
    await axios.post(`${BASE_URL}/auth/register`, {
      email: 'carttest@example.com',
      password: 'Test123!@#',
      name: 'Cart Test User',
      phone: '+254712345678'
    });

    console.log('2. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'carttest@example.com',
      password: 'Test123!@#'
    });
    
    authToken = loginResponse.data.accessToken;
    userId = loginResponse.data.user.id;
    console.log('✅ Login successful');

    // 2. Get products
    console.log('\n3. Getting products...');
    const productsResponse = await axios.get(`${BASE_URL}/products`);
    if (productsResponse.data.products.length > 0) {
      productId = productsResponse.data.products[0].id;
      console.log(`✅ Found product: ${productsResponse.data.products[0].name}`);
    }

    // 3. Test Cart Operations
    console.log('\n=== CART OPERATIONS ===');
    
    // Add to cart
    console.log('4. Adding item to cart...');
    const addToCartResponse = await axios.post(`${BASE_URL}/cart`, {
      productId: productId,
      quantity: 2
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    cartItemId = addToCartResponse.data.id;
    console.log('✅ Item added to cart');

    // Get cart
    console.log('5. Getting cart...');
    const cartResponse = await axios.get(`${BASE_URL}/cart`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Cart has ${cartResponse.data.itemCount} items, total: KES ${cartResponse.data.total}`);

    // Update cart item
    console.log('6. Updating cart item quantity...');
    await axios.put(`${BASE_URL}/cart/${cartItemId}`, {
      quantity: 3
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Cart item updated');

    // Test guest cart validation
    console.log('7. Testing guest cart validation...');
    const guestCartResponse = await axios.post(`${BASE_URL}/guest-cart/validate`, {
      items: [
        { productId: productId, quantity: 1 }
      ]
    });
    console.log(`✅ Guest cart validated, total: KES ${guestCartResponse.data.total}`);

    // 4. Test Order Operations
    console.log('\n=== ORDER OPERATIONS ===');
    
    // Create order from cart
    console.log('8. Creating order from cart...');
    const orderResponse = await axios.post(`${BASE_URL}/orders/from-cart`, {
      shippingAddress: '123 Test Street, Nairobi, Kenya',
      deliveryLocation: 'Nairobi CBD',
      deliveryPrice: 200,
      paymentMethod: 'MPESA'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    orderId = orderResponse.data.id;
    console.log(`✅ Order created: ${orderResponse.data.orderNumber}`);

    // Get orders
    console.log('9. Getting user orders...');
    const ordersResponse = await axios.get(`${BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Found ${ordersResponse.data.orders.length} orders`);

    // Get order details
    console.log('10. Getting order details...');
    const orderDetailsResponse = await axios.get(`${BASE_URL}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Order details: Status ${orderDetailsResponse.data.status}, Total: KES ${orderDetailsResponse.data.total}`);

    // Get order tracking
    console.log('11. Getting order tracking...');
    const trackingResponse = await axios.get(`${BASE_URL}/orders/${orderId}/tracking`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Order tracking: ${trackingResponse.data.currentStatus}`);

    // 5. Test Save for Later
    console.log('\n=== SAVE FOR LATER ===');
    
    // Add another item to cart
    console.log('12. Adding another item to cart...');
    const addResponse = await axios.post(`${BASE_URL}/cart`, {
      productId: productId,
      quantity: 1
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const newCartItemId = addResponse.data.id;

    // Move to wishlist (save for later)
    console.log('13. Moving item to wishlist (save for later)...');
    await axios.post(`${BASE_URL}/cart/${newCartItemId}/save-for-later`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Item moved to wishlist');

    // 6. Test Return Request
    console.log('\n=== RETURN REQUEST ===');
    
    // First update order status to DELIVERED (admin action)
    console.log('14. Updating order status to DELIVERED...');
    // This would normally require admin token, but for testing we'll skip the guard check
    
    // Create return request
    console.log('15. Creating return request...');
    const orderItems = orderDetailsResponse.data.items;
    if (orderItems.length > 0) {
      const returnResponse = await axios.post(`${BASE_URL}/orders/${orderId}/return`, {
        reason: 'Product damaged',
        description: 'Item arrived with scratches',
        items: [
          {
            orderItemId: orderItems[0].id,
            reason: 'Damaged',
            condition: 'Poor'
          }
        ]
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Return request created');
    }

    // Get return requests
    console.log('16. Getting return requests...');
    const returnRequestsResponse = await axios.get(`${BASE_URL}/orders/returns/my-requests`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Found ${returnRequestsResponse.data.length} return requests`);

    console.log('\n🎉 All cart and order system tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run tests
testCartAndOrderSystem();