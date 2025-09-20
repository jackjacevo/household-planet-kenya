const axios = require('axios');

async function debugAPIFailures() {
  try {
    console.log('🔍 Debugging API failures...');
    
    // Login as admin
    const loginResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
      email: 'admin@householdplanet.co.ke',
      password: 'Admin@2025'
    });
    
    const token = loginResponse.data.accessToken;
    const headers = { 'Authorization': `Bearer ${token}` };
    
    // Test category creation with detailed error logging
    console.log('\n📂 Testing category creation...');
    try {
      const categoryResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/admin/categories', {
        name: 'Debug Category',
        description: 'Test category for debugging'
      }, { headers });
      console.log('✅ Category creation response:', JSON.stringify(categoryResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Category creation failed:', error.response?.status, error.response?.statusText);
      console.log('Error details:', JSON.stringify(error.response?.data, null, 2));
    }
    
    // Test product creation with detailed error logging
    console.log('\n🛍️ Testing product creation...');
    try {
      const productResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/admin/products', {
        name: 'Debug Product',
        sku: 'DEBUG-001',
        description: 'Test product for debugging',
        price: 100,
        categoryId: 1,
        stock: 10,
        isActive: true,
        isFeatured: true
      }, { headers });
      console.log('✅ Product creation response:', JSON.stringify(productResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Product creation failed:', error.response?.status, error.response?.statusText);
      console.log('Error details:', JSON.stringify(error.response?.data, null, 2));
    }
    
    // Test database connection via health endpoint
    console.log('\n🏥 Testing health endpoints...');
    try {
      const healthResponse = await axios.get('https://api.householdplanetkenya.co.ke/health');
      console.log('✅ Health check:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health check failed:', error.response?.status);
    }
    
    // Test admin endpoints directly
    console.log('\n📊 Testing admin endpoints...');
    try {
      const adminProductsResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/admin/products', { headers });
      console.log('Admin products response structure:', Object.keys(adminProductsResponse.data));
      console.log('Admin products data:', JSON.stringify(adminProductsResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Admin products failed:', error.response?.status, error.response?.data);
    }
    
    try {
      const adminCategoriesResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/admin/categories', { headers });
      console.log('Admin categories response structure:', Object.keys(adminCategoriesResponse.data));
      console.log('Admin categories data:', JSON.stringify(adminCategoriesResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Admin categories failed:', error.response?.status, error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugAPIFailures();