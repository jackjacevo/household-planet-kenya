const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testAdminLoginLogging() {
  console.log('🔍 Testing Admin Login Activity Logging...\n');

  try {
    // Test admin login
    console.log('1. Testing admin login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'jack@householdplanetkenya.co.ke',
      password: 'Admin123!'
    }, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        'Content-Type': 'application/json'
      }
    });

    if (loginResponse.data.accessToken) {
      console.log('✅ Admin login successful');
      console.log(`   User: ${loginResponse.data.user.name} (${loginResponse.data.user.role})`);
      
      const token = loginResponse.data.accessToken;

      // Wait a moment for activity to be logged
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check admin activities
      console.log('\n2. Checking admin activities...');
      const activitiesResponse = await axios.get(`${API_BASE}/admin/activities?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ Found ${activitiesResponse.data.data.length} recent activities`);
      
      // Look for login activity
      const loginActivity = activitiesResponse.data.data.find(activity => 
        activity.action === 'USER_LOGIN' && 
        activity.userId === loginResponse.data.user.id
      );

      if (loginActivity) {
        console.log('✅ Login activity found in admin log:');
        console.log(`   Action: ${loginActivity.action}`);
        console.log(`   User: ${loginActivity.user.name} (${loginActivity.user.role})`);
        console.log(`   Time: ${loginActivity.createdAt}`);
        console.log(`   Details: ${JSON.stringify(loginActivity.details, null, 2)}`);
      } else {
        console.log('❌ Login activity NOT found in admin log');
        console.log('Recent activities:');
        activitiesResponse.data.data.slice(0, 3).forEach(activity => {
          console.log(`   - ${activity.action} by ${activity.user?.name || 'Unknown'} at ${activity.createdAt}`);
        });
      }

      // Test logout logging
      console.log('\n3. Testing admin logout...');
      const logoutResponse = await axios.post(`${API_BASE}/auth/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (logoutResponse.data.message) {
        console.log('✅ Admin logout successful');
        
        // Wait a moment for activity to be logged
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check for logout activity
        const activitiesResponse2 = await axios.get(`${API_BASE}/admin/activities?limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const logoutActivity = activitiesResponse2.data.data.find(activity => 
          activity.action === 'USER_LOGOUT' && 
          activity.userId === loginResponse.data.user.id
        );

        if (logoutActivity) {
          console.log('✅ Logout activity found in admin log:');
          console.log(`   Action: ${logoutActivity.action}`);
          console.log(`   User: ${logoutActivity.user.name} (${logoutActivity.user.role})`);
          console.log(`   Time: ${logoutActivity.createdAt}`);
        } else {
          console.log('❌ Logout activity NOT found in admin log');
        }
      }

    } else {
      console.log('❌ Admin login failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testAdminLoginLogging();