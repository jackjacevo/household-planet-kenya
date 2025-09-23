const axios = require('axios');

const API_URL = 'https://api.householdplanetkenya.co.ke';

async function testCategoryFrontend() {
  console.log('🔍 Testing Category Frontend Integration...');
  
  try {
    // Test public categories endpoint (used by frontend)
    console.log('\n📂 Testing public categories endpoint...');
    const categoriesResponse = await axios.get(`${API_URL}/api/categories`);
    console.log(`✅ Public categories endpoint working: ${categoriesResponse.data.length} categories`);
    
    // Check if categories have images
    const categoriesWithImages = categoriesResponse.data.filter(cat => cat.image);
    console.log(`📸 Categories with images: ${categoriesWithImages.length}`);
    
    if (categoriesWithImages.length > 0) {
      console.log('✅ Sample category with image:', {
        name: categoriesWithImages[0].name,
        image: categoriesWithImages[0].image
      });
    }
    
    // Test image accessibility
    if (categoriesWithImages.length > 0) {
      console.log('\n🖼️ Testing image accessibility...');
      const imageUrl = categoriesWithImages[0].image;
      
      try {
        // Test if image is accessible
        const imageResponse = await axios.head(`${API_URL}${imageUrl}`);
        console.log('✅ Category image accessible:', imageUrl);
        console.log('📊 Image response headers:', {
          'content-type': imageResponse.headers['content-type'],
          'content-length': imageResponse.headers['content-length']
        });
      } catch (error) {
        console.log('❌ Category image not accessible:', error.response?.status || error.message);
      }
    }
    
    // Test login for admin functionality
    console.log('\n🔐 Testing admin login...');
    try {
      const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
        email: 'admin@householdplanetkenya.co.ke',
        password: 'Admin@2025'
      });
      console.log('✅ Admin login successful');
      
      const token = loginResponse.data.access_token;
      
      // Test if we can access admin endpoints
      console.log('\n🔧 Testing admin access...');
      try {
        const dashboardResponse = await axios.get(`${API_URL}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Admin dashboard accessible');
      } catch (error) {
        console.log('❌ Admin dashboard not accessible:', error.response?.data?.message || error.message);
      }
      
    } catch (error) {
      console.log('❌ Admin login failed:', error.response?.data?.message || error.message);
    }
    
    console.log('\n🎯 Frontend Integration Summary:');
    console.log('- ✅ Public categories API working');
    console.log(`- 📸 ${categoriesWithImages.length} categories have images`);
    console.log('- 🔐 Admin authentication tested');
    console.log('- 🎨 Ready for frontend category display');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCategoryFrontend();