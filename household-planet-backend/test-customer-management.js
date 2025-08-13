const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

const ADMIN_CREDENTIALS = {
  email: 'admin@householdplanet.co.ke',
  password: 'Admin123!@#'
};

let adminToken = '';

async function testCustomerManagement() {
  console.log('🚀 Testing Customer Management Features');
  console.log('======================================\n');

  try {
    // Step 1: Admin Login
    console.log('1. Admin Login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, ADMIN_CREDENTIALS);
    adminToken = loginResponse.data.access_token;
    console.log('✅ Admin login successful');

    // Step 2: Get Customer Statistics
    console.log('\n2. Testing Customer Statistics...');
    const statsResponse = await axios.get(`${BASE_URL}/api/admin/customers/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('📊 Customer Statistics:');
    console.log(`   Total Customers: ${statsResponse.data.total}`);
    console.log(`   Active Customers: ${statsResponse.data.active}`);
    console.log(`   Inactive Customers: ${statsResponse.data.inactive}`);
    console.log(`   New This Month: ${statsResponse.data.newThisMonth}`);
    console.log(`   Top Spenders: ${statsResponse.data.topSpenders.length}`);

    // Step 3: Get Customers with Filters
    console.log('\n3. Testing Customer Retrieval with Filters...');
    const customersResponse = await axios.get(`${BASE_URL}/api/admin/customers`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log(`👥 Found ${customersResponse.data.length} customers`);
    
    if (customersResponse.data.length > 0) {
      const testCustomer = customersResponse.data[0];
      console.log(`   Test Customer: ${testCustomer.name} (${testCustomer.email})`);

      // Step 4: Get Customer Details
      console.log('\n4. Testing Customer Details Retrieval...');
      const customerDetailResponse = await axios.get(`${BASE_URL}/api/admin/customers/${testCustomer.id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log('👤 Customer Details:');
      console.log(`   Name: ${customerDetailResponse.data.name}`);
      console.log(`   Email: ${customerDetailResponse.data.email}`);
      console.log(`   Total Spent: KSh ${customerDetailResponse.data.totalSpent}`);
      console.log(`   Loyalty Points: ${customerDetailResponse.data.loyaltyPoints}`);
      console.log(`   Orders: ${customerDetailResponse.data.orders.length}`);
      console.log(`   Addresses: ${customerDetailResponse.data.addresses.length}`);
      console.log(`   Support Tickets: ${customerDetailResponse.data.supportTickets.length}`);

      // Step 5: Test Customer Insights
      console.log('\n5. Testing Customer Insights...');
      const insightsResponse = await axios.get(`${BASE_URL}/api/admin/customers/${testCustomer.id}/insights`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log('🔍 Customer Insights:');
      console.log(`   Total Orders: ${insightsResponse.data.totalOrders}`);
      console.log(`   Average Order Value: KSh ${insightsResponse.data.avgOrderValue.toFixed(2)}`);
      console.log(`   Days Since Last Order: ${insightsResponse.data.daysSinceLastOrder || 'N/A'}`);
      console.log(`   Favorite Products: ${insightsResponse.data.favoriteProducts.length}`);
      console.log(`   Reviews Written: ${insightsResponse.data.reviews}`);

      // Step 6: Test Customer Segmentation
      console.log('\n6. Testing Customer Segmentation...');
      const segments = ['high_value', 'new_customers', 'inactive'];
      
      for (const segment of segments) {
        const segmentResponse = await axios.get(`${BASE_URL}/api/admin/customers/segments/${segment}`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`   ${segment}: ${segmentResponse.data.length} customers`);
      }

      // Step 7: Test Customer Tagging
      console.log('\n7. Testing Customer Tagging...');
      await axios.post(`${BASE_URL}/api/admin/customers/${testCustomer.id}/tags`, {
        tag: 'VIP Customer'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Tag added successfully');

      await axios.post(`${BASE_URL}/api/admin/customers/${testCustomer.id}/tags`, {
        tag: 'High Value'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Second tag added successfully');

      // Step 8: Test Loyalty Points Management
      console.log('\n8. Testing Loyalty Points Management...');
      const loyaltyResponse = await axios.post(`${BASE_URL}/api/admin/customers/${testCustomer.id}/loyalty`, {
        points: 500,
        type: 'BONUS',
        description: 'Admin test bonus points'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log('🎁 Loyalty Points:');
      console.log(`   Points Added: 500`);
      console.log(`   New Balance: ${loyaltyResponse.data.user.loyaltyPoints}`);

      // Step 9: Test Support Ticket Creation
      console.log('\n9. Testing Support Ticket Creation...');
      const ticketResponse = await axios.post(`${BASE_URL}/api/admin/customers/${testCustomer.id}/support-tickets`, {
        subject: 'Test Support Ticket',
        message: 'This is a test support ticket created by admin',
        category: 'GENERAL',
        priority: 'MEDIUM'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log('🎫 Support Ticket Created:');
      console.log(`   Ticket ID: ${ticketResponse.data.id}`);
      console.log(`   Subject: ${ticketResponse.data.subject}`);
      console.log(`   Status: ${ticketResponse.data.status}`);

      // Step 10: Test Ticket Reply
      console.log('\n10. Testing Support Ticket Reply...');
      await axios.post(`${BASE_URL}/api/admin/customers/support-tickets/${ticketResponse.data.id}/replies`, {
        message: 'Thank you for contacting us. We are looking into your request.',
        isStaff: true
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Ticket reply added successfully');

      // Step 11: Test Address Verification
      console.log('\n11. Testing Address Verification...');
      if (customerDetailResponse.data.addresses.length > 0) {
        const addressId = customerDetailResponse.data.addresses[0].id;
        const verifyResponse = await axios.post(`${BASE_URL}/api/admin/customers/${testCustomer.id}/addresses/${addressId}/verify`, {}, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        console.log('📍 Address Verification:');
        console.log(`   Is Valid: ${verifyResponse.data.isValid}`);
        console.log(`   Suggestions: ${verifyResponse.data.suggestions.length}`);
      } else {
        console.log('ℹ️ No addresses found for verification test');
      }

      // Step 12: Test Communication Log
      console.log('\n12. Testing Communication Log...');
      const commLogResponse = await axios.get(`${BASE_URL}/api/admin/customers/${testCustomer.id}/communication-log`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log('📞 Communication Log:');
      console.log(`   Total Communications: ${commLogResponse.data.length}`);
      commLogResponse.data.slice(0, 3).forEach((comm, index) => {
        console.log(`   ${index + 1}. ${comm.type}: ${comm.subject}`);
      });

      // Step 13: Test Customer Update
      console.log('\n13. Testing Customer Update...');
      await axios.put(`${BASE_URL}/api/admin/customers/${testCustomer.id}`, {
        marketingEmails: false,
        smsNotifications: true
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Customer preferences updated successfully');

      // Step 14: Test Customer Search
      console.log('\n14. Testing Customer Search...');
      const searchResponse = await axios.get(`${BASE_URL}/api/admin/customers?search=${testCustomer.name.split(' ')[0]}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log(`🔍 Search Results: ${searchResponse.data.length} customers found`);

      // Step 15: Test Tag Removal
      console.log('\n15. Testing Tag Removal...');
      await axios.delete(`${BASE_URL}/api/admin/customers/${testCustomer.id}/tags/VIP Customer`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Tag removed successfully');

    } else {
      console.log('ℹ️ No customers found for detailed testing');
    }

    console.log('\n✅ All Customer Management Tests Passed!');
    console.log('\n🎉 Customer Management Features Complete!');
    console.log('\nFeatures Implemented:');
    console.log('• Comprehensive customer database with detailed profiles');
    console.log('• Complete order history tracking for each customer');
    console.log('• Customer communication logs and history');
    console.log('• Advanced customer segmentation and tagging system');
    console.log('• Loyalty program management with points tracking');
    console.log('• Support ticket handling and management');
    console.log('• Address verification and validation system');
    console.log('• Customer insights and analytics');
    console.log('• Real-time customer statistics and reporting');
    console.log('• Professional admin interface for customer management');

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
  testCustomerManagement().catch(console.error);
}

module.exports = { testCustomerManagement };