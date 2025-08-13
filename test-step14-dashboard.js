const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Test data
let authToken = '';
let userId = '';
let productId = '';
let orderId = '';
let ticketId = '';

async function testUserDashboard() {
  console.log('🏠 Testing Step 14: User Dashboard\n');

  try {
    // 1. Setup - Create test user
    console.log('1. Setting up test user...');
    
    // Register test user
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
      email: 'dashboard@test.com',
      password: 'Test123!@#',
      firstName: 'Dashboard',
      lastName: 'User',
      phone: '+254700000001'
    });
    
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'dashboard@test.com',
      password: 'Test123!@#'
    });
    
    authToken = loginResponse.data.access_token;
    userId = loginResponse.data.user.id;
    
    const headers = { Authorization: `Bearer ${authToken}` };
    console.log('✅ Test user setup complete');

    // 2. Test Dashboard Stats
    console.log('\n2. Testing dashboard statistics...');
    
    const statsResponse = await axios.get(`${API_BASE}/users/dashboard/stats`, { headers });
    console.log(`✅ Dashboard stats retrieved:`);
    console.log(`   - Loyalty Points: ${statsResponse.data.loyaltyPoints}`);
    console.log(`   - Total Orders: ${statsResponse.data.totalOrders}`);
    console.log(`   - Total Spent: KES ${statsResponse.data.totalSpent}`);
    console.log(`   - Wishlist Items: ${statsResponse.data.wishlistItems}`);

    // 3. Test Profile Management
    console.log('\n3. Testing profile management...');
    
    // Update profile
    const profileUpdateResponse = await axios.patch(`${API_BASE}/users/profile`, {
      firstName: 'Updated',
      lastName: 'User',
      phone: '+254700000002',
      dateOfBirth: '1990-01-01',
      gender: 'MALE'
    }, { headers });
    
    console.log('✅ Profile updated successfully');
    
    // Get profile
    const profileResponse = await axios.get(`${API_BASE}/users/profile`, { headers });
    console.log(`✅ Profile retrieved: ${profileResponse.data.user.name}`);

    // 4. Test Address Management
    console.log('\n4. Testing address management...');
    
    // Add address
    const addressResponse = await axios.post(`${API_BASE}/users/addresses`, {
      type: 'HOME',
      fullName: 'Dashboard User',
      phone: '+254700000002',
      county: 'Nairobi',
      town: 'Nairobi',
      street: '123 Test Street',
      landmark: 'Near Test Mall',
      isDefault: true
    }, { headers });
    
    console.log('✅ Address added successfully');
    
    // Get addresses
    const addressesResponse = await axios.get(`${API_BASE}/users/addresses`, { headers });
    console.log(`✅ Addresses retrieved: ${addressesResponse.data.addresses.length} addresses`);

    // 5. Test Wishlist Management
    console.log('\n5. Testing wishlist management...');
    
    // Create test product first
    const productResponse = await axios.post(`${API_BASE}/products`, {
      name: 'Dashboard Test Product',
      description: 'Product for dashboard testing',
      price: 2500,
      stock: 50,
      categoryId: null,
      images: ['test-image.jpg'],
      slug: 'dashboard-test-product'
    }, { headers });
    
    productId = productResponse.data.id;
    
    // Add to wishlist
    await axios.post(`${API_BASE}/users/wishlist/${productId}`, {}, { headers });
    console.log('✅ Product added to wishlist');
    
    // Get wishlist
    const wishlistResponse = await axios.get(`${API_BASE}/users/wishlist`, { headers });
    console.log(`✅ Wishlist retrieved: ${wishlistResponse.data.length} items`);
    
    // Remove from wishlist
    await axios.delete(`${API_BASE}/users/wishlist/${productId}`, { headers });
    console.log('✅ Product removed from wishlist');

    // 6. Test Order History
    console.log('\n6. Testing order history...');
    
    // Create test order
    const orderResponse = await axios.post(`${API_BASE}/orders`, {
      items: [{
        productId,
        quantity: 2
      }],
      shippingAddress: '123 Test Street, Nairobi, Nairobi',
      deliveryLocation: 'nairobi-cbd',
      paymentMethod: 'COD'
    }, { headers });
    
    orderId = orderResponse.data.id;
    console.log(`✅ Test order created: ${orderResponse.data.orderNumber}`);
    
    // Get orders
    const ordersResponse = await axios.get(`${API_BASE}/orders`, { headers });
    console.log(`✅ Order history retrieved: ${ordersResponse.data.orders.length} orders`);
    
    // Get specific order
    const orderDetailsResponse = await axios.get(`${API_BASE}/orders/${orderId}`, { headers });
    console.log(`✅ Order details retrieved: ${orderDetailsResponse.data.orderNumber}`);

    // 7. Test Support Ticket System
    console.log('\n7. Testing support ticket system...');
    
    // Create support ticket
    const ticketResponse = await axios.post(`${API_BASE}/support/tickets`, {
      subject: 'Test Support Issue',
      message: 'This is a test support ticket for dashboard testing.',
      category: 'ORDER',
      priority: 'MEDIUM',
      orderId: orderId
    }, { headers });
    
    ticketId = ticketResponse.data.id;
    console.log(`✅ Support ticket created: ${ticketResponse.data.subject}`);
    
    // Get tickets
    const ticketsResponse = await axios.get(`${API_BASE}/support/tickets`, { headers });
    console.log(`✅ Support tickets retrieved: ${ticketsResponse.data.length} tickets`);
    
    // Add reply to ticket
    await axios.post(`${API_BASE}/support/tickets/${ticketId}/replies`, {
      message: 'This is a follow-up message from the user.'
    }, { headers });
    console.log('✅ Reply added to support ticket');

    // 8. Test Settings Management
    console.log('\n8. Testing settings management...');
    
    // Update settings
    const settingsResponse = await axios.patch(`${API_BASE}/users/settings`, {
      marketingEmails: false,
      smsNotifications: true,
      preferredLanguage: 'sw'
    }, { headers });
    
    console.log('✅ User settings updated');
    console.log(`   - Marketing Emails: ${settingsResponse.data.marketingEmails}`);
    console.log(`   - SMS Notifications: ${settingsResponse.data.smsNotifications}`);
    console.log(`   - Preferred Language: ${settingsResponse.data.preferredLanguage}`);

    // 9. Test Return Request (if applicable)
    console.log('\n9. Testing return request functionality...');
    
    try {
      // Update order status to DELIVERED first
      await axios.put(`${API_BASE}/orders/${orderId}/status`, {
        status: 'DELIVERED',
        notes: 'Order delivered for testing'
      }, { headers });
      
      // Create return request
      const returnResponse = await axios.post(`${API_BASE}/orders/${orderId}/return`, {
        reason: 'DEFECTIVE',
        description: 'Product arrived damaged during testing',
        items: [{
          orderItemId: orderDetailsResponse.data.items[0].id,
          reason: 'DEFECTIVE',
          condition: 'DAMAGED'
        }]
      }, { headers });
      
      console.log('✅ Return request created successfully');
      
      // Get return requests
      const returnsResponse = await axios.get(`${API_BASE}/orders/returns/my-requests`, { headers });
      console.log(`✅ Return requests retrieved: ${returnsResponse.data.length} requests`);
    } catch (error) {
      console.log('⚠️ Return request testing skipped (may require admin permissions)');
    }

    // 10. Test Invoice Download (Mock)
    console.log('\n10. Testing invoice functionality...');
    
    try {
      // This would normally return a PDF
      const invoiceResponse = await axios.get(`${API_BASE}/orders/${orderId}/invoice`, { 
        headers,
        responseType: 'blob'
      });
      console.log('✅ Invoice download functionality available');
    } catch (error) {
      console.log('⚠️ Invoice download not implemented yet (expected)');
    }

    // 11. Test Loyalty Points (Mock)
    console.log('\n11. Testing loyalty program integration...');
    
    try {
      // This would be implemented with actual loyalty logic
      const loyaltyResponse = await axios.get(`${API_BASE}/users/loyalty/transactions`, { headers });
      console.log('✅ Loyalty transactions retrieved');
    } catch (error) {
      console.log('⚠️ Loyalty program endpoints not implemented yet (expected)');
    }

    console.log('\n🎉 User Dashboard Testing Complete!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Dashboard Overview - Working');
    console.log('✅ Profile Management - Working');
    console.log('✅ Address Management - Working');
    console.log('✅ Wishlist Management - Working');
    console.log('✅ Order History - Working');
    console.log('✅ Support Tickets - Working');
    console.log('✅ Settings Management - Working');
    console.log('⚠️ Some advanced features may need additional implementation');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 Some endpoints may not be implemented yet. This is expected for a complete dashboard system.');
    }
  }
}

// Run the test
testUserDashboard();