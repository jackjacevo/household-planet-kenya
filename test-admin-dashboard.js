#!/usr/bin/env node

const axios = require('axios');

async function testAdminDashboard() {
  console.log('🔧 Testing Admin Dashboard Pages...\n');
  
  const BASE_URL = 'https://householdplanetkenya.co.ke';
  const adminPages = [
    '/admin',
    '/admin/login',
    '/admin/dashboard',
    '/admin/products',
    '/admin/categories',
    '/admin/orders',
    '/admin/customers',
    '/admin/delivery',
    '/admin/settings',
    '/admin/analytics',
    '/admin/staff'
  ];

  let passed = 0;
  let total = adminPages.length;

  for (const page of adminPages) {
    try {
      const response = await axios.get(`${BASE_URL}${page}`, { 
        timeout: 10000,
        validateStatus: (status) => status < 500 // Accept redirects and auth errors
      });
      
      if (response.status === 200) {
        console.log(`✅ ${page}: ${response.status} (Accessible)`);
        passed++;
      } else if (response.status === 401 || response.status === 403) {
        console.log(`🔒 ${page}: ${response.status} (Auth Required - Normal)`);
        passed++;
      } else if (response.status === 302 || response.status === 307) {
        console.log(`↩️ ${page}: ${response.status} (Redirect - Normal)`);
        passed++;
      } else {
        console.log(`⚠️ ${page}: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${page}: ${error.response?.status || error.message}`);
    }
  }

  console.log(`\n📊 Admin Dashboard Results:`);
  console.log(`✅ Working: ${passed}/${total}`);
  console.log(`📈 Success Rate: ${Math.round((passed/total)*100)}%`);
  
  if (passed >= total * 0.8) {
    console.log('\n🎉 Admin Dashboard is operational!');
    console.log(`🔗 Access: ${BASE_URL}/admin`);
  } else {
    console.log('\n⚠️ Admin Dashboard needs attention');
  }
}

testAdminDashboard().catch(console.error);