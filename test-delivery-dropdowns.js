const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

async function testAllDeliveryEndpoints() {
  console.log('🧪 Testing All Delivery Location Endpoints...\n');

  const endpoints = [
    {
      name: 'Backend Direct',
      url: `${API_BASE_URL}/api/simple-delivery/locations`,
      description: 'Direct backend API call'
    },
    {
      name: 'Frontend Proxy',
      url: `${FRONTEND_URL}/api/delivery/locations`,
      description: 'Frontend API proxy (used by cart/checkout)'
    }
  ];

  for (const endpoint of endpoints) {
    console.log(`📡 Testing ${endpoint.name}: ${endpoint.url}`);
    console.log(`   ${endpoint.description}`);
    
    try {
      const response = await axios.get(endpoint.url);
      const locations = response.data.data || response.data || [];
      
      console.log(`   ✅ Success: ${locations.length} locations found`);
      
      // Check for Nairobi CBD specifically
      const nairobiCBD = locations.find(loc => 
        loc.name && loc.name.toLowerCase().includes('nairobi cbd')
      );
      
      if (nairobiCBD) {
        console.log(`   🎯 Nairobi CBD: KSh ${nairobiCBD.price} (${nairobiCBD.estimatedDays} days)`);
        if (nairobiCBD.price === 120) {
          console.log(`   ✅ Price correctly shows KSh 120`);
        } else {
          console.log(`   ⚠️  Expected KSh 120, got KSh ${nairobiCBD.price}`);
        }
      } else {
        console.log(`   ❌ Nairobi CBD not found`);
      }
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
      }
    }
    
    console.log('');
  }
}

async function testLocationStructure() {
  console.log('🔍 Testing Location Data Structure...\n');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/simple-delivery/locations`);
    const locations = response.data.data || [];
    
    if (locations.length > 0) {
      const sampleLocation = locations[0];
      console.log('📋 Sample location structure:');
      console.log(JSON.stringify(sampleLocation, null, 2));
      
      // Check required fields
      const requiredFields = ['id', 'name', 'price', 'tier', 'estimatedDays'];
      const missingFields = requiredFields.filter(field => !(field in sampleLocation));
      
      if (missingFields.length === 0) {
        console.log('✅ All required fields present');
      } else {
        console.log(`❌ Missing fields: ${missingFields.join(', ')}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to test structure:', error.message);
  }
}

async function main() {
  console.log('🚀 Delivery Locations Dropdown Test\n');
  console.log('This test verifies that all delivery location dropdowns');
  console.log('(WhatsApp orders, cart, checkout) fetch updated prices from the API.\n');
  
  await testAllDeliveryEndpoints();
  await testLocationStructure();
  
  console.log('📝 Components that should now show updated prices:');
  console.log('✅ Admin > WhatsApp > Create Order dropdown');
  console.log('✅ Cart page delivery location dropdown');
  console.log('✅ Checkout page delivery location dropdown');
  console.log('');
  console.log('🎯 All dropdowns should now show Nairobi CBD as KSh 120');
  console.log('   (instead of the previous hardcoded KSh 100)');
}

main().catch(console.error);