// Simple test to verify categories API fetch
const testCategoriesFetch = async () => {
  try {
    console.log('Testing categories fetch...');
    const response = await fetch('http://localhost:3001/api/categories/hierarchy');
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Categories count:', data.length);
    console.log('First 3 categories:', data.slice(0, 3).map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      hasChildren: cat.children?.length > 0
    })));
    
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// Run the test
testCategoriesFetch()
  .then(() => console.log('✅ Categories fetch test passed'))
  .catch(() => console.log('❌ Categories fetch test failed'));