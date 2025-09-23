// Security and Monitoring Testing Script
const axios = require('axios');
const https = require('https');

const API_BASE = process.env.API_URL || 'https://householdplanetkenya.co.ke';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://householdplanetkenya.co.ke';

async function testSSLCertificate() {
  console.log('🔄 Testing SSL Certificate...');
  
  try {
    const response = await axios.get(FRONTEND_URL);
    console.log('✅ SSL Certificate: Valid and working');
    
    // Check HTTPS redirect
    const httpResponse = await axios.get(FRONTEND_URL.replace('https://', 'http://'), {
      maxRedirects: 0,
      validateStatus: (status) => status === 301 || status === 302
    });
    
    if (httpResponse.status === 301 || httpResponse.status === 302) {
      console.log('✅ HTTPS Redirect: Working');
    }
    
  } catch (error) {
    if (error.response && (error.response.status === 301 || error.response.status === 302)) {
      console.log('✅ HTTPS Redirect: Working');
    } else {
      console.log('❌ SSL Certificate: Failed', error.message);
    }
  }
}

async function testSecurityHeaders() {
  console.log('🔄 Testing Security Headers...');
  
  try {
    const response = await axios.get(FRONTEND_URL);
    const headers = response.headers;
    
    const securityHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'x-xss-protection',
      'referrer-policy',
      'strict-transport-security'
    ];
    
    securityHeaders.forEach(header => {
      if (headers[header]) {
        console.log(`✅ ${header}: ${headers[header]}`);
      } else {
        console.log(`❌ ${header}: Missing`);
      }
    });
    
  } catch (error) {
    console.log('❌ Security Headers: Failed', error.message);
  }
}

async function testRateLimiting() {
  console.log('🔄 Testing Rate Limiting...');
  
  const requests = [];
  for (let i = 0; i < 20; i++) {
    requests.push(axios.get(`${API_BASE}/api/products`));
  }
  
  try {
    const responses = await Promise.allSettled(requests);
    const rateLimited = responses.some(r => 
      r.status === 'rejected' && 
      r.reason.response && 
      r.reason.response.status === 429
    );
    
    if (rateLimited) {
      console.log('✅ Rate Limiting: Active');
    } else {
      console.log('⚠️ Rate Limiting: Not detected (may need higher load)');
    }
    
  } catch (error) {
    console.log('❌ Rate Limiting: Test failed', error.message);
  }
}

async function testCORSPolicy() {
  console.log('🔄 Testing CORS Policy...');
  
  try {
    const response = await axios.options(`${API_BASE}/api/products`, {
      headers: {
        'Origin': 'https://malicious-site.com',
        'Access-Control-Request-Method': 'GET'
      }
    });
    
    const corsHeader = response.headers['access-control-allow-origin'];
    if (corsHeader === FRONTEND_URL || corsHeader === 'https://householdplanetkenya.co.ke') {
      console.log('✅ CORS Policy: Properly configured');
    } else {
      console.log('⚠️ CORS Policy: May be too permissive');
    }
    
  } catch (error) {
    console.log('✅ CORS Policy: Blocking unauthorized origins');
  }
}

async function testMonitoringEndpoints() {
  console.log('🔄 Testing Monitoring Endpoints...');
  
  const endpoints = [
    { url: `${API_BASE}/health`, name: 'Health Check' },
    { url: `${API_BASE}/api/status`, name: 'API Status' },
    { url: `${API_BASE}/metrics`, name: 'Metrics' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint.url);
      if (response.status === 200) {
        console.log(`✅ ${endpoint.name}: Working`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Failed`, error.message);
    }
  }
}

async function testBackupSystems() {
  console.log('🔄 Testing Backup Systems...');
  
  try {
    // Test backup endpoint
    const response = await axios.post(`${API_BASE}/api/admin/backup/test`, {}, {
      headers: { 'Authorization': 'Bearer admin_token' }
    });
    
    if (response.status === 200) {
      console.log('✅ Backup Systems: Working');
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Backup Systems: Protected (authentication required)');
    } else {
      console.log('❌ Backup Systems: Failed', error.message);
    }
  }
}

async function testErrorHandling() {
  console.log('🔄 Testing Error Handling...');
  
  const errorTests = [
    { url: `${API_BASE}/api/nonexistent`, expectedStatus: 404, name: '404 Errors' },
    { url: `${API_BASE}/api/products/invalid-id`, expectedStatus: 400, name: '400 Errors' },
    { url: `${API_BASE}/api/admin/users`, expectedStatus: 401, name: '401 Errors' }
  ];
  
  for (const test of errorTests) {
    try {
      await axios.get(test.url);
      console.log(`❌ ${test.name}: Not properly handled`);
    } catch (error) {
      if (error.response && error.response.status === test.expectedStatus) {
        console.log(`✅ ${test.name}: Properly handled`);
      } else {
        console.log(`⚠️ ${test.name}: Unexpected response`);
      }
    }
  }
}

async function testCDNDelivery() {
  console.log('🔄 Testing CDN Delivery...');
  
  try {
    const response = await axios.get(`${FRONTEND_URL}/_next/static/css/app.css`);
    const cdnHeaders = response.headers;
    
    if (cdnHeaders['cf-ray'] || cdnHeaders['x-cache'] || cdnHeaders['server'] === 'cloudflare') {
      console.log('✅ CDN: Active (Cloudflare detected)');
    } else if (cdnHeaders['x-vercel-cache']) {
      console.log('✅ CDN: Active (Vercel Edge Network)');
    } else {
      console.log('⚠️ CDN: Not detected in headers');
    }
    
    // Test cache headers
    if (cdnHeaders['cache-control']) {
      console.log(`✅ Cache Headers: ${cdnHeaders['cache-control']}`);
    }
    
  } catch (error) {
    console.log('❌ CDN Testing: Failed', error.message);
  }
}

// Run all security and monitoring tests
(async () => {
  await testSSLCertificate();
  await testSecurityHeaders();
  await testRateLimiting();
  await testCORSPolicy();
  await testMonitoringEndpoints();
  await testBackupSystems();
  await testErrorHandling();
  await testCDNDelivery();
})();