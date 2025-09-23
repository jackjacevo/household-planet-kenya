const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testAdminProducts() {
  try {
    console.log('Testing Admin Products API...');
    
    // Test login first
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'HouseholdAdmin2024!'
    });
    
    const token = loginResponse.data.accessToken;
    console.log('✅ Admin login successful');
    
    // Test get products
    const productsResponse = await axios.get(`${API_URL}/api/admin/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Get products successful');
    console.log(`Found ${productsResponse.data.data.length} products`);
    
    // Test get categories
    const categoriesResponse = await axios.get(`${API_URL}/api/admin/categories`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Get categories successful');
    console.log(`Found ${categoriesResponse.data.length} categories`);
    
    // Test get brands
    const brandsResponse = await axios.get(`${API_URL}/api/admin/brands`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Get brands successful');
    console.log(`Found ${brandsResponse.data.length} brands`);
    
    // Test create product
    const newProduct = {
      name: 'Test Product',
      slug: 'test-product',
      description: 'This is a test product',
      sku: 'TEST-001',
      price: 1000,
      categoryId: 1,
      isActive: true,
      isFeatured: false,
      images: [],
      tags: ['test']
    };
    
    const createResponse = await axios.post(`${API_URL}/api/admin/products`, newProduct, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Create product successful');
    console.log(`Created product with ID: ${createResponse.data.id}`);
    
    // Test update product
    const updateData = {
      name: 'Updated Test Product',
      price: 1500
    };
    
    const updateResponse = await axios.put(`${API_URL}/api/admin/products/${createResponse.data.id}`, updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Update product successful');
    
    // Test delete product
    await axios.delete(`${API_URL}/api/admin/products/${createResponse.data.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Delete product successful');
    
    console.log('\n🎉 All admin product tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAdminProducts();