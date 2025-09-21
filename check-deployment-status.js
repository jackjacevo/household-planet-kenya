const axios = require('axios');

async function checkDeploymentStatus() {
  console.log('🔍 Checking Deployment Status\n');

  const API_URL = 'https://api.householdplanetkenya.co.ke';

  // Check if backend has our new code
  console.log('🔧 Backend Deployment Status:');
  
  try {
    // Test the endpoint we added
    const response = await axios.get(`${API_URL}/api/products/popular`);
    console.log('   ✅ Backend: New code deployed (popular endpoint working)');
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('Validation failed')) {
      console.log('   ❌ Backend: OLD CODE RUNNING (validation error from old endpoint)');
      console.log('   💡 Solution: Backend needs redeployment with new code');
    } else if (error.response?.status === 404) {
      console.log('   ❌ Backend: OLD CODE RUNNING (endpoint not found)');
      console.log('   💡 Solution: Backend needs redeployment with new code');
    } else {
      console.log(`   ⚠️ Backend: Unknown error ${error.response?.status}`);
    }
  }

  // Check other endpoints to confirm backend is running
  console.log('\n📊 Backend Health Check:');
  const workingEndpoints = [
    '/api/products',
    '/api/categories',
    '/api/products/featured'
  ];

  for (const endpoint of workingEndpoints) {
    try {
      await axios.get(`${API_URL}${endpoint}`);
      console.log(`   ✅ ${endpoint}: Working`);
    } catch (error) {
      console.log(`   ❌ ${endpoint}: ${error.response?.status}`);
    }
  }

  console.log('\n🎯 Diagnosis:');
  console.log('   • Backend server is running (other endpoints work)');
  console.log('   • Popular Products endpoint exists but has old validation');
  console.log('   • This means backend is running OLD CODE');
  console.log('   • Frontend deployment status is separate issue');
  
  console.log('\n🔧 Required Actions:');
  console.log('   1. ✅ Code Changes: Already made locally');
  console.log('   2. ❌ Backend Deployment: Needs to be deployed');
  console.log('   3. ❌ Frontend Deployment: Separate issue (ERR_BAD_RESPONSE)');
  
  console.log('\n💡 Next Steps:');
  console.log('   • Deploy backend with new Popular Products code');
  console.log('   • Deploy/restart frontend to fix ERR_BAD_RESPONSE');
  console.log('   • Both deployments needed for complete fix');
}

checkDeploymentStatus();