const axios = require('axios');

async function testAdminActivityLogging() {
  try {
    console.log('🔍 Testing comprehensive admin activity logging...\n');
    
    // Login as admin
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'admin@householdplanet.co.ke',
      password: 'Admin@2024!'
    });
    
    const token = loginResponse.data.access_token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('✅ Admin login successful\n');
    
    // Test 1: Create Category
    console.log('📁 Testing category creation...');
    const categoryResponse = await axios.post(
      'http://localhost:3001/admin/categories',
      {
        name: 'Test Activity Category',
        description: 'Category for testing activity logging',
        isActive: true
      },
      { headers }
    );
    console.log('✅ Category created:', categoryResponse.data.name);
    
    // Test 2: Create Product
    console.log('\n📦 Testing product creation...');
    const productResponse = await axios.post(
      'http://localhost:3001/admin/products',
      {
        name: 'Test Activity Product',
        description: 'Product for testing activity logging',
        sku: 'TEST-ACTIVITY-001',
        price: 1000,
        categoryId: categoryResponse.data.id,
        stock: 50,
        isActive: true
      },
      { headers }
    );
    console.log('✅ Product created:', productResponse.data.name);
    
    // Test 3: Update Product
    console.log('\n✏️ Testing product update...');
    await axios.put(
      `http://localhost:3001/admin/products/${productResponse.data.id}`,
      {
        name: 'Updated Test Activity Product',
        price: 1200
      },
      { headers }
    );
    console.log('✅ Product updated');
    
    // Test 4: Update Category
    console.log('\n✏️ Testing category update...');
    await axios.put(
      `http://localhost:3001/admin/categories/${categoryResponse.data.id}`,
      {
        name: 'Updated Test Activity Category',
        description: 'Updated description for testing'
      },
      { headers }
    );
    console.log('✅ Category updated');
    
    // Wait for activities to be logged
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check admin activities
    console.log('\n📊 Checking admin activity log...');
    const activitiesResponse = await axios.get(
      'http://localhost:3001/admin/activities?limit=20',
      { headers }
    );
    
    const activities = activitiesResponse.data.data;
    console.log(`Found ${activities.length} recent activities\n`);
    
    // Check for specific activities
    const expectedActivities = [
      'CREATE_CATEGORY',
      'CREATE_PRODUCT', 
      'UPDATE_PRODUCT',
      'UPDATE_CATEGORY'
    ];
    
    const foundActivities = new Set();
    
    activities.forEach(activity => {
      if (expectedActivities.includes(activity.action)) {
        foundActivities.add(activity.action);
        console.log(`✅ ${activity.action}: ${activity.details.categoryName || activity.details.productName || 'N/A'} by ${activity.user.name}`);
      }
    });
    
    // Check if all expected activities were logged
    const missingActivities = expectedActivities.filter(action => !foundActivities.has(action));
    
    if (missingActivities.length === 0) {
      console.log('\n🎉 SUCCESS: All admin activities are being logged properly!');
    } else {
      console.log('\n❌ MISSING ACTIVITIES:', missingActivities);
    }
    
    // Cleanup - Delete test data
    console.log('\n🧹 Cleaning up test data...');
    try {
      await axios.delete(`http://localhost:3001/admin/products/${productResponse.data.id}`, { headers });
      await axios.delete(`http://localhost:3001/admin/categories/${categoryResponse.data.id}`, { headers });
      console.log('✅ Test data cleaned up');
    } catch (cleanupError) {
      console.log('⚠️ Cleanup warning:', cleanupError.response?.data?.message || cleanupError.message);
    }
    
    // Final activity check
    await new Promise(resolve => setTimeout(resolve, 1000));
    const finalActivitiesResponse = await axios.get(
      'http://localhost:3001/admin/activities?limit=10',
      { headers }
    );
    
    const deleteActivities = finalActivitiesResponse.data.data.filter(
      activity => activity.action === 'DELETE_PRODUCT' || activity.action === 'DELETE_CATEGORY'
    );
    
    console.log(`\n📋 Delete operations logged: ${deleteActivities.length}`);
    deleteActivities.forEach(activity => {
      console.log(`✅ ${activity.action}: ${activity.details.categoryName || activity.details.productName || 'N/A'}`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAdminActivityLogging();