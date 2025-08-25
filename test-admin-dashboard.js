// Test script to verify admin dashboard endpoint
const fetch = require('node-fetch');

async function testAdminDashboard() {
  try {
    console.log('=== Testing Admin Dashboard Endpoint ===\n');
    
    // First, let's test if the backend is running
    const healthUrl = 'http://localhost:3001/api/categories/hierarchy';
    console.log('🔍 Testing backend health:', healthUrl);
    
    const healthResponse = await fetch(healthUrl);
    console.log('🔍 Backend health status:', healthResponse.status);
    
    if (!healthResponse.ok) {
      console.log('❌ Backend is not running or not responding');
      return false;
    }
    
    console.log('✅ Backend is running\n');
    
    // Now test the admin dashboard endpoint without authentication
    const dashboardUrl = 'http://localhost:3001/api/admin/dashboard';
    console.log('🔍 Testing admin dashboard endpoint:', dashboardUrl);
    
    const dashboardResponse = await fetch(dashboardUrl);
    console.log('🔍 Dashboard response status:', dashboardResponse.status);
    console.log('🔍 Dashboard response headers:', Object.fromEntries(dashboardResponse.headers));
    
    if (dashboardResponse.status === 401) {
      console.log('⚠️  Dashboard endpoint requires authentication (401 Unauthorized)');
      console.log('⚠️  This is expected behavior - admin endpoints require authentication');
      return true; // This is actually correct behavior
    } else if (dashboardResponse.status === 404) {
      console.log('❌ Dashboard endpoint not found (404)');
      console.log('❌ This indicates a routing issue');
      return false;
    } else if (dashboardResponse.status === 200) {
      console.log('✅ Dashboard endpoint is accessible');
      const data = await dashboardResponse.json();
      console.log('✅ Dashboard data structure:', Object.keys(data));
      return true;
    } else {
      console.log('❌ Unexpected response status:', dashboardResponse.status);
      const text = await dashboardResponse.text();
      console.log('❌ Response body:', text);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Failed to test admin dashboard:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Backend server is not running on port 3001');
      console.log('💡 Please start the backend server first');
    }
    
    return false;
  }
}

async function testWithAuthentication() {
  try {
    console.log('\n=== Testing Admin Dashboard with Authentication ===\n');
    
    // First, try to login as admin
    const loginUrl = 'http://localhost:3001/api/auth/login';
    console.log('🔍 Attempting admin login:', loginUrl);
    
    const loginResponse = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@householdplanet.co.ke',
        password: 'Admin123!@#'
      })
    });
    
    console.log('🔍 Login response status:', loginResponse.status);
    
    if (loginResponse.status === 200) {
      const loginData = await loginResponse.json();
      console.log('✅ Admin login successful');
      
      // Now test dashboard with token
      const dashboardUrl = 'http://localhost:3001/api/admin/dashboard';
      const dashboardResponse = await fetch(dashboardUrl, {
        headers: {
          'Authorization': `Bearer ${loginData.access_token}`
        }
      });
      
      console.log('🔍 Authenticated dashboard response status:', dashboardResponse.status);
      
      if (dashboardResponse.status === 200) {
        const dashboardData = await dashboardResponse.json();
        console.log('✅ Dashboard data retrieved successfully');
        console.log('✅ Dashboard overview:', dashboardData.overview);
        return true;
      } else {
        console.log('❌ Dashboard request failed with authentication');
        const errorText = await dashboardResponse.text();
        console.log('❌ Error response:', errorText);
        return false;
      }
    } else {
      console.log('❌ Admin login failed');
      const errorText = await loginResponse.text();
      console.log('❌ Login error:', errorText);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Admin Dashboard Tests...\n');
  
  const basicTest = await testAdminDashboard();
  const authTest = await testWithAuthentication();
  
  console.log('\n📊 Test Results Summary:');
  console.log('- Basic Endpoint Test:', basicTest ? '✅ PASS' : '❌ FAIL');
  console.log('- Authentication Test:', authTest ? '✅ PASS' : '❌ FAIL');
  
  if (basicTest && authTest) {
    console.log('\n🎉 All tests passed! The admin dashboard should work correctly.');
  } else {
    console.log('\n❌ Some tests failed. Please check the issues above.');
  }
  
  console.log('\n🔧 Troubleshooting Steps:');
  console.log('1. Ensure backend server is running on port 3001');
  console.log('2. Check if admin user exists in database');
  console.log('3. Verify JWT authentication is working');
  console.log('4. Check browser console for specific error messages');
}

runTests();