const axios = require('axios');

async function testAdminProducts() {
  try {
    console.log('🔐 Testing admin products endpoint...');
    
    // Login as admin
    const loginResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin@2025'
    });
    
    const token = loginResponse.data.accessToken;
    const headers = { 'Authorization': `Bearer ${token}` };
    
    // Test admin products endpoint
    const adminProductsResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/admin/products', { headers });
    console.log(`✅ Admin found ${adminProductsResponse.data.products?.length || 0} products`);
    
    // Test admin categories endpoint
    const adminCategoriesResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/admin/categories', { headers });
    console.log(`✅ Admin found ${adminCategoriesResponse.data?.length || 0} categories`);
    
    // Test public products endpoint
    const publicProductsResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/products');
    console.log(`✅ Public found ${publicProductsResponse.data.products?.length || 0} products`);
    
    // Test public categories endpoint
    const publicCategoriesResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/categories');
    console.log(`✅ Public found ${publicCategoriesResponse.data?.length || 0} categories`);
    
    if (adminProductsResponse.data.products?.length > 0) {
      console.log('\n📦 Admin products:');
      adminProductsResponse.data.products.forEach(product => {
        console.log(`- ${product.name} (Active: ${product.isActive}, Featured: ${product.isFeatured})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAdminProducts();