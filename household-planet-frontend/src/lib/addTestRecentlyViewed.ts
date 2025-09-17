// Utility function to add test data for recently viewed products
export function addTestRecentlyViewed() {
  const testData = [
    { id: 1, viewedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() }, // 5 minutes ago
    { id: 2, viewedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() }, // 15 minutes ago
    { id: 3, viewedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() }, // 30 minutes ago
    { id: 4, viewedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() }, // 1 hour ago
    { id: 5, viewedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString() }, // 2 hours ago
  ];
  
  localStorage.setItem('recently-viewed', JSON.stringify(testData));
  console.log('Test recently viewed data added to localStorage');
}

// Call this function in browser console to add test data
if (typeof window !== 'undefined') {
  (window as any).addTestRecentlyViewed = addTestRecentlyViewed;
}
