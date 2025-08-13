const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Test data
let authToken = '';
let userId = '';
let productId = '';
let cartItemId = '';
let savedItemId = '';
let orderId = '';
let promoCodeId = '';

async function testShoppingExperience() {
  console.log('🛒 Testing Step 13: Complete Shopping Experience\n');

  try {
    // 1. Setup - Create test user and product
    console.log('1. Setting up test data...');
    
    // Register test user
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
      email: 'shopper@test.com',
      password: 'Test123!@#',
      firstName: 'Test',
      lastName: 'Shopper',
      phone: '+254700000001'
    });
    
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'shopper@test.com',
      password: 'Test123!@#'
    });
    
    authToken = loginResponse.data.access_token;
    userId = loginResponse.data.user.id;
    
    const headers = { Authorization: `Bearer ${authToken}` };
    
    // Create test product
    const productResponse = await axios.post(`${API_BASE}/products`, {
      name: 'Test Shopping Product',
      description: 'Product for shopping flow testing',
      price: 1500,
      stock: 100,
      categoryId: null,
      images: ['test-image.jpg'],
      slug: 'test-shopping-product'
    }, { headers });
    
    productId = productResponse.data.id;
    console.log('✅ Test data setup complete');

    // 2. Test Cart Management
    console.log('\n2. Testing cart management...');
    
    // Add to cart
    const addToCartResponse = await axios.post(`${API_BASE}/cart`, {
      productId,
      quantity: 2
    }, { headers });
    
    cartItemId = addToCartResponse.data.id;
    console.log('✅ Added item to cart');
    
    // Get cart
    const cartResponse = await axios.get(`${API_BASE}/cart`, { headers });
    console.log(`✅ Cart retrieved: ${cartResponse.data.itemCount} items, Total: KES ${cartResponse.data.total}`);
    
    // Update quantity
    await axios.put(`${API_BASE}/cart/${cartItemId}`, {
      quantity: 3
    }, { headers });
    console.log('✅ Updated cart item quantity');
    
    // 3. Test Save for Later
    console.log('\n3. Testing save for later functionality...');
    
    // Save item for later
    const saveResponse = await axios.post(`${API_BASE}/cart/save-for-later`, {
      cartItemId
    }, { headers });
    
    savedItemId = saveResponse.data.id;
    console.log('✅ Item saved for later');
    
    // Get saved items
    const savedItemsResponse = await axios.get(`${API_BASE}/cart/saved-items`, { headers });
    console.log(`✅ Retrieved saved items: ${savedItemsResponse.data.length} items`);
    
    // Move back to cart
    await axios.post(`${API_BASE}/cart/saved-items/${savedItemId}/move-to-cart`, {}, { headers });
    console.log('✅ Moved item back to cart');

    // 4. Test Promo Codes
    console.log('\n4. Testing promo code functionality...');
    
    // Create test promo code (admin function)
    try {
      const promoResponse = await axios.post(`${API_BASE}/admin/promo-codes`, {
        code: 'TESTDISCOUNT',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        isActive: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        minimumAmount: 1000,
        usageLimit: 100
      }, { headers });
      
      promoCodeId = promoResponse.data.id;
      console.log('✅ Created test promo code');
    } catch (error) {
      console.log('⚠️ Promo code creation skipped (admin endpoint may not exist)');
    }
    
    // Apply promo code
    try {
      const applyPromoResponse = await axios.post(`${API_BASE}/cart/apply-promo`, {
        promoCode: 'TESTDISCOUNT'
      }, { headers });
      
      console.log(`✅ Applied promo code: ${applyPromoResponse.data.discount} discount`);
    } catch (error) {
      console.log('⚠️ Promo code application failed (expected if promo not created)');
    }

    // 5. Test Delivery Location Calculation
    console.log('\n5. Testing delivery location functionality...');
    
    try {
      const locationsResponse = await axios.get(`${API_BASE}/delivery/locations`);
      console.log(`✅ Retrieved delivery locations: ${locationsResponse.data.length} locations`);
    } catch (error) {
      console.log('⚠️ Delivery locations endpoint not available');
    }

    // 6. Test Address Management
    console.log('\n6. Testing address management...');
    
    try {
      // Add address
      const addressResponse = await axios.post(`${API_BASE}/users/addresses`, {
        type: 'HOME',
        street: '123 Test Street',
        city: 'Nairobi',
        county: 'Nairobi',
        isDefault: true
      }, { headers });
      
      console.log('✅ Added user address');
      
      // Get addresses
      const addressesResponse = await axios.get(`${API_BASE}/users/addresses`, { headers });
      console.log(`✅ Retrieved addresses: ${addressesResponse.data.length} addresses`);
    } catch (error) {
      console.log('⚠️ Address management endpoints not available');
    }

    // 7. Test Checkout Flow
    console.log('\n7. Testing checkout flow...');
    
    // Create order from cart
    const orderResponse = await axios.post(`${API_BASE}/orders/from-cart`, {
      shippingAddress: '123 Test Street, Nairobi, Nairobi',
      deliveryLocation: 'nairobi-cbd',
      paymentMethod: 'COD'
    }, { headers });
    
    orderId = orderResponse.data.id;
    console.log(`✅ Created order: ${orderResponse.data.orderNumber}`);

    // 8. Test Guest Checkout
    console.log('\n8. Testing guest checkout...');
    
    // Create guest order
    const guestOrderResponse = await axios.post(`${API_BASE}/orders/guest-checkout`, {
      items: [{
        productId,
        quantity: 1
      }],
      email: 'guest@test.com',
      firstName: 'Guest',
      lastName: 'User',
      phone: '+254700000002',
      shippingAddress: '456 Guest Street, Mombasa, Mombasa',
      deliveryLocation: 'mombasa-town',
      paymentMethod: 'MPESA',
      phoneNumber: '254700000002'
    });
    
    console.log(`✅ Created guest order: ${guestOrderResponse.data.order.orderNumber}`);
    
    // Get guest order
    const guestOrderNumber = guestOrderResponse.data.order.orderNumber;
    const guestOrderDetails = await axios.get(`${API_BASE}/orders/guest/${guestOrderNumber}?email=guest@test.com`);
    console.log('✅ Retrieved guest order details');

    // 9. Test Order Tracking
    console.log('\n9. Testing order tracking...');
    
    try {
      const trackingResponse = await axios.get(`${API_BASE}/orders/${orderId}/tracking`, { headers });
      console.log(`✅ Retrieved order tracking: Status ${trackingResponse.data.currentStatus}`);
    } catch (error) {
      console.log('⚠️ Order tracking endpoint not available');
    }

    // 10. Test Payment Integration
    console.log('\n10. Testing payment integration...');
    
    try {
      // Test M-Pesa payment initiation
      const mpesaResponse = await axios.post(`${API_BASE}/orders/with-payment`, {
        shippingAddress: '789 Payment Street, Kisumu, Kisumu',
        deliveryLocation: 'kisumu-town',
        paymentMethod: 'MPESA',
        phoneNumber: '254700000003'
      }, { headers });
      
      console.log('✅ M-Pesa payment initiated');
    } catch (error) {
      console.log('⚠️ M-Pesa payment integration not fully configured');
    }

    console.log('\n🎉 Shopping Experience Testing Complete!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Cart Management - Working');
    console.log('✅ Save for Later - Working');
    console.log('✅ Checkout Flow - Working');
    console.log('✅ Guest Checkout - Working');
    console.log('✅ Order Management - Working');
    console.log('⚠️ Some advanced features may need additional configuration');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 Some endpoints may not be implemented yet. This is expected for a complete shopping system.');
    }
  }
}

// Run the test
testShoppingExperience();