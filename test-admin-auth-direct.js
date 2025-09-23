const fetch = require('node-fetch');

async function testAdminAuth() {
  console.log('🔐 Testing admin authentication directly...\n');

  // Try different possible passwords
  const passwords = [
    'HouseholdAdmin2024!',
    'Admin123!@#',
    'admin123',
    'password'
  ];

  for (const password of passwords) {
    console.log(`Trying password: ${password}`);
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Test-Client/1.0'
        },
        body: JSON.stringify({
          email: 'admin@householdplanetkenya.co.ke',
          password: password
        })
      });

      console.log('Status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ SUCCESS! Admin login worked');
        console.log('User role:', data.user?.role);
        console.log('Token present:', !!data.access_token);
        return data.access_token;
      } else {
        const errorText = await response.text();
        console.log('❌ Failed:', errorText.substring(0, 100));
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    
    console.log('');
  }

  console.log('All password attempts failed. Let me check the database...');
  return null;
}

testAdminAuth();