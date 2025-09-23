const axios = require('axios');

async function testSingleCreation() {
  try {
    console.log('🧪 Testing single item creation after fix...');
    
    // Login as admin
    const loginResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin@2025'
    });
    
    const token = loginResponse.data.accessToken;
    const headers = { 'Authorization': `Bearer ${token}` };
    
    // Create one category
    console.log('📂 Creating test category...');
    const categoryResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/admin/categories', {
      name: 'Test Category ' + Date.now(),
      description: 'Test category created after fix'
    }, { headers });
    
    console.log('Category creation response:', JSON.stringify(categoryResponse.data, null, 2));
    
    // Check if categories now appear
    const categoriesResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/admin/categories', { headers });
    console.log(`✅ Admin categories count: ${categoriesResponse.data?.length || 0}`);
    
    const publicCategoriesResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/categories');
    console.log(`✅ Public categories count: ${publicCategoriesResponse.data?.length || 0}`);
    
    if (categoriesResponse.data?.length > 0) {
      console.log('🎉 Fix is working! Categories are being saved.');
      
      // Create a test product
      const productResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/admin/products', {
        name: 'Test Product ' + Date.now(),
        sku: 'TEST-' + Date.now(),
        description: 'Test product created after fix',
        price: 100,
        categoryId: categoriesResponse.data[0].id,
        stock: 10,
        isActive: true,
        isFeatured: true
      }, { headers });
      
      console.log('Product creation response:', JSON.stringify(productResponse.data, null, 2));
      
      // Check products
      const productsResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/admin/products', { headers });
      console.log(`✅ Admin products count: ${productsResponse.data.products?.length || 0}`);
      
      const publicProductsResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/products');
      console.log(`✅ Public products count: ${publicProductsResponse.data.products?.length || 0}`);
      
    } else {
      console.log('❌ Fix not deployed yet or still not working');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testSingleCreation();