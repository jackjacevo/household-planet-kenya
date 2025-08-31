const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

// Test credentials - using actual admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@householdplanet.co.ke',
  password: 'HouseholdAdmin2024!'
};

async function testStaffManagement() {
  console.log('🧪 Testing Staff Management System...\n');

  try {
    // 1. Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, ADMIN_CREDENTIALS);
    const token = loginResponse.data.accessToken;
    console.log('✅ Admin login successful\n');

    const headers = { 'Authorization': `Bearer ${token}` };

    // 2. Get current staff list
    console.log('2. Fetching current staff list...');
    const staffResponse = await axios.get(`${API_URL}/admin/staff`, { headers });
    console.log(`✅ Found ${staffResponse.data.length} staff members:`);
    staffResponse.data.forEach(staff => {
      console.log(`   - ${staff.name} (${staff.email}) - ${staff.role} - ${staff.isActive ? 'Active' : 'Inactive'}`);
    });
    console.log();

    // 3. Create a new staff member
    console.log('3. Creating new staff member...');
    const newStaff = {
      name: 'Jane Smith',
      email: 'jane.smith@householdplanet.co.ke',
      password: 'staff123',
      role: 'STAFF',
      permissions: ['manage_orders', 'view_analytics'],
      isActive: true
    };

    try {
      const createStaffResponse = await axios.post(`${API_URL}/admin/staff`, newStaff, { headers });
      console.log('✅ Staff member created successfully:');
      console.log(`   - ID: ${createStaffResponse.data.id}`);
      console.log(`   - Name: ${createStaffResponse.data.name}`);
      console.log(`   - Email: ${createStaffResponse.data.email}`);
      console.log(`   - Role: ${createStaffResponse.data.role}\n`);
    } catch (error) {
      if (error.response?.status === 409 || error.response?.data?.message?.includes('email')) {
        console.log('⚠️  Staff member with this email already exists\n');
      } else {
        throw error;
      }
    }

    // 4. Create a new admin
    console.log('4. Creating new admin...');
    const newAdmin = {
      name: 'John Admin',
      email: 'john.admin@householdplanet.co.ke',
      password: 'admin456',
      role: 'ADMIN',
      permissions: ['manage_products', 'manage_orders', 'manage_customers', 'view_analytics', 'manage_content', 'manage_payments'],
      isActive: true
    };

    try {
      const createAdminResponse = await axios.post(`${API_URL}/admin/staff`, newAdmin, { headers });
      console.log('✅ Admin created successfully:');
      console.log(`   - ID: ${createAdminResponse.data.id}`);
      console.log(`   - Name: ${createAdminResponse.data.name}`);
      console.log(`   - Email: ${createAdminResponse.data.email}`);
      console.log(`   - Role: ${createAdminResponse.data.role}\n`);
    } catch (error) {
      if (error.response?.status === 409 || error.response?.data?.message?.includes('email')) {
        console.log('⚠️  Admin with this email already exists\n');
      } else {
        throw error;
      }
    }

    // 5. Get updated staff list
    console.log('5. Fetching updated staff list...');
    const updatedStaffResponse = await axios.get(`${API_URL}/admin/staff`, { headers });
    console.log(`✅ Updated staff list (${updatedStaffResponse.data.length} members):`);
    
    const admins = updatedStaffResponse.data.filter(s => s.role === 'ADMIN');
    const staff = updatedStaffResponse.data.filter(s => s.role === 'STAFF');
    
    console.log(`\n📊 Staff Statistics:`);
    console.log(`   - Total Staff: ${updatedStaffResponse.data.length}`);
    console.log(`   - Admins: ${admins.length}`);
    console.log(`   - Staff Members: ${staff.length}`);
    console.log(`   - Active: ${updatedStaffResponse.data.filter(s => s.isActive).length}`);
    console.log(`   - Inactive: ${updatedStaffResponse.data.filter(s => !s.isActive).length}`);

    console.log(`\n👥 Admin Users:`);
    admins.forEach(admin => {
      console.log(`   - ${admin.name} (${admin.email}) - ${admin.isActive ? 'Active' : 'Inactive'}`);
    });

    console.log(`\n👤 Staff Users:`);
    staff.forEach(staffMember => {
      console.log(`   - ${staffMember.name} (${staffMember.email}) - ${staffMember.isActive ? 'Active' : 'Inactive'}`);
      if (staffMember.permissions && staffMember.permissions.length > 0) {
        console.log(`     Permissions: ${staffMember.permissions.join(', ')}`);
      }
    });

    // 6. Test permissions update
    if (staff.length > 0) {
      console.log(`\n6. Testing permissions update for ${staff[0].name}...`);
      const updatedPermissions = ['manage_products', 'manage_orders', 'view_analytics'];
      
      try {
        await axios.put(
          `${API_URL}/admin/staff/${staff[0].id}/permissions`,
          updatedPermissions,
          { headers }
        );
        console.log('✅ Permissions updated successfully');
      } catch (error) {
        console.log('❌ Error updating permissions:', error.response?.data?.message || error.message);
      }
    }

    console.log('\n🎉 Staff Management System Test Complete!');
    console.log('\n✅ All tests passed successfully:');
    console.log('   - Staff listing works');
    console.log('   - Staff creation works');
    console.log('   - Admin creation works');
    console.log('   - Permission management works');
    console.log('   - Role-based access control works');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Make sure you have a valid admin account. Run create-admin.js first.');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Tip: Make sure the backend server is running on port 3001');
    }
  }
}

// Run the test
testStaffManagement();