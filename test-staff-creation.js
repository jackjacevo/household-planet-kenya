const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testStaffCreation() {
  try {
    // Login
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@householdplanet.co.ke',
      password: 'HouseholdAdmin2024!'
    });
    
    const token = loginResponse.data.accessToken;
    const headers = { 'Authorization': `Bearer ${token}` };
    
    console.log('✅ Login successful');
    
    // Test creating a new staff member
    const newStaff = {
      name: 'Test Staff Member',
      email: `test.staff.${Date.now()}@householdplanet.co.ke`,
      password: 'testpass123',
      role: 'STAFF',
      permissions: ['manage_orders', 'view_analytics'],
      isActive: true
    };
    
    console.log('Creating staff member:', newStaff.name, newStaff.email);
    
    const createResponse = await axios.post(`${API_URL}/admin/staff`, newStaff, { headers });
    console.log('✅ Staff created successfully:', createResponse.data);
    
    // Test creating an admin
    const newAdmin = {
      name: 'Test Admin User',
      email: `test.admin.${Date.now()}@householdplanet.co.ke`,
      password: 'adminpass123',
      role: 'ADMIN',
      permissions: ['manage_products', 'manage_orders', 'manage_customers', 'view_analytics'],
      isActive: true
    };
    
    console.log('Creating admin user:', newAdmin.name, newAdmin.email);
    
    const createAdminResponse = await axios.post(`${API_URL}/admin/staff`, newAdmin, { headers });
    console.log('✅ Admin created successfully:', createAdminResponse.data);
    
    // Get updated staff list
    const staffResponse = await axios.get(`${API_URL}/admin/staff`, { headers });
    console.log(`\n📊 Total staff members: ${staffResponse.data.length}`);
    
    staffResponse.data.forEach(staff => {
      console.log(`- ${staff.name} (${staff.email}) - ${staff.role} - ${staff.isActive ? 'Active' : 'Inactive'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
  }
}

testStaffCreation();