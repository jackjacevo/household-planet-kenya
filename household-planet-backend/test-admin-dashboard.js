const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test admin credentials (you'll need to create an admin user first)
const ADMIN_CREDENTIALS = {
  email: 'admin@householdplanet.co.ke',
  password: 'Admin123!@#'
};

let adminToken = '';

async function testAdminDashboard() {
  console.log('🚀 Testing Admin Dashboard - Phase 6');
  console.log('=====================================\n');

  try {
    // Step 1: Login as admin
    console.log('1. Admin Login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, ADMIN_CREDENTIALS);
    adminToken = loginResponse.data.access_token;
    console.log('✅ Admin login successful');

    // Step 2: Test Dashboard Overview
    console.log('\n2. Testing Dashboard Overview...');
    const dashboardResponse = await axios.get(`${BASE_URL}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('📊 Dashboard Data:');
    console.log(`   Today's Sales: KSh ${dashboardResponse.data.todaysSales.revenue} (${dashboardResponse.data.todaysSales.count} orders)`);
    console.log(`   Pending Orders: ${dashboardResponse.data.pendingOrders}`);
    console.log(`   Low Stock Products: ${dashboardResponse.data.lowStockProducts}`);
    console.log(`   Total Customers: ${dashboardResponse.data.totalCustomers}`);
    console.log(`   Monthly Revenue: KSh ${dashboardResponse.data.monthlyRevenue}`);
    console.log(`   Average Order Value: KSh ${dashboardResponse.data.averageOrderValue.toFixed(2)}`);
    console.log(`   Conversion Rate: ${dashboardResponse.data.conversionRate.toFixed(1)}%`);

    // Step 3: Test Sales Analytics
    console.log('\n3. Testing Sales Analytics...');
    const salesResponse = await axios.get(`${BASE_URL}/api/admin/analytics/sales?period=30d`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('📈 Sales Analytics:');
    console.log(`   Daily Sales Records: ${salesResponse.data.dailySales.length}`);
    console.log(`   Weekly Sales Records: ${salesResponse.data.weeklySales.length}`);
    console.log(`   Monthly Sales Records: ${salesResponse.data.monthlySales.length}`);
    console.log(`   Top Products: ${salesResponse.data.topProducts.length}`);

    // Step 4: Test Customer Analytics
    console.log('\n4. Testing Customer Analytics...');
    const customerResponse = await axios.get(`${BASE_URL}/api/admin/analytics/customers`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('👥 Customer Analytics:');
    console.log(`   Retention Rate: ${customerResponse.data.retentionRate.toFixed(1)}%`);
    console.log(`   Top Customers: ${customerResponse.data.topCustomers.length}`);
    console.log(`   Locations: ${customerResponse.data.customersByLocation.length}`);

    // Step 5: Test Product Analytics
    console.log('\n5. Testing Product Analytics...');
    const productResponse = await axios.get(`${BASE_URL}/api/admin/analytics/products`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('📦 Product Analytics:');
    console.log(`   Total Products: ${productResponse.data.inventoryStatus.total}`);
    console.log(`   In Stock: ${productResponse.data.inventoryStatus.inStock}`);
    console.log(`   Low Stock: ${productResponse.data.inventoryStatus.lowStock}`);
    console.log(`   Out of Stock: ${productResponse.data.inventoryStatus.outOfStock}`);
    console.log(`   Most Viewed: ${productResponse.data.mostViewed.length}`);
    console.log(`   Best Rated: ${productResponse.data.bestRated.length}`);

    // Step 6: Test Geographic Analytics
    console.log('\n6. Testing Geographic Analytics...');
    const geoResponse = await axios.get(`${BASE_URL}/api/admin/analytics/geographic`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('🗺️ Geographic Analytics:');
    console.log(`   Counties with Sales: ${geoResponse.data.salesByCounty.length}`);
    console.log(`   Delivery Locations: ${geoResponse.data.deliveryPerformance.length}`);

    // Step 7: Test System Alerts
    console.log('\n7. Testing System Alerts...');
    const alertsResponse = await axios.get(`${BASE_URL}/api/admin/alerts`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('🚨 System Alerts:');
    console.log(`   Low Stock Items: ${alertsResponse.data.lowStock.length}`);
    console.log(`   Failed Payments: ${alertsResponse.data.failedPayments}`);
    console.log(`   Pending Returns: ${alertsResponse.data.pendingReturns}`);

    // Step 8: Test Recent Activities
    console.log('\n8. Testing Recent Activities...');
    const activitiesResponse = await axios.get(`${BASE_URL}/api/admin/activities?limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('📋 Recent Activities:');
    console.log(`   Activities Found: ${activitiesResponse.data.length}`);
    activitiesResponse.data.slice(0, 3).forEach((activity, index) => {
      console.log(`   ${index + 1}. ${activity.message} (${activity.type})`);
    });

    // Step 9: Test KPIs
    console.log('\n9. Testing KPIs...');
    const kpiResponse = await axios.get(`${BASE_URL}/api/admin/kpis`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('📊 Key Performance Indicators:');
    console.log(`   Revenue: KSh ${kpiResponse.data.revenue.current.toFixed(2)} (${kpiResponse.data.revenue.change.toFixed(1)}% change)`);
    console.log(`   Orders: ${kpiResponse.data.orders.current} (${kpiResponse.data.orders.change.toFixed(1)}% change)`);
    console.log(`   Customers: ${kpiResponse.data.customers.current} (${kpiResponse.data.customers.change.toFixed(1)}% change)`);
    console.log(`   Conversion: ${kpiResponse.data.conversion.current.toFixed(1)}%`);
    console.log(`   Retention: ${kpiResponse.data.retention.current.toFixed(1)}%`);
    console.log(`   Avg Order: KSh ${kpiResponse.data.avgOrder.current.toFixed(2)} (${kpiResponse.data.avgOrder.change.toFixed(1)}% change)`);

    console.log('\n✅ All Admin Dashboard Tests Passed!');
    console.log('\n🎉 Phase 6 - Admin Panel Implementation Complete!');
    console.log('\nFeatures Implemented:');
    console.log('• Comprehensive dashboard overview');
    console.log('• Real-time analytics and KPIs');
    console.log('• Sales performance tracking');
    console.log('• Customer behavior analysis');
    console.log('• Product performance metrics');
    console.log('• Geographic sales distribution');
    console.log('• System alerts and notifications');
    console.log('• Recent activities feed');
    console.log('• Inventory management insights');

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

// Helper function to create admin user if needed
async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    await axios.post(`${BASE_URL}/api/auth/register`, {
      name: 'Admin User',
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password,
      phone: '+254700000000'
    });
    console.log('✅ Admin user created. Please update role to ADMIN in database.');
  } catch (error) {
    if (error.response?.status === 400 && error.response.data.message.includes('already exists')) {
      console.log('ℹ️ Admin user already exists');
    } else {
      console.error('❌ Failed to create admin user:', error.response?.data || error.message);
    }
  }
}

// Run the test
if (require.main === module) {
  testAdminDashboard().catch(console.error);
}

module.exports = { testAdminDashboard, createAdminUser };