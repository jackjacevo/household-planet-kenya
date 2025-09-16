const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testDeliveryLocations() {
  console.log('🧪 Testing Delivery Locations API...\n');

  try {
    // Test the backend endpoint directly
    console.log('1. Testing backend endpoint: /api/simple-delivery/locations');
    const backendResponse = await axios.get(`${API_BASE_URL}/api/simple-delivery/locations`);
    console.log('✅ Backend endpoint working');
    console.log(`📍 Found ${backendResponse.data.data?.length || 0} locations`);
    
    if (backendResponse.data.data?.length > 0) {
      console.log('\n📋 Sample locations:');
      backendResponse.data.data.slice(0, 3).forEach(location => {
        console.log(`  - ${location.name}: KSh ${location.price} (${location.estimatedDays} days)`);
      });
      
      // Check if Nairobi CBD exists and its price
      const nairobiCBD = backendResponse.data.data.find(loc => 
        loc.name.toLowerCase().includes('nairobi cbd')
      );
      
      if (nairobiCBD) {
        console.log(`\n🎯 Nairobi CBD found: KSh ${nairobiCBD.price}`);
        if (nairobiCBD.price === 120) {
          console.log('✅ Price correctly updated to KSh 120');
        } else {
          console.log(`⚠️  Price is KSh ${nairobiCBD.price}, expected KSh 120`);
        }
      } else {
        console.log('\n❌ Nairobi CBD not found in locations');
      }
    }

    // Test the frontend API proxy
    console.log('\n2. Testing frontend API proxy: /api/delivery/locations');
    try {
      const frontendResponse = await axios.get('http://localhost:3000/api/delivery/locations');
      console.log('✅ Frontend API proxy working');
      console.log(`📍 Proxy returned ${frontendResponse.data.data?.length || 0} locations`);
    } catch (frontendError) {
      console.log('❌ Frontend API proxy failed:', frontendError.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Check if Nairobi CBD price was updated in admin settings
async function checkAdminSettings() {
  console.log('\n🔧 Checking admin delivery location settings...');
  
  try {
    // This would require admin authentication, so we'll just check the public endpoint
    const response = await axios.get(`${API_BASE_URL}/api/simple-delivery/locations`);
    const locations = response.data.data || [];
    
    const nairobiCBD = locations.find(loc => 
      loc.name.toLowerCase().includes('nairobi cbd') || 
      loc.name.toLowerCase().includes('cbd')
    );
    
    if (nairobiCBD) {
      console.log(`📍 Current Nairobi CBD price: KSh ${nairobiCBD.price}`);
      return nairobiCBD.price;
    } else {
      console.log('❌ Nairobi CBD location not found');
      return null;
    }
  } catch (error) {
    console.error('❌ Failed to check settings:', error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Delivery Locations Fix Test\n');
  
  await checkAdminSettings();
  await testDeliveryLocations();
  
  console.log('\n📝 Summary:');
  console.log('- Updated frontend API route to use /api/simple-delivery/locations');
  console.log('- Updated WhatsApp order entry to fetch locations from API');
  console.log('- Updated useDelivery hook to use correct endpoint');
  console.log('- All dropdowns should now reflect current admin settings');
}

main().catch(console.error);