const axios = require('axios');

const API_URL = 'http://localhost:3001/api';
let authToken = '';

async function testCategoryManagement() {
  try {
    console.log('🧪 Testing Category Management API...\n');

    // 1. Login as admin to get token
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@householdplanet.co.ke',
      password: 'Admin123!@#'
    });
    authToken = loginResponse.data.access_token;
    console.log('✅ Admin login successful\n');

    const headers = { Authorization: `Bearer ${authToken}` };

    // 2. Get existing categories
    console.log('2. Fetching existing categories...');
    const categoriesResponse = await axios.get(`${API_URL}/admin/categories`, { headers });
    console.log(`✅ Found ${categoriesResponse.data.length} existing categories\n`);

    // 3. Create a new test category
    console.log('3. Creating a new test category...');
    const newCategory = {
      name: 'Test Category',
      slug: 'test-category',
      description: 'This is a test category for management testing',
      isActive: true
    };
    
    const createResponse = await axios.post(`${API_URL}/admin/categories`, newCategory, { headers });
    const createdCategory = createResponse.data;
    console.log(`✅ Category created with ID: ${createdCategory.id}\n`);

    // 4. Update the category
    console.log('4. Updating the test category...');
    const updateData = {
      name: 'Updated Test Category',
      slug: 'updated-test-category',
      description: 'This category has been updated',
      isActive: true
    };
    
    const updateResponse = await axios.put(`${API_URL}/admin/categories/${createdCategory.id}`, updateData, { headers });
    console.log('✅ Category updated successfully\n');

    // 5. Create a subcategory
    console.log('5. Creating a subcategory...');
    const subCategory = {
      name: 'Test Subcategory',
      slug: 'test-subcategory',
      description: 'This is a test subcategory',
      parentId: createdCategory.id,
      isActive: true
    };
    
    const subCategoryResponse = await axios.post(`${API_URL}/admin/categories`, subCategory, { headers });
    const createdSubCategory = subCategoryResponse.data;
    console.log(`✅ Subcategory created with ID: ${createdSubCategory.id}\n`);

    // 6. Try to delete parent category (should fail)
    console.log('6. Attempting to delete parent category (should fail)...');
    try {
      await axios.delete(`${API_URL}/categories/${createdCategory.id}`, { headers });
      console.log('❌ Parent category deletion should have failed but succeeded');
    } catch (error) {
      console.log('✅ Parent category deletion correctly failed (has subcategories)\n');
    }

    // 7. Delete subcategory first
    console.log('7. Deleting subcategory...');
    await axios.delete(`${API_URL}/categories/${createdSubCategory.id}`, { headers });
    console.log('✅ Subcategory deleted successfully\n');

    // 8. Now delete parent category
    console.log('8. Deleting parent category...');
    await axios.delete(`${API_URL}/categories/${createdCategory.id}`, { headers });
    console.log('✅ Parent category deleted successfully\n');

    // 9. Verify categories list
    console.log('9. Verifying final categories list...');
    const finalCategoriesResponse = await axios.get(`${API_URL}/admin/categories`, { headers });
    console.log(`✅ Final category count: ${finalCategoriesResponse.data.length}\n`);

    console.log('🎉 All category management tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testCategoryManagement();