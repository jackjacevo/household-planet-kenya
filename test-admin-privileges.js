const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
const credentials = {
  email: 'householdplanet819@gmail.com',
  password: 'Admin@2025'
};

async function testAdminPrivileges() {
  try {
    console.log('🔐 Testing SUPER_ADMIN Privileges...\n');
    
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, credentials);
    const { accessToken, user } = loginResponse.data;
    
    console.log('✅ Login:', user.role);
    const headers = { Authorization: `Bearer ${accessToken}` };
    
    // Test all admin endpoints
    const tests = [
      // Dashboard & Analytics
      { name: 'Dashboard Stats', url: '/admin/dashboard' },
      { name: 'Sales Analytics', url: '/admin/analytics/sales?period=7d' },
      { name: 'Performance Metrics', url: '/admin/analytics/performance' },
      { name: 'Revenue Analytics', url: '/admin/analytics/revenue?period=30d' },
      { name: 'Customer Insights', url: '/admin/customers/insights' },
      { name: 'KPIs', url: '/admin/kpis' },
      
      // Inventory Management
      { name: 'Inventory Alerts', url: '/admin/inventory/alerts' },
      
      // Product Management
      { name: 'Products List', url: '/admin/products' },
      { name: 'Product Analytics', url: '/admin/products/analytics' },
      { name: 'Popular Products', url: '/admin/products/popular?period=7d' },
      
      // Category Management
      { name: 'Categories List', url: '/admin/categories' },
      { name: 'Popular Categories', url: '/admin/categories/popular?period=7d' },
      
      // Brand Management
      { name: 'Brands List', url: '/admin/brands' },
      
      // Activity Logs
      { name: 'Recent Activities', url: '/admin/activities/recent' },
      { name: 'Activity Stats', url: '/admin/activity-stats' }
    ];
    
    console.log('📊 Testing Admin Endpoints:\n');
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
      try {
        const response = await axios.get(`${API_BASE}${test.url}`, { headers });
        console.log(`✅ ${test.name}: ${response.status}`);
        passed++;
      } catch (error) {
        console.log(`❌ ${test.name}: ${error.response?.status} ${error.response?.statusText}`);
        failed++;
      }
    }
    
    console.log(`\n📈 Results: ${passed} passed, ${failed} failed`);
    
    if (failed === 0) {
      console.log('\n🎉 ALL ADMIN PRIVILEGES WORKING!');
    } else {
      console.log('\n⚠️  Some endpoints need attention');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAdminPrivileges();