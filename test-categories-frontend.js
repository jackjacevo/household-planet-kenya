const API_URL = 'http://localhost:3001';

async function testCategoriesAPI() {
  try {
    console.log('Testing categories API...');
    
    // Test categories hierarchy endpoint
    const response = await fetch(`${API_URL}/api/categories/hierarchy`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const categories = await response.json();
    console.log('Categories response:', JSON.stringify(categories, null, 2));
    
    if (Array.isArray(categories) && categories.length > 0) {
      console.log('✅ Categories loaded successfully');
      console.log(`Found ${categories.length} parent categories`);
      
      categories.forEach(cat => {
        console.log(`- ${cat.name} (ID: ${cat.id})`);
        if (cat.children && cat.children.length > 0) {
          cat.children.forEach(child => {
            console.log(`  - ${child.name} (ID: ${child.id})`);
          });
        }
      });
    } else {
      console.log('⚠️ No categories found or invalid response format');
    }
    
  } catch (error) {
    console.error('❌ Error testing categories API:', error.message);
  }
}

// Test products API with filters
async function testProductsAPI() {
  try {
    console.log('\nTesting products API with filters...');
    
    const response = await fetch(`${API_URL}/api/products?limit=5`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Products response structure:', {
      hasData: !!result.data,
      dataLength: result.data?.length || 0,
      hasPagination: !!result.pagination,
      sampleProduct: result.data?.[0] ? {
        id: result.data[0].id,
        name: result.data[0].name,
        category: result.data[0].category,
        brand: result.data[0].brand
      } : null
    });
    
    if (result.data && result.data.length > 0) {
      console.log('✅ Products loaded successfully');
      
      // Check for brands
      const brandsFound = new Set();
      result.data.forEach(product => {
        if (product.brand?.name) {
          brandsFound.add(product.brand.name);
        }
      });
      
      console.log(`Found brands: ${Array.from(brandsFound).join(', ')}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing products API:', error.message);
  }
}

// Run tests
testCategoriesAPI();
testProductsAPI();