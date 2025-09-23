const axios = require('axios');

async function testLoginAPI() {
  try {
    console.log('🔐 Testing login API...');
    
    // Test admin login
    console.log('Testing admin login...');
    const adminResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin@2025'
    });
    
    console.log('✅ Admin login successful');
    console.log('Response structure:', Object.keys(adminResponse.data));
    console.log('User data:', adminResponse.data.user ? 'Present' : 'Missing');
    console.log('Access token:', adminResponse.data.accessToken ? 'Present' : 'Missing');
    
    // Test customer login
    console.log('\nTesting customer login...');
    const customerResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
      email: 'john.doe@example.com',
      password: 'Password123!'
    });
    
    console.log('✅ Customer login successful');
    console.log('Response structure:', Object.keys(customerResponse.data));
    
    // Test invalid login
    console.log('\nTesting invalid login...');
    try {
      await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      });
    } catch (error) {
      console.log('✅ Invalid login properly rejected:', error.response?.status, error.response?.data?.message);
    }
    
    // Test API endpoints
    console.log('\nTesting API endpoints...');
    const productsResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/products');
    console.log('✅ Products API working:', productsResponse.data.products?.length || 0, 'products');
    
    const categoriesResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/categories');
    console.log('✅ Categories API working:', categoriesResponse.data?.length || 0, 'categories');
    
    const featuredResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/products/featured');
    console.log('✅ Featured products API working:', featuredResponse.data?.length || 0, 'featured products');
    
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

testLoginAPI();