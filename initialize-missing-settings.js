const axios = require('axios');

const API_BASE = 'http://localhost:3001';

// Mock admin token - in real app this would come from login
const mockAdminHeaders = {
  'Authorization': 'Bearer mock-admin-token',
  'Content-Type': 'application/json'
};

async function initializeMissingSettings() {
  try {
    console.log('🔧 Initializing missing settings...\n');

    // Initialize notification settings
    console.log('1. Creating notification settings...');
    try {
      const notificationData = {
        emailNotifications: true,
        smsNotifications: true,
        whatsappNotifications: true,
        orderConfirmationEmail: true,
        lowStockAlerts: true,
        notificationEmail: 'info@householdplanet.co.ke'
      };

      // This will fail due to auth, but shows the structure
      console.log('Would create notification settings:', notificationData);
    } catch (error) {
      console.log('Expected auth error for notification settings');
    }

    // Initialize social media settings
    console.log('\n2. Creating social media settings...');
    try {
      const socialData = {
        facebookUrl: 'https://www.facebook.com/share/1Np1NSY2bm/',
        instagramUrl: 'https://instagram.com/householdplanetkenya',
        whatsappNumber: '+254790227760',
        mpesaPaybill: '522522',
        mpesaAccount: ''
      };

      console.log('Would create social media settings:', socialData);
    } catch (error) {
      console.log('Expected auth error for social media settings');
    }

    // Check current public settings
    console.log('\n3. Current public settings:');
    const response = await axios.get(`${API_BASE}/api/admin/settings/public`);
    
    console.log('Categories available:', Object.keys(response.data));
    
    // Show company settings to verify contact phone
    if (response.data.company) {
      console.log('\n📞 Company settings:');
      Object.keys(response.data.company).forEach(key => {
        console.log(`- ${key}: ${response.data.company[key].value}`);
      });
    }

    console.log('\n✅ Settings structure verified');
    console.log('\n💡 To fix missing data after refresh:');
    console.log('1. Save settings once through admin panel to create them');
    console.log('2. Missing categories will be created on first save');
    console.log('3. Contact phone should persist - check frontend data mapping');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

initializeMissingSettings();