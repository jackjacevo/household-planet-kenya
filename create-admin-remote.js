const https = require('https');

const createAdmin = () => {
  const data = JSON.stringify({
    secret: 'household-planet-setup-2025'
  });

  const options = {
    hostname: 'api.householdplanetkenya.co.ke',
    port: 443,
    path: '/api/setup/admin',
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
      console.log('Response:', response);
    });
  });

  req.on('error', (e) => console.error('Error:', e.message));
  req.write(data);
  req.end();
};

createAdmin();