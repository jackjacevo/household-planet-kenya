const axios = require('axios');

const API_URL = process.env.API_URL || 'https://api.householdplanetkenya.co.ke';

// Test credentials - replace with actual admin credentials
const TEST_EMAIL = 'admin@householdplanetkenya.co.ke';
const TEST_PASSWORD = 'Admin@2024!';

async function testDashboardAnalytics() {
  try {
    console.log('🔍 Testing Dashboard Analytics Endpoints...\n');

    // Step 1: Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Test main dashboard endpoint
    console.log('2. Testing main dashboard endpoint...');
    try {
      const dashboardResponse = await axios.get(`${API_URL}/admin/dashboard`, { headers });
      console.log('✅ Dashboard endpoint working');
      console.log('📊 Dashboard data structure:');
      console.log('- Overview stats:', Object.keys(dashboardResponse.data.overview || {}));
      console.log('- Recent orders count:', (dashboardResponse.data.recentOrders || []).length);
      console.log('- Top products count:', (dashboardResponse.data.topProducts || []).length);
      console.log('- Customer growth data:', (dashboardResponse.data.customerGrowth || []).length);
      console.log('- Sales by county:', (dashboardResponse.data.salesByCounty || []).length);
    } catch (error) {
      console.log('❌ Dashboard endpoint failed:', error.response?.data?.message || error.message);
    }
    console.log('');

    // Step 3: Test analytics endpoints
    console.log('3. Testing analytics endpoints...');
    
    const analyticsEndpoints = [
      { name: 'Sales Analytics', url: '/admin/analytics/sales?period=monthly' },
      { name: 'Revenue Analytics', url: '/admin/analytics/revenue?period=monthly' },
      { name: 'Popular Categories', url: '/admin/categories/popular?period=monthly' },
      { name: 'Popular Products', url: '/admin/products/popular?period=monthly' },
      { name: 'Customer Insights', url: '/admin/customers/insights' },
      { name: 'Performance Metrics', url: '/admin/analytics/performance' },
      { name: 'Conversion Rates', url: '/admin/analytics/conversion?period=monthly' },
      { name: 'Geographic Sales', url: '/admin/analytics/geographic' }
    ];

    for (const endpoint of analyticsEndpoints) {
      try {
        const response = await axios.get(`${API_URL}${endpoint.url}`, { headers });
        console.log(`✅ ${endpoint.name}: Working`);
        
        // Log data structure for key endpoints
        if (endpoint.name === 'Sales Analytics') {
          console.log(`   - Sales data points: ${(response.data.sales || []).length}`);
        } else if (endpoint.name === 'Popular Categories') {
          console.log(`   - Categories: ${(response.data.categories || []).length}`);
        } else if (endpoint.name === 'Popular Products') {
          console.log(`   - Products: ${(response.data.products || []).length}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint.name}: ${error.response?.data?.message || error.message}`);
      }
    }
    console.log('');

    // Step 4: Test chart data format
    console.log('4. Testing chart data format...');
    try {
      const revenueResponse = await axios.get(`${API_URL}/admin/analytics/revenue?period=monthly`, { headers });
      const revenueData = revenueResponse.data.revenue || [];
      
      if (revenueData.length > 0) {
        console.log('✅ Revenue chart data format:');
        console.log('   Sample data point:', revenueData[0]);
        console.log('   Expected fields: period, revenue');
        console.log('   Has period:', 'period' in revenueData[0]);
        console.log('   Has revenue:', 'revenue' in revenueData[0]);
      } else {
        console.log('⚠️  No revenue data available');
      }
    } catch (error) {
      console.log('❌ Revenue chart data test failed:', error.message);
    }
    console.log('');

    console.log('🎉 Dashboard analytics test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.status === 401) {
      console.log('💡 Tip: Make sure the admin credentials are correct');
    }
  }
}

// Run the test
testDashboardAnalytics();