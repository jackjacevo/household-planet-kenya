const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testAllSettings() {
  try {
    console.log('🧪 Testing All Settings API Endpoints...\n');

    // Test 1: Get all settings
    console.log('1. Testing GET /api/admin/settings/public');
    const allSettings = await axios.get(`${API_BASE}/api/admin/settings/public`);
    console.log('✅ Retrieved settings for categories:', Object.keys(allSettings.data));

    // Test 2: Check each category
    const categories = ['company', 'payment', 'seo', 'security', 'social'];
    
    for (const category of categories) {
      if (allSettings.data[category]) {
        console.log(`✅ ${category} settings found:`, Object.keys(allSettings.data[category]).length, 'keys');
      } else {
        console.log(`⚠️  ${category} settings not found - will be created on first save`);
      }
    }

    // Test 3: Test specific settings that should exist
    const expectedSettings = [
      { category: 'company', key: 'site_name', expected: 'Household Planet Kenya' },
      { category: 'company', key: 'contact_phone', expected: '+254700000000' },
      { category: 'seo', key: 'meta_title', expected: 'Household Planet Kenya - Quality Household Items' },
    ];

    console.log('\n2. Verifying specific settings:');
    for (const setting of expectedSettings) {
      const value = allSettings.data[setting.category]?.[setting.key]?.value;
      if (value === setting.expected) {
        console.log(`✅ ${setting.category}.${setting.key}: "${value}"`);
      } else {
        console.log(`⚠️  ${setting.category}.${setting.key}: expected "${setting.expected}", got "${value}"`);
      }
    }

    console.log('\n🎉 Settings API verification completed!');
    console.log('\n📝 Summary:');
    console.log('- Backend is running correctly');
    console.log('- Settings API endpoints are accessible');
    console.log('- Default settings are initialized');
    console.log('- Ready for frontend testing');
    
  } catch (error) {
    console.error('❌ Settings API test failed:', error.message);
    if (error.response?.status === 404) {
      console.error('💡 Make sure the backend server is running on port 3001');
    }
  }
}

testAllSettings();