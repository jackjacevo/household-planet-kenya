const https = require('https');

const testLogin = () => {
  const data = JSON.stringify({
    email: 'admin@householdplanet.co.ke',
    password: 'Admin@2025'
  });

  const options = {
    hostname: 'api.householdplanetkenya.co.ke',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    let response = '';
    res.on('data', (chunk) => response += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      if (res.statusCode === 200) {
        console.log('✅ Admin login works');
      } else {
        console.log('❌ Admin login failed:', response);
      }
    });
  });

  req.on('error', (e) => console.error('Error:', e.message));
  req.write(data);
  req.end();
};

testLogin();