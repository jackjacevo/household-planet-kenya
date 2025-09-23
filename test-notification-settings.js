const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testNotificationSettings() {
  try {
    console.log('🧪 Testing Notification Settings...\n');

    // Get all settings
    const response = await axios.get(`${API_BASE}/api/admin/settings/public`);
    
    console.log('Available categories:', Object.keys(response.data));
    
    // Check company settings
    if (response.data.company) {
      console.log('\n📞 Company Contact Info:');
      console.log('- Contact Email:', response.data.company.contact_email?.value);
      console.log('- Contact Phone:', response.data.company.contact_phone?.value);
    }
    
    // Check notification settings
    if (response.data.notification) {
      console.log('\n🔔 Notification Settings:');
      Object.keys(response.data.notification).forEach(key => {
        console.log(`- ${key}:`, response.data.notification[key].value);
      });
    } else {
      console.log('\n⚠️  Notification settings not found - need to initialize');
    }

    // Test creating notification settings if they don't exist
    if (!response.data.notification) {
      console.log('\n🔧 Initializing notification settings...');
      
      // This would normally require authentication, but let's see the structure
      const notificationData = {
        emailNotifications: true,
        notificationEmail: 'info@householdplanetkenya.co.ke'
      };
      
      console.log('Would create:', notificationData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNotificationSettings();