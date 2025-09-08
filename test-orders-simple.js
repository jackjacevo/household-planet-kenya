const https = require('http');

function testAPI() {
  console.log('🔍 Testing Orders API Connection...\n');

  // Test basic connection
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/health',
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ Backend is running and accessible');
        console.log('Response:', data);
      } else {
        console.log('❌ Backend responded with error:', res.statusCode);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Connection failed:', error.message);
    console.log('💡 Make sure the backend is running: cd household-planet-backend && npm run start:dev');
  });

  req.end();
}

testAPI();