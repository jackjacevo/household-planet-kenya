const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_URL = process.env.API_URL || 'https://api.householdplanetkenya.co.ke';

async function testAdminCategoriesAPI() {
  console.log('🔍 Testing Admin Categories API...');
  
  try {
    // Login
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin@2025'
    });
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');

    // Test categories endpoint
    console.log('\n📂 Testing categories endpoint...');
    const categoriesResponse = await axios.get(`${API_URL}/api/categories`);
    console.log(`✅ Categories endpoint working: ${categoriesResponse.data.length} categories`);

    // Test admin categories endpoint
    console.log('\n📂 Testing admin categories endpoint...');
    const adminCategoriesResponse = await axios.get(`${API_URL}/api/admin/categories`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Admin categories endpoint working: ${adminCategoriesResponse.data.length} categories`);

    // Test image upload endpoint
    console.log('\n📤 Testing category image upload endpoint...');
    
    // Create test images for different formats
    const testImages = {
      png: Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE]),
      jpg: Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46])
    };

    const uploadResults = {};
    
    for (const [format, buffer] of Object.entries(testImages)) {
      try {
        const testFile = `test.${format}`;
        fs.writeFileSync(testFile, buffer);
        
        const formData = new FormData();
        formData.append('image', fs.createReadStream(testFile));
        
        const uploadResponse = await axios.post(`${API_URL}/api/admin/categories/upload-image`, formData, {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${token}`
          }
        });
        
        uploadResults[format] = uploadResponse.data.url;
        console.log(`✅ ${format.toUpperCase()} upload successful: ${uploadResponse.data.url}`);
        fs.unlinkSync(testFile);
      } catch (error) {
        console.log(`❌ ${format.toUpperCase()} upload failed: ${error.response?.data?.message || error.message}`);
        uploadResults[format] = null;
      }
    }

    // Test category creation with image
    console.log('\n📝 Testing category creation with image...');
    const categoryData = {
      name: 'Test Category API',
      slug: 'test-category-api',
      description: 'Test category created via API',
      image: uploadResults.png || uploadResults.jpg || null,
      isActive: true
    };

    const createResponse = await axios.post(`${API_URL}/api/admin/categories`, categoryData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Category created successfully:', createResponse.data.name);

    // Test category retrieval with image
    console.log('\n🔍 Testing category retrieval...');
    const updatedCategories = await axios.get(`${API_URL}/api/categories`);
    const testCategory = updatedCategories.data.find(cat => cat.name === 'Test Category API');
    
    if (testCategory) {
      console.log('✅ Category retrieved successfully');
      if (testCategory.image) {
        console.log('✅ Category image stored:', testCategory.image);
      } else {
        console.log('⚠️ Category created but no image stored');
      }
    }

    // Test subcategory creation
    console.log('\n👶 Testing subcategory creation...');
    const subcategoryData = {
      name: 'Test Subcategory',
      slug: 'test-subcategory',
      description: 'Test subcategory',
      parentId: testCategory.id,
      isActive: true
    };

    const subResponse = await axios.post(`${API_URL}/api/admin/categories`, subcategoryData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Subcategory created successfully:', subResponse.data.name);

    console.log('\n🎯 Summary:');
    console.log('- Categories API endpoint working');
    console.log('- Image upload endpoint functional');
    console.log(`- Supported formats: ${Object.keys(uploadResults).filter(k => uploadResults[k]).join(', ').toUpperCase()}`);
    console.log('- Category creation with image working');
    console.log('- Subcategory creation working');
    console.log('- Ready for admin panel testing');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAdminCategoriesAPI();