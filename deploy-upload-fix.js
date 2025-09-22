const axios = require('axios');

async function deployUploadFix() {
  try {
    console.log('🚀 Deploying upload endpoint fix...');
    
    // Test if the backend is responding
    console.log('🔍 Checking backend health...');
    const healthResponse = await axios.get('https://api.householdplanetkenya.co.ke/health');
    console.log('✅ Backend is healthy:', healthResponse.data);
    
    // The upload module has been updated in the code
    // We need to trigger a rebuild/restart of the backend
    console.log('📝 Upload module changes made:');
    console.log('  - Added UploadController to UploadModule');
    console.log('  - Fixed RateLimit decorator');
    console.log('  - Upload endpoints available: /api/upload/category, /api/upload/product');
    
    console.log('⚠️  Backend restart required to pick up changes');
    console.log('💡 Please restart the backend service to enable upload endpoints');
    
    // Test the upload endpoint (will fail until backend is restarted)
    try {
      const testResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/upload/category');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ Upload endpoint not yet available (backend restart needed)');
      } else if (error.response?.status === 405) {
        console.log('✅ Upload endpoint exists (GET not allowed, POST should work)');
      }
    }
    
  } catch (error) {
    console.error('❌ Deployment check failed:', error.message);
  }
}

deployUploadFix();