const API_URL = 'http://localhost:3001';

async function testPriceFilter() {
  console.log('Testing price range filter...\n');
  
  const testCases = [
    {
      name: 'All products (no filter)',
      params: { limit: 10 }
    },
    {
      name: 'Min price 1000',
      params: { minPrice: 1000, limit: 10 }
    },
    {
      name: 'Max price 50000',
      params: { maxPrice: 50000, limit: 10 }
    },
    {
      name: 'Price range 10000-40000',
      params: { minPrice: 10000, maxPrice: 40000, limit: 10 }
    },
    {
      name: 'Price range 1000-5000',
      params: { minPrice: 1000, maxPrice: 5000, limit: 10 }
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
        const prices = result.data.map(p => p.price).sort((a, b) => a - b);
        console.log(`   Price range: KES ${prices[0]} - KES ${prices[prices.length - 1]}`);
        
        // Check if prices are within expected range
        if (testCase.params.minPrice) {
          const belowMin = prices.filter(p => p < testCase.params.minPrice);
          if (belowMin.length > 0) {
            console.log(`   ⚠️  Found ${belowMin.length} products below min price`);
          }
        }
        
        if (testCase.params.maxPrice) {
          const aboveMax = prices.filter(p => p > testCase.params.maxPrice);
          if (aboveMax.length > 0) {
            console.log(`   ⚠️  Found ${aboveMax.length} products above max price`);
          }
        }
      }
      console.log('');
      
    } catch (error) {
      console.error(`❌ ${testCase.name} failed:`, error.message);
      console.log('');
    }
  }
}

testPriceFilter();