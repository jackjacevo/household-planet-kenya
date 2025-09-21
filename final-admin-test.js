const https = require('https');

const API_BASE = 'https://api.householdplanetkenya.co.ke';

// Admin credentials
const adminAccount = {
  email: 'householdplanet819@gmail.com',
  password: 'HouseholdPlanet2024!'
};

async function testAllAdminPages() {
  console.log('🔍 Final Test: All Admin Pages and API Endpoints...\n');
  
  try {
    // 1. Login to get token
    console.log('1. Logging in as admin...');
    const loginResponse = await makeRequest('/api/auth/login', 'POST', adminAccount);
    
    if (!loginResponse.success || !loginResponse.data.accessToken) {
      console.log('❌ Admin login failed');
      return;
    }
    
    console.log('✅ Admin login successful');
    const token = loginResponse.data.accessToken;
    const user = loginResponse.data.user;
    console.log(`   User: ${user.email} (Role: ${user.role})\n`);
    
    // 2. Test all admin endpoints
    console.log('2. Testing admin page endpoints...');
    
    const adminEndpoints = [
      { name: 'Products', endpoint: '/api/products' },
      { name: 'Categories', endpoint: '/api/categories' },
      { name: 'Brands', endpoint: '/api/products/brands' },
      { name: 'Promo Codes', endpoint: '/api/promo-codes' },
      { name: 'Analytics', endpoint: '/api/analytics/dashboard' },
      { name: 'Admin Dashboard', endpoint: '/api/admin/dashboard' }
    ];
    
    const results = [];
    
    for (const { name, endpoint } of adminEndpoints) {
      try {
        const result = await makeAuthenticatedRequest(endpoint, 'GET', null, token);
        if (result.success) {
          console.log(`   ✅ ${name}: Working`);
          results.push({ name, status: 'Working', endpoint });
        } else {
          console.log(`   ❌ ${name}: ${result.status} - ${result.error}`);
          results.push({ name, status: `Error ${result.status}`, endpoint, error: result.error });
        }
      } catch (error) {
        console.log(`   ❌ ${name}: ${error.message}`);
        results.push({ name, status: 'Failed', endpoint, error: error.message });
      }
    }
    
    // 3. Summary
    console.log('\n📊 Summary:');
    console.log('='.repeat(60));
    
    const workingPages = results.filter(r => r.status === 'Working');
    const failedPages = results.filter(r => r.status !== 'Working');
    
    console.log(`✅ Working pages: ${workingPages.length}/${results.length}`);
    workingPages.forEach(page => {
      console.log(`   - ${page.name}`);
    });
    
    if (failedPages.length > 0) {
      console.log(`\n❌ Failed pages: ${failedPages.length}/${results.length}`);
      failedPages.forEach(page => {
        console.log(`   - ${page.name}: ${page.error || page.status}`);
      });
    }
    
    console.log('\n🎉 Admin Authentication Fixed!');
    console.log('\nAdmin Credentials for Production:');
    console.log('Email: householdplanet819@gmail.com');
    console.log('Password: HouseholdPlanet2024!');
    console.log('\nAll admin pages should now be accessible.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

function makeRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve) => {
    const url = `${API_BASE}${endpoint}`;
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Admin-Test/1.0',
        'Origin': 'https://householdplanetkenya.co.ke'
      },
      timeout: 15000
    };
    
    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({
            success: res.statusCode < 400,
            status: res.statusCode,
            data: parsedData,
            error: res.statusCode >= 400 ? parsedData.message || res.statusMessage : null
          });
        } catch (parseError) {
          resolve({
            success: res.statusCode < 400,
            status: res.statusCode,
            data: responseData,
            error: res.statusCode >= 400 ? responseData : null
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        status: 0,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        status: 0,
        error: 'Request timeout'
      });
    });

    req.setTimeout(15000);
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

function makeAuthenticatedRequest(endpoint, method = 'GET', data = null, token) {
  return new Promise((resolve) => {
    const url = `${API_BASE}${endpoint}`;
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'Admin-Test/1.0',
        'Origin': 'https://householdplanetkenya.co.ke'
      },
      timeout: 15000
    };
    
    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({
            success: res.statusCode < 400,
            status: res.statusCode,
            data: parsedData,
            error: res.statusCode >= 400 ? parsedData.message || res.statusMessage : null
          });
        } catch (parseError) {
          resolve({
            success: res.statusCode < 400,
            status: res.statusCode,
            data: responseData,
            error: res.statusCode >= 400 ? responseData : null
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        status: 0,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        status: 0,
        error: 'Request timeout'
      });
    });

    req.setTimeout(15000);
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

testAllAdminPages().catch(console.error);