const https = require('https');

const API_BASE = 'https://api.householdplanetkenya.co.ke';

// Test both admin accounts
const adminAccounts = [
  {
    email: 'householdplanet819@gmail.com',
    password: 'HouseholdPlanet2024!'
  },
  {
    email: 'admin@householdplanetkenya.co.ke', 
    password: 'HouseholdPlanet2024!'
  }
];

async function testAdminLogins() {
  console.log('🔍 Testing Admin Logins and Protected Endpoints...\n');
  
  for (const account of adminAccounts) {
    console.log(`Testing login for: ${account.email}`);
    
    try {
      const loginResponse = await makeRequest('/api/auth/login', 'POST', account);
      
      if (loginResponse.success && loginResponse.data.accessToken) {
        console.log('✅ Login successful');
        const token = loginResponse.data.accessToken;
        const user = loginResponse.data.user;
        
        console.log(`   User: ${user.email} (Role: ${user.role})`);
        
        // Test protected endpoints
        console.log('   Testing protected endpoints...');
        
        const protectedEndpoints = [
          '/api/promo-codes',
          '/api/analytics/dashboard', 
          '/api/admin/dashboard'
        ];
        
        for (const endpoint of protectedEndpoints) {
          try {
            const result = await makeAuthenticatedRequest(endpoint, 'GET', null, token);
            if (result.success) {
              console.log(`   ✅ ${endpoint}: Working`);
            } else {
              console.log(`   ❌ ${endpoint}: ${result.status} - ${result.error}`);
            }
          } catch (error) {
            console.log(`   ❌ ${endpoint}: ${error.message}`);
          }
        }
        
        console.log(''); // Add spacing
        break; // If one works, we're good
        
      } else {
        console.log('❌ Login failed');
        console.log('   Response:', loginResponse.error || loginResponse.data);
      }
      
    } catch (error) {
      console.log('❌ Login request failed:', error.message);
    }
    
    console.log(''); // Add spacing between accounts
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

testAdminLogins().catch(console.error);