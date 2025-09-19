const axios = require('axios');

const API_BASE = 'https://api.householdplanetkenya.co.ke';

async function testAdminDashboard() {
  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'householdplanet819@gmail.com',
      password: 'Admin@2025'
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');

    // Test all admin endpoints
    const endpoints = [
      '/api/admin/dashboard',
      '/api/admin/products',
      '/api/admin/categories', 
      '/api/admin/inventory/alerts',
      '/api/admin/activities',
      '/api/admin/activities/stats',
      '/api/orders/whatsapp/pending',
      '/api/orders/whatsapp/orders',
      '/api/analytics/whatsapp-inquiries',
      '/api/payments/admin/transactions?page=1&limit=50',
      '/api/payments/admin/stats',
      '/api/admin/staff',
      '/api/admin/delivery-locations',
      '/api/settings',
      '/api/settings/public'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${API_BASE}${endpoint}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`✅ ${endpoint} - ${response.status}`);
      } catch (error) {
        console.log(`❌ ${endpoint} - ${error.response?.status} ${error.response?.data?.message || ''}`);
      }
    }

  } catch (error) {
    console.log('❌ Login failed:', error.response?.data);
  }
}

testAdminDashboard();