const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testSettings() {
  try {
    console.log('Testing Settings API...');
    
    // Test getting all settings
    console.log('\n1. Getting all settings...');
    const response = await axios.get(`${API_BASE}/admin/settings/public`);
    console.log('Public settings:', JSON.stringify(response.data, null, 2));
    
    console.log('\nSettings API test completed successfully!');
  } catch (error) {
    console.error('Settings API test failed:', error.response?.data || error.message);
  }
}

testSettings();