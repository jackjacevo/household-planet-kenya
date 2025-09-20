const axios = require('axios');

async function debugProductCreation() {
  try {
    console.log('🔍 Debugging product creation...');
    
    // Login as admin
    const loginResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
      email: 'admin@householdplanet.co.ke',
      password: 'Admin@2025'
    });
    
    const token = loginResponse.data.accessToken;
    const headers = { 'Authorization': `Bearer ${token}` };
    
    // First check categories
    const categoriesResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/admin/categories', { headers });
    console.log('Categories:', categoriesResponse.data);
    
    if (categoriesResponse.data?.length > 0) {
      const categoryId = categoriesResponse.data[0].id;
      console.log(`Using category ID: ${categoryId}`);
      
      // Try creating a simple product
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        description: 'A test product',
        price: 100,
        categoryId: categoryId,
        stock: 10,
        isActive: true,
        isFeatured: true
      };
      
      console.log('Creating product with data:', productData);
      
      const createResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/admin/products', productData, { headers });
      console.log('✅ Product created:', createResponse.data);
      
      // Check if it appears in the list
      const productsResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/admin/products', { headers });
      console.log(`✅ Now found ${productsResponse.data.products?.length || 0} products`);
      
    } else {
      console.log('❌ No categories found - creating one first');
      
      const categoryData = {
        name: 'Test Category',
        description: 'A test category'
      };
      
      const categoryResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/admin/categories', categoryData, { headers });
      console.log('✅ Category created:', categoryResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Full error response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

debugProductCreation();