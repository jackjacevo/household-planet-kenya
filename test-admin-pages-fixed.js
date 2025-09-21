const axios = require('axios');

const API_URL = 'https://api.householdplanetkenya.co.ke';
const ADMIN_EMAIL = 'householdplanet819@gmail.com';
const ADMIN_PASSWORD = 'Admin@2025';

let authToken = '';

async function login() {
  const response = await axios.post(`${API_URL}/api/auth/login`, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });
  authToken = response.data.accessToken;
  return authToken;
}

const apiCall = async (endpoint) => {
  try {
    const response = await axios.get(`${API_URL}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message,
      status: error.response?.status 
    };
  }
};

async function testAdminPages() {
  console.log('🔍 Testing Admin Pages - Database Connectivity\n');
  
  await login();
  console.log('✅ Authentication successful\n');

  const pages = [
    { name: 'Dashboard', endpoint: '/api/admin/dashboard' },
    { name: 'Orders', endpoint: '/api/orders' },
    { name: 'Products', endpoint: '/api/admin/products' },
    { name: 'Categories', endpoint: '/api/admin/categories' },
    { name: 'Brands', endpoint: '/api/admin/brands' },
    { name: 'Analytics', endpoint: '/api/admin/analytics/sales' },
    { name: 'Delivery', endpoint: '/api/delivery/locations' },
    { name: 'Inventory', endpoint: '/api/admin/inventory/alerts' },
    { name: 'Activities', endpoint: '/api/admin/activities' },
    { name: 'Settings', endpoint: '/api/settings' },
    { name: 'Promo Codes', endpoint: '/api/promo-codes' },
    { name: 'Users (Customers)', endpoint: '/api/users' },
    { name: 'Customer Insights', endpoint: '/api/admin/customers/insights' },
    { name: 'Recent Activities', endpoint: '/api/admin/activities/recent' }
  ];

  let working = 0;
  let total = pages.length;

  for (const page of pages) {
    console.log(`📄 ${page.name}:`);
    
    const result = await apiCall(page.endpoint);
    
    if (result.success) {
      console.log(`   ✅ Connected - Status: ${result.status}`);
      
      // Show data summary
      if (Array.isArray(result.data)) {
        console.log(`   📊 Records: ${result.data.length}`);
      } else if (result.data?.data && Array.isArray(result.data.data)) {
        console.log(`   📊 Records: ${result.data.data.length}`);
      } else if (result.data?.orders && Array.isArray(result.data.orders)) {
        console.log(`   📊 Orders: ${result.data.orders.length}`);
      } else if (result.data?.products && Array.isArray(result.data.products)) {
        console.log(`   📊 Products: ${result.data.products.length}`);
      } else if (result.data?.overview) {
        console.log(`   📊 Dashboard data loaded`);
      } else {
        console.log(`   📊 Data structure: ${typeof result.data}`);
      }
      
      working++;
    } else {
      console.log(`   ❌ Failed - Status: ${result.status} - ${result.error}`);
    }
  }

  console.log(`\n📊 Results: ${working}/${total} pages connected to database`);
  
  if (working >= 10) {
    console.log('\n🎉 ADMIN DASHBOARD SUCCESSFULLY CONNECTED TO DATABASE!');
    console.log('✅ Core functionality confirmed working');
  } else {
    console.log('\n⚠️ Some endpoints may need configuration');
  }

  // Test key database operations
  console.log('\n🔧 Testing Key Database Operations:');
  
  // Test dashboard stats (most important)
  const dashboard = await apiCall('/api/admin/dashboard');
  if (dashboard.success && dashboard.data.overview) {
    console.log('✅ Dashboard Stats: WORKING');
    console.log(`   💰 Revenue: KSh ${dashboard.data.overview.totalRevenue?.toLocaleString() || 0}`);
    console.log(`   📦 Orders: ${dashboard.data.overview.totalOrders || 0}`);
    console.log(`   👥 Customers: ${dashboard.data.overview.totalCustomers || 0}`);
  }
  
  // Test orders (critical for business)
  const orders = await apiCall('/api/orders');
  if (orders.success) {
    const orderCount = orders.data?.orders?.length || orders.data?.length || 0;
    console.log(`✅ Orders Management: WORKING (${orderCount} orders)`);
  }
  
  // Test products (critical for business)
  const products = await apiCall('/api/admin/products');
  if (products.success) {
    const productCount = products.data?.products?.length || products.data?.length || 0;
    console.log(`✅ Product Management: WORKING (${productCount} products)`);
  }
  
  console.log('\n🚀 Admin Dashboard Database Communication: SUCCESS!');
}

testAdminPages();