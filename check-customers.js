const axios = require('axios');

async function checkCustomers() {
  try {
    // First, let's check all users
    const response = await axios.get('http://localhost:3001/api/users');
    console.log('All users:', response.data);
    
    // Check specifically for customers
    const customers = response.data.filter(user => user.role === 'CUSTOMER');
    console.log('\nCustomers found:', customers.length);
    console.log('Customer details:', customers);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

checkCustomers();