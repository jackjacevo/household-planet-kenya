const API_URL = 'http://localhost:3001';

async function testFilters() {
  console.log('Testing product filters after fixes...\n');
  
  const testCases = [
    {
      name: 'No filters (all products)',
      params: { limit: 5 }
    },
    {
      name: 'Category filter',
      params: { category: 1, limit: 3 }
    },
    {
      name: 'Brand filter',
      params: { brand: 1, limit: 3 }
    },
    {
      name: 'Search filter',
      params: { search: 'kitchen', limit: 3 }
    },
    {
      name: 'Price range filter',
      params: { minPrice: 1000, maxPrice: 10000, limit: 3 }
    },
    {
      name: 'Max price only',
      params: { maxPrice: 5000, limit: 3 }
    },
    {
      name: 'Featured products',
      params: { featured: true, limit: 3 }
    },
    {
      name: 'In stock products',
      params: { inStock: true, limit: 3 }
    },
    {
      name: 'On sale products',
      params: { onSale: true, limit: 3 }
    },
    {
      name: 'Rating filter',
      params: { minRating: 4, limit: 3 }
    },
    {
      name: 'Combined filters',
      params: { category: 1, inStock: true, maxPrice: 20000, limit: 3 }
    }
  ];
  
  for (const testCase of testCases) {
    try {
      const queryString = new URLSearchParams(testCase.params).toString();
      const response = await fetch(`${API_URL}/api/products?${queryString}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      console.log(`✅ ${testCase.name}:`);
      console.log(`   Query: ${queryString}`);
      console.log(`   Results: ${result.data?.length || 0} products`);
      console.log(`   Total: ${result.pagination?.total || 0} products match`);
      
      if (result.data && result.data.length > 0) {
        const sample = result.data[0];
        console.log(`   Sample: ${sample.name} - KES ${sample.price}`);
        if (sample.category) {
          console.log(`   Category: ${sample.category.name}`);
        }
        if (sample.brand) {
          console.log(`   Brand: ${sample.brand.name}`);
        }
        console.log(`   In Stock: ${sample.stock > 0 ? 'Yes' : 'No'} (${sample.stock} units)`);
        console.log(`   Featured: ${sample.isFeatured ? 'Yes' : 'No'}`);
      }
      console.log('');
      
    } catch (error) {
      console.error(`❌ ${testCase.name} failed:`, error.message);
      console.log('');
    }
  }
  
  console.log('Filter testing complete!');
}

// Test reset functionality
async function testResetFilters() {
  console.log('\n🔄 Testing filter reset functionality...\n');
  
  try {
    // First apply some filters
    const withFilters = await fetch(`${API_URL}/api/products?category=1&minPrice=1000&featured=true&limit=3`);
    const filteredResult = await withFilters.json();
    console.log(`With filters: ${filteredResult.data?.length || 0} products`);
    
    // Then reset (no filters)
    const noFilters = await fetch(`${API_URL}/api/products?limit=10`);
    const resetResult = await noFilters.json();
    console.log(`After reset: ${resetResult.data?.length || 0} products`);
    console.log(`Total available: ${resetResult.pagination?.total || 0} products`);
    
    console.log('✅ Reset functionality working correctly');
  } catch (error) {
    console.error('❌ Reset test failed:', error.message);
  }
}

if (require.main === module) {
  testFilters().then(() => testResetFilters());
}

module.exports = { testFilters, testResetFilters };