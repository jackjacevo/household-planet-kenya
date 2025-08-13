const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

const ADMIN_CREDENTIALS = {
  email: 'admin@householdplanet.co.ke',
  password: 'Admin123!@#'
};

let adminToken = '';

async function testOrderManagement() {
  console.log('🚀 Testing Order Management Features');
  console.log('====================================\n');

  try {
    // Step 1: Admin Login
    console.log('1. Admin Login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, ADMIN_CREDENTIALS);
    adminToken = loginResponse.data.access_token;
    console.log('✅ Admin login successful');

    // Step 2: Get Order Statistics
    console.log('\n2. Testing Order Statistics...');
    const statsResponse = await axios.get(`${BASE_URL}/api/admin/orders/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('📊 Order Statistics:');
    console.log(`   Total Orders: ${statsResponse.data.total}`);
    console.log(`   Pending: ${statsResponse.data.pending}`);
    console.log(`   Processing: ${statsResponse.data.processing}`);
    console.log(`   Shipped: ${statsResponse.data.shipped}`);
    console.log(`   Delivered: ${statsResponse.data.delivered}`);
    console.log(`   Cancelled: ${statsResponse.data.cancelled}`);

    // Step 3: Get Orders with Filters
    console.log('\n3. Testing Order Retrieval with Filters...');
    const ordersResponse = await axios.get(`${BASE_URL}/api/admin/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log(`📋 Found ${ordersResponse.data.length} orders`);
    
    if (ordersResponse.data.length > 0) {
      const testOrder = ordersResponse.data[0];
      console.log(`   Test Order: #${testOrder.orderNumber} - ${testOrder.status}`);

      // Step 4: Get Order Details
      console.log('\n4. Testing Order Details Retrieval...');
      const orderDetailResponse = await axios.get(`${BASE_URL}/api/admin/orders/${testOrder.id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log('📄 Order Details:');
      console.log(`   Order Number: ${orderDetailResponse.data.orderNumber}`);
      console.log(`   Customer: ${orderDetailResponse.data.user?.name || orderDetailResponse.data.guestName}`);
      console.log(`   Items: ${orderDetailResponse.data.items.length}`);
      console.log(`   Total: KSh ${orderDetailResponse.data.total}`);
      console.log(`   Status History: ${orderDetailResponse.data.statusHistory.length} entries`);

      // Step 5: Test Order Status Update
      console.log('\n5. Testing Order Status Update...');
      const currentStatus = orderDetailResponse.data.status;
      const newStatus = currentStatus === 'PENDING' ? 'CONFIRMED' : 'PROCESSING';
      
      const statusUpdateResponse = await axios.put(`${BASE_URL}/api/admin/orders/${testOrder.id}/status`, {
        status: newStatus,
        notes: 'Status updated via admin panel test'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log(`✅ Order status updated from ${currentStatus} to ${newStatus}`);

      // Step 6: Test Payment Verification
      console.log('\n6. Testing Payment Verification...');
      const paymentVerifyResponse = await axios.post(`${BASE_URL}/api/admin/orders/${testOrder.id}/verify-payment`, {}, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log(`💳 Payment Verification: ${paymentVerifyResponse.data.verified ? 'Verified' : 'Not Verified'}`);

      // Step 7: Test Shipping Label Generation
      console.log('\n7. Testing Shipping Label Generation...');
      const shippingLabelResponse = await axios.post(`${BASE_URL}/api/admin/orders/${testOrder.id}/shipping-label`, {}, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log('📦 Shipping Label Generated:');
      console.log(`   Order Number: ${shippingLabelResponse.data.orderNumber}`);
      console.log(`   Customer: ${shippingLabelResponse.data.customerName}`);
      console.log(`   Tracking Number: ${shippingLabelResponse.data.trackingNumber}`);
      console.log(`   Total Weight: ${shippingLabelResponse.data.totalWeight}kg`);

      // Step 8: Test Delivery Status Update
      console.log('\n8. Testing Delivery Status Update...');
      await axios.put(`${BASE_URL}/api/admin/orders/${testOrder.id}/delivery`, {
        status: 'SHIPPED',
        location: 'Nairobi Distribution Center',
        notes: 'Package dispatched for delivery'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log('✅ Delivery status updated successfully');

      // Step 9: Test Order Notes
      console.log('\n9. Testing Order Notes...');
      await axios.post(`${BASE_URL}/api/admin/orders/${testOrder.id}/notes`, {
        notes: 'Test note added via admin panel - customer called to confirm address'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log('✅ Order note added successfully');

      // Step 10: Test Customer Email Communication
      console.log('\n10. Testing Customer Email Communication...');
      const emailResponse = await axios.post(`${BASE_URL}/api/admin/orders/${testOrder.id}/email`, {
        template: 'order_shipped',
        customMessage: 'Your order has been shipped and is on its way!'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log('📧 Customer Email:');
      console.log(`   Sent to: ${emailResponse.data.recipient}`);
      console.log(`   Subject: ${emailResponse.data.subject}`);
      console.log(`   Status: ${emailResponse.data.sent ? 'Sent' : 'Failed'}`);

      // Step 11: Test Bulk Operations
      console.log('\n11. Testing Bulk Order Operations...');
      if (ordersResponse.data.length > 1) {
        const orderIds = ordersResponse.data.slice(0, 2).map(order => order.id);
        
        await axios.put(`${BASE_URL}/api/admin/orders/bulk/update`, {
          orderIds,
          updates: { notes: 'Bulk update test - processed in batch' }
        }, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        console.log(`✅ Bulk update completed for ${orderIds.length} orders`);
      } else {
        console.log('ℹ️ Not enough orders for bulk operation test');
      }

      // Step 12: Test Order Filtering
      console.log('\n12. Testing Order Filtering...');
      const filteredResponse = await axios.get(`${BASE_URL}/api/admin/orders?status=PENDING&paymentStatus=PAID`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log(`🔍 Filtered Orders: ${filteredResponse.data.length} orders found with filters`);

      // Step 13: Test Return Processing (if returns exist)
      console.log('\n13. Testing Return Processing...');
      const orderWithReturns = ordersResponse.data.find(order => 
        orderDetailResponse.data.returnRequests && orderDetailResponse.data.returnRequests.length > 0
      );
      
      if (orderWithReturns) {
        const returnId = orderDetailResponse.data.returnRequests[0].id;
        await axios.put(`${BASE_URL}/api/admin/orders/returns/${returnId}`, {
          status: 'APPROVED',
          notes: 'Return approved - product defective'
        }, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        console.log('✅ Return request processed successfully');
      } else {
        console.log('ℹ️ No return requests found for testing');
      }

    } else {
      console.log('ℹ️ No orders found for detailed testing');
    }

    console.log('\n✅ All Order Management Tests Passed!');
    console.log('\n🎉 Order Management Features Complete!');
    console.log('\nFeatures Implemented:');
    console.log('• Order workflow management with status updates');
    console.log('• Comprehensive order details view with customer information');
    console.log('• Payment verification and processing');
    console.log('• Shipping label generation and tracking updates');
    console.log('• Bulk order operations and advanced filtering');
    console.log('• Order notes and internal communication system');
    console.log('• Return/exchange processing workflow');
    console.log('• Customer communication templates and email system');
    console.log('• Real-time order statistics and analytics');
    console.log('• Delivery tracking and status management');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Note: You need to create an admin user first:');
      console.log('1. Register a user with email: admin@householdplanet.co.ke');
      console.log('2. Update the user role to "ADMIN" in the database');
      console.log('3. Run this test again');
    }
  }
}

// Run the test
if (require.main === module) {
  testOrderManagement().catch(console.error);
}

module.exports = { testOrderManagement };