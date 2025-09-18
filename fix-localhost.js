const fs = require('fs');
const path = require('path');

const files = [
  'src/app/admin/dashboard/page.tsx',
  'src/app/admin/layout.tsx',
  'src/app/api/admin/delivery-locations/route.ts',
  'src/app/api/admin/delivery-locations/[id]/route.ts',
  'src/app/api/content/banners/route.ts',
  'src/app/api/content/faqs/categories/route.ts',
  'src/app/api/content/faqs/route.ts',
  'src/app/api/delivery/locations/route.ts',
  'src/app/api/gdpr/cookie-consent/route.ts',
  'src/app/api/gdpr/data-deletion/route.ts',
  'src/app/api/gdpr/data-export/route.ts',
  'src/app/api/gdpr/privacy-settings/route.ts',
  'src/app/categories/page.tsx',
  'src/components/home/FeaturedCategories.tsx',
  'src/components/products/SearchAutocomplete.tsx',
  'src/components/search/EnhancedSearch.tsx',
  'src/hooks/useCategories.ts',
  'src/lib/image-utils.ts',
  'src/lib/imageUtils.ts'
];

const frontendPath = 'household-planet-frontend';

files.forEach(file => {
  const filePath = path.join(frontendPath, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/http:\/\/localhost:3001/g, '/api');
    content = content.replace(/'http:\/\/localhost:3001'/g, "'/api'");
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${file}`);
  }
});

console.log('All localhost references fixed!');