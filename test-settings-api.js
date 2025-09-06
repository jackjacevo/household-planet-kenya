const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testSettingsAPI() {
  try {
    console.log('🧪 Testing Settings API...\n');

    // Test 1: Get public settings
    console.log('1. Testing public settings...');
    const publicResponse = await axios.get(`${API_BASE}/api/admin/settings/public`);
    console.log('✅ Public settings loaded:', Object.keys(publicResponse.data).length, 'categories');

    // Test 2: Check if company settings exist
    if (publicResponse.data.company) {
      console.log('✅ Company settings found:');
      console.log('   - Site Name:', publicResponse.data.company.site_name?.value);
      console.log('   - Contact Phone:', publicResponse.data.company.contact_phone?.value);
    }

    // Test 3: Check if social media settings exist
    if (publicResponse.data.social) {
      console.log('✅ Social media settings found:');
      console.log('   - Facebook:', publicResponse.data.social.facebook_url?.value);
      console.log('   - Instagram:', publicResponse.data.social.instagram_url?.value);
      console.log('   - WhatsApp:', publicResponse.data.social.whatsapp_number?.value);
      console.log('   - M-Pesa Paybill:', publicResponse.data.social.mpesa_paybill?.value);
    }

    // Test 4: Check if SEO settings exist
    if (publicResponse.data.seo) {
      console.log('✅ SEO settings found:');
      console.log('   - Meta Title:', publicResponse.data.seo.meta_title?.value);
      console.log('   - Meta Description:', publicResponse.data.seo.meta_description?.value);
    }

    console.log('\n🎉 Settings API test completed successfully!');
    
  } catch (error) {
    console.error('❌ Settings API test failed:', error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

testSettingsAPI();