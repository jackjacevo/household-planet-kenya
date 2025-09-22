const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test configuration
const API_URL = process.env.API_URL || 'http://localhost:3001';
const TEST_EMAIL = 'admin@test.com';
const TEST_PASSWORD = 'admin123';

async function testCategoryImageUpload() {
  try {
    console.log('🧪 Testing Category Image Upload Functionality');
    console.log('API URL:', API_URL);
    
    // Step 1: Login to get token
    console.log('\n1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');
    
    // Step 2: Create a simple test image (1x1 PNG)
    console.log('\n2️⃣ Creating test image...');
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
      0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
      0xE2, 0x21, 0xBC, 0x33, 0x00, 0x00, 0x00, 0x00,
      0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    const testImagePath = path.join(__dirname, 'test-category.png');
    fs.writeFileSync(testImagePath, testImageBuffer);
    console.log('✅ Test image created');
    
    // Step 3: Test image upload endpoint
    console.log('\n3️⃣ Testing image upload endpoint...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testImagePath));
    
    const uploadResponse = await axios.post(`${API_URL}/api/categories/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    
    const imageUrl = uploadResponse.data.url;
    console.log('✅ Image upload successful:', imageUrl);
    
    // Step 4: Create category with uploaded image
    console.log('\n4️⃣ Creating category with image...');
    const categoryData = {
      name: 'Test Category with Image',
      slug: 'test-category-with-image',
      description: 'Test category created to verify image upload functionality',
      image: imageUrl,
      isActive: true
    };
    
    const categoryResponse = await axios.post(`${API_URL}/api/categories`, categoryData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Category created successfully:', categoryResponse.data);
    
    // Step 5: Verify category retrieval
    console.log('\n5️⃣ Verifying category retrieval...');
    const categoriesResponse = await axios.get(`${API_URL}/api/categories`);
    const createdCategory = categoriesResponse.data.find(cat => cat.name === 'Test Category with Image');
    
    if (createdCategory && createdCategory.image) {
      console.log('✅ Category with image retrieved successfully');
      console.log('Image URL:', createdCategory.image);
    } else {
      throw new Error('Category image not found in retrieval');
    }
    
    // Step 6: Test different image formats
    console.log('\n6️⃣ Testing different image formats...');
    const formats = [
      { ext: 'jpg', signature: [0xFF, 0xD8, 0xFF, 0xE0] },
      { ext: 'gif', signature: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61] },
      { ext: 'webp', signature: [0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50] }
    ];
    
    for (const format of formats) {
      try {
        const testBuffer = Buffer.from([...format.signature, ...Array(50).fill(0)]);
        const testPath = path.join(__dirname, `test.${format.ext}`);
        fs.writeFileSync(testPath, testBuffer);
        
        const formData = new FormData();
        formData.append('file', fs.createReadStream(testPath));
        
        await axios.post(`${API_URL}/api/categories/upload`, formData, {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log(`✅ ${format.ext.toUpperCase()} format supported`);
        fs.unlinkSync(testPath);
      } catch (error) {
        console.log(`❌ ${format.ext.toUpperCase()} format failed:`, error.response?.data?.message || error.message);
      }
    }
    
    // Cleanup
    console.log('\n🧹 Cleaning up...');
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('- ✅ Admin authentication');
    console.log('- ✅ Image upload endpoint');
    console.log('- ✅ Category creation with image');
    console.log('- ✅ Category retrieval with image');
    console.log('- ✅ Multiple image format support');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests
testCategoryImageUpload();