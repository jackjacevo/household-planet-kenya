const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_BASE = 'https://householdplanetkenya.co.ke/api';

// Test credentials - replace with actual admin credentials
const TEST_ADMIN = {
  email: 'admin@householdplanetkenya.co.ke',
  password: 'your-admin-password'
};

async function testImageUploadAPIs() {
  console.log('🧪 Testing Image Upload APIs in Production...\n');
  
  try {
    // 1. Login to get token
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, TEST_ADMIN);
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    };

    // 2. Test Category Image Upload
    console.log('2️⃣ Testing Category Image Upload...');
    const categoryFormData = new FormData();
    
    // Create a test image buffer (1x1 PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5C, 0xC2, 0x5D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    categoryFormData.append('file', testImageBuffer, {
      filename: 'test-category.png',
      contentType: 'image/png'
    });

    try {
      const categoryUploadResponse = await axios.post(
        `${API_BASE}/upload/category`,
        categoryFormData,
        { headers: { ...headers, ...categoryFormData.getHeaders() } }
      );
      console.log('✅ Category upload response:', categoryUploadResponse.data);
    } catch (error) {
      console.log('❌ Category upload failed:', error.response?.data || error.message);
    }

    // 3. Test Product Images Upload
    console.log('\n3️⃣ Testing Product Images Upload...');
    const productFormData = new FormData();
    productFormData.append('images', testImageBuffer, {
      filename: 'test-product1.png',
      contentType: 'image/png'
    });
    productFormData.append('images', testImageBuffer, {
      filename: 'test-product2.png',
      contentType: 'image/png'
    });

    try {
      const productUploadResponse = await axios.post(
        `${API_BASE}/upload/products`,
        productFormData,
        { headers: { ...headers, ...productFormData.getHeaders() } }
      );
      console.log('✅ Product upload response:', productUploadResponse.data);
    } catch (error) {
      console.log('❌ Product upload failed:', error.response?.data || error.message);
    }

    // 4. Test Admin Temp Images Upload
    console.log('\n4️⃣ Testing Admin Temp Images Upload...');
    const tempFormData = new FormData();
    tempFormData.append('images', testImageBuffer, {
      filename: 'test-temp.png',
      contentType: 'image/png'
    });

    try {
      const tempUploadResponse = await axios.post(
        `${API_BASE}/admin/products/temp/images`,
        tempFormData,
        { headers: { ...headers, ...tempFormData.getHeaders() } }
      );
      console.log('✅ Temp upload response:', tempUploadResponse.data);
    } catch (error) {
      console.log('❌ Temp upload failed:', error.response?.data || error.message);
    }

    // 5. Test Category Creation with Image
    console.log('\n5️⃣ Testing Category Creation...');
    try {
      const categoryData = {
        name: 'Test Category',
        description: 'Test category description',
        image: '/uploads/categories/test-category.png'
      };
      
      const categoryResponse = await axios.post(
        `${API_BASE}/admin/categories`,
        categoryData,
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      console.log('✅ Category creation response:', categoryResponse.data);
    } catch (error) {
      console.log('❌ Category creation failed:', error.response?.data || error.message);
    }

    // 6. Test Product Creation with Images
    console.log('\n6️⃣ Testing Product Creation...');
    try {
      const productData = {
        name: 'Test Product',
        description: 'Test product description',
        price: 1000,
        categoryId: 1,
        images: ['/uploads/products/test-product1.png', '/uploads/products/test-product2.png'],
        stock: 10
      };
      
      const productResponse = await axios.post(
        `${API_BASE}/admin/products`,
        productData,
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      console.log('✅ Product creation response:', productResponse.data);
    } catch (error) {
      console.log('❌ Product creation failed:', error.response?.data || error.message);
    }

    console.log('\n🎉 Image upload API testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testImageUploadAPIs();