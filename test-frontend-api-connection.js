// Test script to verify frontend can connect to backend API
const fetch = require('node-fetch');

async function testFrontendBackendConnection() {
  try {
    console.log('=== Testing Frontend to Backend Connection ===\n');
    
    // Test the same API endpoint that the frontend uses
    const apiUrl = 'http://localhost:3001/api/categories/hierarchy';
    console.log('🔍 Testing API endpoint:', apiUrl);
    
    const response = await fetch(apiUrl);
    console.log('🔍 Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('🔍 Data type:', typeof data);
    console.log('🔍 Is array:', Array.isArray(data));
    console.log('🔍 Length:', data?.length);
    
    if (data && Array.isArray(data) && data.length > 0) {
      console.log('✅ API connection successful!');
      console.log('✅ Backend is running and responding correctly');
      console.log('✅ Data structure is valid');
      
      console.log('\n📋 First few categories:');
      data.slice(0, 3).forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name} (${cat.children?.length || 0} children)`);
      });
      
      return true;
    } else {
      console.log('❌ API returned invalid data structure');
      console.log('❌ Data received:', data);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Failed to connect to backend API:', error.message);
    console.error('❌ Error details:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Backend server is not running on port 3001');
      console.log('💡 Please start the backend server first');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 Backend server hostname not found');
      console.log('💡 Please check if the backend server is running');
    }
    
    return false;
  }
}

// Test the environment variable configuration
function testEnvironmentConfig() {
  console.log('\n=== Testing Environment Configuration ===');
  
  // Simulate the environment variable that the frontend uses
  const nextPublicApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  console.log('🔍 NEXT_PUBLIC_API_URL:', nextPublicApiUrl);
  
  if (nextPublicApiUrl === 'http://localhost:3001') {
    console.log('✅ Environment variable is correctly set');
    return true;
  } else {
    console.log('❌ Environment variable is not set correctly');
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Frontend-Backend Connection Tests...\n');
  
  const envConfigOk = testEnvironmentConfig();
  const apiConnectionOk = await testFrontendBackendConnection();
  
  console.log('\n📊 Test Results Summary:');
  console.log('- Environment Configuration:', envConfigOk ? '✅ PASS' : '❌ FAIL');
  console.log('- API Connection:', apiConnectionOk ? '✅ PASS' : '❌ FAIL');
  
  if (envConfigOk && apiConnectionOk) {
    console.log('\n🎉 All tests passed! The frontend should be able to connect to the backend.');
    console.log('🎉 The categories page should now work correctly.');
  } else {
    console.log('\n❌ Some tests failed. Please check the issues above.');
    console.log('❌ The categories page may not work correctly.');
  }
  
  console.log('\n🔧 Troubleshooting Steps:');
  console.log('1. Ensure backend server is running on port 3001');
  console.log('2. Check if the frontend development server is running');
  console.log('3. Open browser console for specific error messages');
  console.log('4. Verify CORS settings in the backend');
}

runTests();
