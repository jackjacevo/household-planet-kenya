// Script to clear browser storage for recently viewed products
// Run this in browser console to clear any cached demo data

console.log('🧹 Clearing browser storage for demo data...');

// Clear localStorage
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.includes('recently') || key.includes('viewed') || key.includes('product'))) {
    keysToRemove.push(key);
  }
}

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log(`Removed: ${key}`);
});

// Clear sessionStorage
const sessionKeysToRemove = [];
for (let i = 0; i < sessionStorage.length; i++) {
  const key = sessionStorage.key(i);
  if (key && (key.includes('recently') || key.includes('viewed') || key.includes('product'))) {
    sessionKeysToRemove.push(key);
  }
}

sessionKeysToRemove.forEach(key => {
  sessionStorage.removeItem(key);
  console.log(`Removed from session: ${key}`);
});

console.log('✅ Browser storage cleared. Refresh the page to see changes.');