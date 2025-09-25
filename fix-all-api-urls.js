const fs = require('fs');
const path = require('path');

// Files that need to be fixed
const filesToFix = [
  'src/app/api/admin/brands/route.ts',
  'src/app/api/admin/brands/[id]/route.ts',
  'src/app/api/admin/categories/route.ts',
  'src/app/api/admin/categories/[id]/route.ts',
  'src/app/api/admin/products/route.ts',
  'src/app/api/admin/products/[id]/route.ts',
  'src/app/api/admin/staff/route.ts',
  'src/app/api/admin/staff/[id]/route.ts',
  'src/app/api/analytics/whatsapp-inquiry/route.ts',
  'src/app/api/customers/search/route.ts',
  'src/app/api/orders/whatsapp/[messageId]/processed/route.ts',
  'src/app/api/promo-codes/route.ts',
  'src/app/api/promo-codes/validate/route.ts',
  'src/app/api/promo-codes/[id]/route.ts'
];

const frontendDir = 'household-planet-frontend';

function fixFile(filePath) {
  const fullPath = path.join(frontendDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  // Fix the BACKEND_URL default value
  if (content.includes("'https://api.householdplanetkenya.co.ke'")) {
    content = content.replace(
      /'https:\/\/api\.householdplanetkenya\.co\.ke'/g,
      "'https://householdplanetkenya.co.ke'"
    );
    modified = true;
  }
  
  // Fix double /api in URL construction
  const doubleApiPattern = /`\$\{BACKEND_URL\}\/api\//g;
  if (doubleApiPattern.test(content)) {
    content = content.replace(doubleApiPattern, '`${BACKEND_URL}/api/');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  } else {
    console.log(`ℹ️  No changes needed: ${filePath}`);
  }
}

function main() {
  console.log('🔧 Fixing all API URL issues...\n');
  
  filesToFix.forEach(fixFile);
  
  console.log('\n✨ All API URL fixes complete!');
  console.log('🚀 Run "npm run build" in the frontend directory to apply changes.');
}

main();