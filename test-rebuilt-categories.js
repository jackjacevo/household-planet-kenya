const axios = require('axios');

async function testRebuiltCategories() {
  try {
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
      email: 'householdplanet819@gmail.com',
      password: 'Admin@2025'
    });
    
    const token = loginResponse.data.accessToken;
    console.log('✅ Login successful');
    
    // Create a parent category with base64 image
    const parentImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    console.log('📝 Creating parent category...');
    const parentResponse = await axios.post(
      'https://api.householdplanetkenya.co.ke/api/categories',
      {
        name: 'Electronics & Gadgets',
        slug: 'electronics-gadgets',
        description: 'Modern electronics and smart gadgets for your home',
        image: parentImageBase64,
        isActive: true
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Parent category created:', parentResponse.data.name);
    const parentId = parentResponse.data.id;
    
    // Create a subcategory
    console.log('📝 Creating subcategory...');
    const subResponse = await axios.post(
      'https://api.householdplanetkenya.co.ke/api/categories',
      {
        name: 'Smart Phones',
        slug: 'smart-phones',
        description: 'Latest smartphones and accessories',
        image: parentImageBase64,
        parentId: parentId,
        isActive: true
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Subcategory created:', subResponse.data.name);
    
    // Fetch all categories to verify
    console.log('📋 Fetching all categories...');
    const categoriesResponse = await axios.get(
      'https://api.householdplanetkenya.co.ke/api/categories',
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    const categories = categoriesResponse.data;
    const parentCategories = categories.filter(cat => !cat.parentId);
    const subcategories = categories.filter(cat => cat.parentId);
    
    console.log(`✅ Total categories: ${categories.length}`);
    console.log(`📁 Parent categories: ${parentCategories.length}`);
    console.log(`📂 Subcategories: ${subcategories.length}`);
    console.log('🔗 View at: https://householdplanetkenya.co.ke/admin/categories');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testRebuiltCategories();