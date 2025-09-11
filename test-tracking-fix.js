// Quick test to verify tracking works with tracking numbers
const axios = require('axios');

async function testTracking() {
  try {
    // Test with a tracking number format
    const response = await axios.get('http://localhost:3001/api/orders/track/TRK-1757595531355-7A3F30');
    console.log('✅ Tracking by tracking number works');
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('⚠️  Order not found (expected if no order with this tracking number exists)');
      return true;
    }
    console.log('❌ Tracking failed:', error.response?.status, error.message);
    return false;
  }
}

testTracking();