const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testImageUpload() {
  try {
    console.log('Testing image upload functionality...');
    
    // First, let's test if the backend is running
    const healthCheck = await axios.get('http://localhost:3001/api/admin/dashboard', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    }).catch(err => {
      console.log('Backend health check failed:', err.message);
      return null;
    });
    
    if (healthCheck) {
      console.log('✅ Backend is running');
    } else {
      console.log('❌ Backend is not accessible');
      return;
    }
    
    // Test image serving
    const imageTest = await axios.get('http://localhost:3001/uploads/products/placeholder.svg')
      .catch(err => {
        console.log('Image serving test failed:', err.message);
        return null;
      });
    
    if (imageTest) {
      console.log('✅ Image serving is working');
    } else {
      console.log('❌ Image serving is not working');
    }
    
    console.log('Test completed!');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testImageUpload();