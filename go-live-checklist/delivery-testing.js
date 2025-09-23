// Delivery System Testing Script
const axios = require('axios');

const API_BASE = process.env.API_URL || 'https://householdplanetkenya.co.ke';

const testLocations = [
  { name: 'Nairobi CBD', coordinates: { lat: -1.2921, lng: 36.8219 } },
  { name: 'Westlands', coordinates: { lat: -1.2676, lng: 36.8108 } },
  { name: 'Karen', coordinates: { lat: -1.3197, lng: 36.6859 } },
  { name: 'Mombasa', coordinates: { lat: -4.0435, lng: 39.6682 } }
];

async function testDeliveryCalculation() {
  console.log('🔄 Testing Delivery Calculation...');
  
  for (const location of testLocations) {
    try {
      const response = await axios.post(`${API_BASE}/api/delivery/calculate`, {
        destination: location.name,
        coordinates: location.coordinates,
        weight: 2.5,
        items: 3
      });
      
      console.log(`✅ ${location.name}: KES ${response.data.fee}, ${response.data.estimatedDays} days`);
    } catch (error) {
      console.log(`❌ ${location.name}: Failed`, error.message);
    }
  }
}

async function testDeliveryTracking() {
  console.log('🔄 Testing Delivery Tracking...');
  
  try {
    const response = await axios.get(`${API_BASE}/api/delivery/track/TEST123`);
    console.log('✅ Delivery Tracking: Working');
  } catch (error) {
    console.log('❌ Delivery Tracking: Failed', error.message);
  }
}

async function testDeliveryNotifications() {
  console.log('🔄 Testing Delivery Notifications...');
  
  const testDelivery = {
    orderId: 'TEST123',
    customerPhone: '+254700000000',
    customerEmail: 'test@example.com',
    status: 'shipped',
    trackingNumber: 'TRK123456'
  };

  try {
    const response = await axios.post(`${API_BASE}/api/delivery/notify`, testDelivery);
    console.log('✅ Delivery Notifications: Working');
  } catch (error) {
    console.log('❌ Delivery Notifications: Failed', error.message);
  }
}

testDeliveryCalculation();
testDeliveryTracking();
testDeliveryNotifications();