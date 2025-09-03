const API_URL = 'http://localhost:3001';

async function testEnhancedFilters() {
  console.log('Testing enhanced product filters...\n');
  
  const testCases = [
    {
      name: 'Filter by category',
      params: { category: 1, limit: 3 }
    },
    {
      name: 'Filter by brand',
      params: { brand: 2, limit: 3 }
    },
    {
      name: 'Search products',
      params: { search: 'fridge', limit: 3 }
    },
    {
      name: 'Filter by price range',
      params: { minPrice: 1000, maxPrice: 50000, limit: 3 }
    },
    {
      name: 'Filter featured products',
      params: { featured: true, limit: 3 }
    },
    {
      name: 'Filter in stock products',
      params: { inStock: true, limit: 3 }
    },
    {
      name: 'Filter on sale products',
      params: { onSale: true, limit: 3 }
    },
    {
      name: 'Combined filters',
      params: { category: 1, minPrice: 500, inStock: true, limit: 3 }
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
      
      if (result.data && result.data.length > 0) {
        const sample = result.data[0];
        console.log(`   Sample: ${sample.name} - KES ${sample.price}`);
        if (sample.category) {
          console.log(`   Category: ${sample.category.name}`);
        }
        if (sample.brand) {
          console.log(`   Brand: ${sample.brand.name}`);
        }
      }
      console.log('');
      
    } catch (error) {
      console.error(`❌ ${testCase.name} failed:`, error.message);
      console.log('');
    }
  }
}

testEnhancedFilters();