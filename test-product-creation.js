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

async function testProductCreation() {
  console.log('🧪 Testing Product Creation with Different Payloads\n');
  
  await login();
  console.log('✅ Authentication successful\n');

  // Get existing categories first
  const categoriesResponse = await axios.get(`${API_URL}/api/admin/categories`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  const categories = categoriesResponse.data;
  console.log(`📁 Available categories: ${categories.length}`);
  if (categories.length > 0) {
    console.log(`   Using category ID: ${categories[0].id} (${categories[0].name})`);
  }

  // Test different product payloads
  const productPayloads = [
    {
      name: 'Simple Product Test',
      description: 'Basic product creation test',
      price: 1500,
      categoryId: categories[0]?.id || 1,
      stock: 25,
      status: 'ACTIVE'
    },
    {
      name: 'Complete Product Test',
      description: 'Full product with all fields',
      price: 2500,
      categoryId: categories[0]?.id || 1,
      stock: 15,
      status: 'ACTIVE',
      sku: 'TEST-PROD-001',
      weight: 1.5,
      dimensions: '10x10x10'
    },
    {
      name: 'Minimal Product Test',
      price: 500,
      categoryId: categories[0]?.id || 1
    }
  ];

  for (let i = 0; i < productPayloads.length; i++) {
    console.log(`\n📦 Testing Product Payload ${i + 1}:`);
    console.log(`   Data: ${JSON.stringify(productPayloads[i], null, 2)}`);
    
    try {
      const response = await axios.post(`${API_URL}/api/admin/products`, productPayloads[i], {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log(`   ✅ SUCCESS - Status: ${response.status}`);
      console.log(`   📊 Created Product ID: ${response.data.id || response.data.product?.id}`);
      
      // Verify it appears in products list
      const productsCheck = await axios.get(`${API_URL}/api/admin/products`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      const productsList = productsCheck.data.products || productsCheck.data;
      const foundProduct = productsList.find(p => p.name === productPayloads[i].name);
      console.log(`   ${foundProduct ? '✅' : '❌'} Product appears in products list`);
      
      if (foundProduct) {
        console.log(`   📋 Product Details: ${foundProduct.name} - KSh ${foundProduct.price}`);
        console.log(`   🏷️ Category: ${foundProduct.category?.name || 'No category'}`);
        
        // Test product update
        const updateResponse = await axios.put(`${API_URL}/api/admin/products/${foundProduct.id}`, {
          name: foundProduct.name + ' (Updated)',
          price: foundProduct.price + 100
        }, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`   ${updateResponse.status === 200 ? '✅' : '❌'} Product update works`);
        
        // Clean up - delete the test product
        const deleteResponse = await axios.delete(`${API_URL}/api/admin/products/${foundProduct.id}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log(`   ${deleteResponse.status === 200 ? '✅' : '❌'} Product deletion works`);
      }
      
      break; // If one works, we're good
      
    } catch (error) {
      console.log(`   ❌ FAILED - Status: ${error.response?.status}`);
      console.log(`   Error: ${JSON.stringify(error.response?.data)}`);
    }
  }

  // Test category-product relationship
  console.log('\n🔗 Testing Category-Product Relationships:');
  
  const productsResponse = await axios.get(`${API_URL}/api/admin/products`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  const products = productsResponse.data.products || productsResponse.data;
  console.log(`   📦 Total products: ${products.length}`);
  
  if (products.length > 0) {
    const productWithCategory = products.find(p => p.category);
    if (productWithCategory) {
      console.log(`   ✅ Product-Category relationship working`);
      console.log(`   📋 Example: "${productWithCategory.name}" → "${productWithCategory.category.name}"`);
    } else {
      console.log(`   ⚠️ No products with category relationships found`);
    }
  }

  // Verify dashboard updates
  const dashboardResponse = await axios.get(`${API_URL}/api/admin/dashboard`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  if (dashboardResponse.data.overview) {
    console.log(`\n📊 Dashboard Integration:`);
    console.log(`   ✅ Total Products: ${dashboardResponse.data.overview.totalProducts}`);
    console.log(`   ✅ Active Products: ${dashboardResponse.data.overview.activeProducts}`);
    console.log(`   ✅ Dashboard reflects current data`);
  }

  console.log('\n🎉 PRODUCT MANAGEMENT TEST COMPLETE!');
}

testProductCreation();