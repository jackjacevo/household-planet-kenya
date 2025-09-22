const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUploadEndpoints() {
  try {
    console.log('🧪 Testing upload endpoints...');
    
    // Login as admin
    console.log('🔐 Logging in as admin...');
    const loginResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
      email: 'admin@householdplanet.co.ke',
      password: 'Admin@2025'
    });
    
    const token = loginResponse.data.accessToken;
    const headers = { 'Authorization': `Bearer ${token}` };
    
    console.log('✅ Login successful');
    
    // Create a test image file
    const testImagePath = 'test-image.png';
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,  // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,  // 1x1 pixels
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,  // Bit depth, color type, etc.
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,  // IDAT chunk
      0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
      0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42,  // IEND chunk
      0x60, 0x82
    ]);
    
    fs.writeFileSync(testImagePath, testImageBuffer);
    
    // Test temp image upload endpoint
    console.log('\n📤 Testing temp image upload endpoint...');
    
    const formData1 = new FormData();
    formData1.append('images', fs.createReadStream(testImagePath), 'test.png');
    
    try {
      const tempUploadResponse = await axios.post(
        'https://api.householdplanetkenya.co.ke/api/admin/products/temp/images',
        formData1,
        {
          headers: {
            ...headers,
            ...formData1.getHeaders()
          }
        }
      );
      
      console.log('✅ Temp image upload successful:', tempUploadResponse.data);
    } catch (tempError) {
      console.log('❌ Temp image upload failed:', tempError.response?.data || tempError.message);
    }
    
    // Test product image upload endpoint
    console.log('\n📦 Testing product image upload endpoint...');
    
    const formData2 = new FormData();
    formData2.append('file', fs.createReadStream(testImagePath), 'test.png');
    
    try {
      const productUploadResponse = await axios.post(
        'https://api.householdplanetkenya.co.ke/api/upload/product',
        formData2,
        {
          headers: {
            ...headers,
            ...formData2.getHeaders()
          }
        }
      );
      
      console.log('✅ Product image upload successful:', productUploadResponse.data);
    } catch (productError) {
      console.log('❌ Product image upload failed:', productError.response?.data || productError.message);
    }
    
    // Test category image upload endpoint
    console.log('\n🏷️ Testing category image upload endpoint...');
    
    const formData3 = new FormData();
    formData3.append('image', fs.createReadStream(testImagePath), 'test.png');
    
    try {
      const categoryUploadResponse = await axios.post(
        'https://api.householdplanetkenya.co.ke/api/admin/categories/upload-image',
        formData3,
        {
          headers: {
            ...headers,
            ...formData3.getHeaders()
          }
        }
      );
      
      console.log('✅ Category image upload successful:', categoryUploadResponse.data);
    } catch (categoryError) {
      console.log('❌ Category image upload failed:', categoryError.response?.data || categoryError.message);
    }
    
    // Clean up test file
    fs.unlinkSync(testImagePath);
    
    console.log('\n🎉 Upload endpoint testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testUploadEndpoints();
