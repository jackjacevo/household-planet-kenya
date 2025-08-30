const axios = require('axios');

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function testOrderDashboardCalculations() {
  console.log('🧪 Testing Order Dashboard Calculation Fixes...\n');

  try {
    // Test admin dashboard stats
    console.log('📊 Testing Admin Dashboard Stats...');
    const dashboardResponse = await axios.get(`${API_BASE}/api/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${process.env.ADMIN_TOKEN || 'test-token'}`
      }
    });

    const dashboardStats = dashboardResponse.data;
    console.log('✅ Dashboard Stats Response:');
    console.log(`   Total Orders: ${dashboardStats.overview?.totalOrders || 0}`);
    console.log(`   Total Revenue: KSh ${(dashboardStats.overview?.totalRevenue || 0).toLocaleString()}`);
    console.log(`   Delivered Revenue: KSh ${(dashboardStats.overview?.deliveredRevenue || 0).toLocaleString()}`);
    console.log(`   Today's Orders: ${dashboardStats.overview?.todayOrders || 0}`);
    console.log(`   Today's Revenue: KSh ${(dashboardStats.overview?.todayRevenue || 0).toLocaleString()}`);
    console.log(`   Pending Orders: ${dashboardStats.overview?.pendingOrders || 0}`);
    console.log(`   Processing Orders: ${dashboardStats.overview?.processingOrders || 0}`);
    console.log(`   Shipped Orders: ${dashboardStats.overview?.shippedOrders || 0}`);
    console.log(`   Delivered Orders: ${dashboardStats.overview?.deliveredOrders || 0}\n`);

    // Test orders stats
    console.log('📋 Testing Orders Stats...');
    const ordersResponse = await axios.get(`${API_BASE}/api/orders/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${process.env.ADMIN_TOKEN || 'test-token'}`
      }
    });

    const ordersStats = ordersResponse.data;
    console.log('✅ Orders Stats Response:');
    console.log(`   Total Orders: ${ordersStats.totalOrders || 0}`);
    console.log(`   Total Revenue: KSh ${(ordersStats.totalRevenue || 0).toLocaleString()}`);
    console.log(`   Delivered Revenue: KSh ${(ordersStats.deliveredRevenue || 0).toLocaleString()}`);
    console.log(`   Pending Orders: ${ordersStats.pendingOrders || 0}`);
    console.log(`   Confirmed Orders: ${ordersStats.confirmedOrders || 0}`);
    console.log(`   Processing Orders: ${ordersStats.processingOrders || 0}`);
    console.log(`   Shipped Orders: ${ordersStats.shippedOrders || 0}`);
    console.log(`   Delivered Orders: ${ordersStats.deliveredOrders || 0}\n`);

    // Compare consistency
    console.log('🔍 Checking Consistency...');
    const dashboardTotal = dashboardStats.overview?.totalOrders || 0;
    const ordersTotal = ordersStats.totalOrders || 0;
    const dashboardRevenue = dashboardStats.overview?.totalRevenue || 0;
    const ordersRevenue = ordersStats.totalRevenue || 0;

    if (dashboardTotal === ordersTotal) {
      console.log('✅ Total Orders: Consistent between dashboard and orders');
    } else {
      console.log(`❌ Total Orders: Inconsistent - Dashboard: ${dashboardTotal}, Orders: ${ordersTotal}`);
    }

    if (dashboardRevenue === ordersRevenue) {
      console.log('✅ Total Revenue: Consistent between dashboard and orders');
    } else {
      console.log(`❌ Total Revenue: Inconsistent - Dashboard: ${dashboardRevenue}, Orders: ${ordersRevenue}`);
    }

    // Check for null/undefined values
    console.log('\n🛡️ Checking for Null/Undefined Values...');
    const checkValue = (name, value) => {
      if (value === null || value === undefined || isNaN(value)) {
        console.log(`❌ ${name}: Invalid value (${value})`);
        return false;
      } else {
        console.log(`✅ ${name}: Valid (${value})`);
        return true;
      }
    };

    let allValid = true;
    allValid &= checkValue('Dashboard Total Revenue', dashboardStats.overview?.totalRevenue);
    allValid &= checkValue('Dashboard Today Revenue', dashboardStats.overview?.todayRevenue);
    allValid &= checkValue('Orders Total Revenue', ordersStats.totalRevenue);
    allValid &= checkValue('Orders Delivered Revenue', ordersStats.deliveredRevenue);

    console.log(`\n${allValid ? '✅' : '❌'} Overall Status: ${allValid ? 'All calculations are working correctly!' : 'Some issues found'}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testOrderDashboardCalculations();