const axios = require('axios');

async function updateRoleInProduction() {
  try {
    console.log('🔧 Attempting to update admin role in production...');
    
    // Method 1: Try direct database update via API (if endpoint exists)
    try {
      const response = await axios.post('https://api.householdplanetkenya.co.ke/api/setup/update-admin-role', {
        email: 'admin@householdplanetkenya.co.ke',
        role: 'SUPER_ADMIN'
      });
      console.log('✅ Role updated successfully via API');
      return;
    } catch (error) {
      console.log('ℹ️ Direct API update not available');
    }
    
    // Method 2: Instructions for manual database update
    console.log('\n📋 Manual Database Update Required:');
    console.log('1. Access your production database (Railway/Render/etc.)');
    console.log('2. Run this SQL command:');
    console.log('   UPDATE users SET role = \'SUPER_ADMIN\' WHERE email = \'admin@householdplanetkenya.co.ke\';');
    console.log('\n🔗 Common database access methods:');
    console.log('• Railway: railway connect <service-name>');
    console.log('• Render: Use database dashboard');
    console.log('• Vercel: Use Prisma Studio or direct SQL');
    
    // Method 3: Create a temporary endpoint
    console.log('\n🛠️ Alternative: Add temporary update endpoint to your backend');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateRoleInProduction();