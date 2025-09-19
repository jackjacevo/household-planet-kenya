const axios = require('axios');

const API_BASE = 'https://api.householdplanetkenya.co.ke';

async function debugAuthIssue() {
  console.log('🔍 Debugging authentication issues...\n');

  // 1. Check if backend is responding
  try {
    const healthCheck = await axios.get(`${API_BASE}/api/health`);
    console.log('✅ Backend is responding:', healthCheck.status);
  } catch (error) {
    console.log('❌ Backend health check failed:', error.message);
    return;
  }

  // 2. Test login endpoint
  try {
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin123!@#'
    });
    
    console.log('✅ Login successful');
    const token = loginResponse.data.access_token;
    
    // 3. Test admin dashboard with token
    try {
      const dashboardResponse = await axios.get(`${API_BASE}/api/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Admin dashboard accessible');
    } catch (dashError) {
      console.log('❌ Admin dashboard failed:', dashError.response?.status, dashError.response?.data);
      
      // Check user role
      try {
        const profileResponse = await axios.get(`${API_BASE}/api/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('👤 User role:', profileResponse.data.role);
      } catch (profileError) {
        console.log('❌ Profile check failed:', profileError.message);
      }
    }
    
  } catch (loginError) {
    console.log('❌ Login failed:', loginError.response?.status, loginError.response?.data);
  }
}

debugAuthIssue().catch(console.error);