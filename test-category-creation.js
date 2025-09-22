const axios = require('axios');

async function createSampleCategory() {
  try {
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
      email: 'householdplanet819@gmail.com',
      password: 'Admin@2025'
    });
    
    console.log('📋 Login response:', JSON.stringify(loginResponse.data, null, 2));
    const token = loginResponse.data.access_token || loginResponse.data.token || loginResponse.data.accessToken;
    console.log('🔑 Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.error('❌ No token found in response');
      return;
    }
    
    console.log('✅ Login successful');
    
    // Create sample image as base64 (small test image)
    const sampleImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    console.log('📝 Creating sample category...');
    const categoryResponse = await axios.post(
      'https://api.householdplanetkenya.co.ke/api/categories',
      {
        name: 'Test Sample Category',
        slug: 'test-sample-category',
        description: 'A sample category created for testing image upload functionality',
        image: sampleImageBase64,
        isActive: true
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Sample category created successfully!');
    console.log('🏷️ Category ID:', categoryResponse.data.id);
    console.log('📛 Category Name:', categoryResponse.data.name);
    console.log('🖼️ Has Image:', categoryResponse.data.image ? 'Yes' : 'No');
    console.log('🔗 View at: https://householdplanetkenya.co.ke/admin/categories');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

createSampleCategory();