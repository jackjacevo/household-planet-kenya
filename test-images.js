const fs = require('fs');
const path = require('path');

// Test if image files exist
const imagePaths = [
  'household-planet-frontend/public/images/hero-bg.svg',
  'household-planet-frontend/public/images/products/placeholder.svg',
  'household-planet-frontend/public/images/products/kitchen-placeholder.svg',
  'household-planet-frontend/public/images/products/bathroom-placeholder.svg'
];

console.log('Testing image files...\n');

imagePaths.forEach(imagePath => {
  const fullPath = path.join(__dirname, imagePath);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    console.log(`✅ ${imagePath} - ${Math.round(stats.size / 1024)}KB`);
  } else {
    console.log(`❌ ${imagePath} - NOT FOUND`);
  }
});

console.log('\nImage test complete!');