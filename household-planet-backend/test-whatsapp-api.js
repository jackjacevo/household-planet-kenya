const axios = require('axios');

async function testWhatsAppAPI() {
  try {
    console.log('Testing WhatsApp API endpoint...');
    
    // First, let's try to login as admin
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@householdplanet.co.ke',
      password: 'Admin123!'
    });
    
    const token = loginResponse.data.access_token;
    console.log('Login successful, got token');
    
    // Now test the WhatsApp pending messages endpoint
    const response = await axios.get('http://localhost:3001/api/orders/whatsapp/pending', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('WhatsApp messages response:', response.data);
    console.log('Number of pending messages:', response.data.length);
    
  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testWhatsAppAPI();