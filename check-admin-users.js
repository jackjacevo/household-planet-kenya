const axios = require('axios');

const API_BASE = 'https://api.householdplanetkenya.co.ke';

async function checkAdminUsers() {
  console.log('🔍 Checking admin users...\n');

  // Try different admin credentials
  const adminCredentials = [
    { email: 'admin@householdplanetkenya.co.ke', password: 'Admin123!@#' },
    { email: 'admin@example.com', password: 'admin123' },
    { email: 'admin@admin.com', password: 'password' },
    { email: 'test@admin.com', password: 'admin123' }
  ];

  for (const creds of adminCredentials) {
    try {
      console.log(`Testing: ${creds.email}`);
      const response = await axios.post(`${API_BASE}/api/auth/login`, creds);
      
      if (response.data.access_token) {
        console.log(`✅ Login successful for ${creds.email}`);
        
        // Check user role
        const profileResponse = await axios.get(`${API_BASE}/api/auth/profile`, {
          headers: { 'Authorization': `Bearer ${response.data.access_token}` }
        });
        
        console.log(`👤 Role: ${profileResponse.data.role}`);
        console.log(`📧 Email: ${profileResponse.data.email}`);
        console.log(`🔑 Token: ${response.data.access_token.substring(0, 20)}...`);
        break;
      }
    } catch (error) {
      console.log(`❌ Failed for ${creds.email}: ${error.response?.data?.message || error.message}`);
    }
  }
}

checkAdminUsers().catch(console.error);