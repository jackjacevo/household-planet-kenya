const axios = require('axios');

async function testInventoryEndpoint() {
  try {
    console.log('Testing inventory alerts endpoint...');
    
    const response = await axios.get('http://localhost:3001/api/admin/inventory/alerts', {
      headers: {
        'Authorization': 'Bearer test-token' // You may need to use a real token
      }
    });
    
    console.log('✅ Inventory endpoint response:');
    console.log('Status:', response.status);
    console.log('Data structure:', {
      lowStock: response.data.lowStock?.length || 0,
      outOfStock: response.data.outOfStock?.length || 0
    });
    
    if (response.data.lowStock?.length > 0) {
      console.log('Sample low stock item:', response.data.lowStock[0]);
    }
    
    if (response.data.outOfStock?.length > 0) {
      console.log('Sample out of stock item:', response.data.outOfStock[0]);
    }
    
  } catch (error) {
    console.error('❌ Error testing inventory endpoint:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testInventoryEndpoint();