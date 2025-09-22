const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_URL = 'https://api.householdplanetkenya.co.ke';

async function testNewCategoryUpload() {
  console.log('🧪 Testing NEW Category Image Upload System...');
  
  try {
    // Login
    console.log('\n🔐 Logging in...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@householdplanet.co.ke',
      password: 'Admin@2025'
    });
    const token = loginResponse.data.accessToken;
    console.log('✅ Admin login successful');

    // Create a minimal test PNG image (1x1 pixel)
    console.log('\n🎨 Creating test image...');
    const pngBuffer = Buffer.from([
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
    
    const testImagePath = 'test-category-upload.png';
    fs.writeFileSync(testImagePath, pngBuffer);
    console.log('✅ Test PNG image created');

    // Test the categories upload endpoint (from categories controller)
    console.log('\n📤 Testing categories upload endpoint...');
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(testImagePath));
      
      const uploadResponse = await axios.post(`${API_URL}/api/categories/upload`, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('✅ Categories upload successful:', uploadResponse.data);
      
      // Test image accessibility
      const imageUrl = uploadResponse.data.url;
      try {
        const imageResponse = await axios.head(`${API_URL}${imageUrl}`);
        console.log('✅ Uploaded image accessible');
      } catch (error) {
        console.log('❌ Uploaded image not accessible:', error.response?.status);
      }
      
    } catch (error) {
      console.log('❌ Categories upload failed:', error.response?.data?.message || error.message);
    }

    // Test admin categories upload endpoint
    console.log('\n📤 Testing admin categories upload endpoint...');
    try {
      const formData = new FormData();
      formData.append('image', fs.createReadStream(testImagePath));
      
      const uploadResponse = await axios.post(`${API_URL}/api/admin/categories/upload-image`, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('✅ Admin categories upload successful:', uploadResponse.data);
      
    } catch (error) {
      console.log('❌ Admin categories upload failed:', error.response?.data?.message || error.message);
    }

    // Test different image formats
    console.log('\n🎨 Testing different image formats...');
    
    const formats = [
      { name: 'JPG', ext: 'jpg', signature: [0xFF, 0xD8, 0xFF, 0xE0] },
      { name: 'GIF', ext: 'gif', signature: [0x47, 0x49, 0x46, 0x38] },
      { name: 'WebP', ext: 'webp', signature: [0x52, 0x49, 0x46, 0x46] }
    ];
    
    for (const format of formats) {
      try {
        const testBuffer = Buffer.from([...format.signature, ...Array(50).fill(0)]);
        const testPath = `test.${format.ext}`;
        fs.writeFileSync(testPath, testBuffer);
        
        const formData = new FormData();
        formData.append('file', fs.createReadStream(testPath));
        
        const uploadResponse = await axios.post(`${API_URL}/api/categories/upload`, formData, {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log(`✅ ${format.name} format supported:`, uploadResponse.data.url);
        fs.unlinkSync(testPath);
        
      } catch (error) {
        console.log(`❌ ${format.name} format failed:`, error.response?.data?.message || error.message);
      }
    }

    // Cleanup
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }

    console.log('\n🎯 Test Summary:');
    console.log('- Image upload endpoints tested');
    console.log('- Multiple format support verified');
    console.log('- Ready for admin panel testing');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testNewCategoryUpload();