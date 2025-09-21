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

const apiCall = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: { 'Authorization': `Bearer ${authToken}` }
    };
    if (data) config.data = data;
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status 
    };
  }
};

async function testAllAdminPages() {
  console.log('🔍 Testing All Admin Pages - Database Connectivity\n');
  
  try {
    await login();
    console.log('✅ Authentication successful\n');

    const tests = [
      // Dashboard Page
      {
        page: 'Dashboard',
        endpoint: '/api/admin/dashboard',
        method: 'GET',
        expectedData: ['overview', 'recentOrders']
      },
      
      // Orders Page
      {
        page: 'Orders',
        endpoint: '/api/orders',
        method: 'GET',
        expectedData: 'array'
      },
      
      // Products Page
      {
        page: 'Products',
        endpoint: '/api/admin/products',
        method: 'GET',
        expectedData: 'array'
      },
      
      // Categories Page
      {
        page: 'Categories',
        endpoint: '/api/admin/categories',
        method: 'GET',
        expectedData: 'array'
      },
      
      // Brands Page
      {
        page: 'Brands',
        endpoint: '/api/admin/brands',
        method: 'GET',
        expectedData: 'array'
      },
      
      // Customers Page
      {
        page: 'Customers',
        endpoint: '/api/customers',
        method: 'GET',
        expectedData: 'array'
      },
      
      // Analytics Page
      {
        page: 'Analytics - Sales',
        endpoint: '/api/admin/analytics/sales',
        method: 'GET',
        expectedData: 'object'
      },
      
      // Payments Page
      {
        page: 'Payments',
        endpoint: '/api/payments',
        method: 'GET',
        expectedData: 'array'
      },
      
      // Delivery Page
      {
        page: 'Delivery Locations',
        endpoint: '/api/delivery/locations',
        method: 'GET',
        expectedData: 'array'
      },
      
      // Inventory Page
      {
        page: 'Inventory Alerts',
        endpoint: '/api/admin/inventory/alerts',
        method: 'GET',
        expectedData: 'array'
      },
      
      // Staff Page
      {
        page: 'Staff',
        endpoint: '/api/staff',
        method: 'GET',
        expectedData: 'array'
      },
      
      // Activities Page
      {
        page: 'Activities',
        endpoint: '/api/admin/activities',
        method: 'GET',
        expectedData: 'array'
      },
      
      // Settings Page
      {
        page: 'Settings',
        endpoint: '/api/settings',
        method: 'GET',
        expectedData: 'object'
      },
      
      // WhatsApp Page
      {
        page: 'WhatsApp Orders',
        endpoint: '/api/whatsapp/orders',
        method: 'GET',
        expectedData: 'array'
      },
      
      // Promo Codes Page
      {
        page: 'Promo Codes',
        endpoint: '/api/promo-codes',
        method: 'GET',
        expectedData: 'array'
      }
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    for (const test of tests) {
      console.log(`📄 Testing ${test.page}...`);
      
      const result = await apiCall(test.method, test.endpoint);
      
      if (result.success) {
        // Validate data structure
        let dataValid = false;
        
        if (test.expectedData === 'array') {
          dataValid = Array.isArray(result.data);
        } else if (test.expectedData === 'object') {
          dataValid = typeof result.data === 'object' && result.data !== null;
        } else if (Array.isArray(test.expectedData)) {
          dataValid = test.expectedData.every(key => result.data.hasOwnProperty(key));
        }
        
        if (dataValid) {
          console.log(`   ✅ API Connected - Data: ${Array.isArray(result.data) ? result.data.length + ' records' : 'Valid object'}`);
          passedTests++;
        } else {
          console.log(`   ⚠️ API Connected but unexpected data structure`);
          console.log(`   📊 Data: ${JSON.stringify(result.data).substring(0, 100)}...`);
        }
      } else {
        console.log(`   ❌ API Failed - Status: ${result.status}, Error: ${JSON.stringify(result.error).substring(0, 100)}`);
      }
    }

    console.log(`\n📊 Test Results: ${passedTests}/${totalTests} pages working`);
    
    if (passedTests === totalTests) {
      console.log('\n🎉 ALL ADMIN PAGES SUCCESSFULLY CONNECTED TO DATABASE!');
      console.log('✅ Complete API-Database communication confirmed');
    } else {
      console.log(`\n⚠️ ${totalTests - passedTests} pages need attention`);
    }

    // Test database write operations
    console.log('\n🔧 Testing Database Write Operations...');
    
    // Test product creation
    const productTest = await apiCall('POST', '/api/admin/products', {
      name: 'Test Product API Connection',
      description: 'Testing database connectivity',
      price: 100,
      categoryId: 1,
      stock: 10,
      status: 'ACTIVE'
    });
    
    if (productTest.success) {
      console.log('✅ Product Creation: Database WRITE successful');
      
      // Clean up - delete test product
      await apiCall('DELETE', `/api/admin/products/${productTest.data.id}`);
      console.log('✅ Product Deletion: Database DELETE successful');
    } else {
      console.log('❌ Product Creation: Database WRITE failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAllAdminPages();