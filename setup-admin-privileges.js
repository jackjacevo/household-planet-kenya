const axios = require('axios');

const API_BASE = 'https://api.householdplanetkenya.co.ke';
const ADMIN_EMAIL = 'householdplanet819@gmail.com';
const ADMIN_PASSWORD = 'Admin@2025';

async function setupAdminPrivileges() {
  console.log('🔧 Setting up admin privileges for householdplanet819@gmail.com...\n');

  try {
    // Step 1: Register the user first
    console.log('📝 Registering user...');
    const registerData = {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+254700000001'
    };

    try {
      await axios.post(`${API_BASE}/api/auth/register`, registerData);
      console.log('✅ User registered successfully');
    } catch (regError) {
      if (regError.response?.status === 409) {
        console.log('👤 User already exists, proceeding...');
      } else {
        console.log('❌ Registration failed:', regError.response?.data || regError.message);
        return;
      }
    }

    // Step 2: Login to get token
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    const token = loginResponse.data.access_token;
    const userId = loginResponse.data.user?.id;
    console.log('✅ Login successful');
    console.log('👤 User ID:', userId);

    // Step 3: Update user role to ADMIN via direct API call
    console.log('🔧 Updating user role to ADMIN...');
    
    // We need to make a direct database update since we don't have admin privileges yet
    // This will be done through a special endpoint or direct database access
    
    console.log('\n📋 MANUAL STEPS REQUIRED:');
    console.log('1. Connect to your database');
    console.log('2. Run this SQL command:');
    console.log(`   UPDATE "User" SET role = 'ADMIN' WHERE email = '${ADMIN_EMAIL}';`);
    console.log('3. Also update permissions:');
    console.log(`   UPDATE "User" SET permissions = '["ADMIN_DASHBOARD", "MANAGE_PRODUCTS", "MANAGE_ORDERS", "MANAGE_USERS", "VIEW_ANALYTICS"]' WHERE email = '${ADMIN_EMAIL}';`);
    
    console.log('\n🔑 CREDENTIALS:');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Password:', ADMIN_PASSWORD);
    console.log('Token:', token.substring(0, 30) + '...');

    // Step 4: Test admin access after manual update
    console.log('\n⏳ After running the SQL commands, test admin access...');
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

setupAdminPrivileges().catch(console.error);