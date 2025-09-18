const fs = require('fs');
const path = require('path');

// Files that need localhost fixes based on search results
const filesToFix = [
  'household-planet-backend/.env',
  'household-planet-backend/.env.example',
  'household-planet-backend/debug-admin-auth.js',
  'household-planet-backend/dist/src/admin/admin.controller.js',
  'household-planet-backend/dist/src/admin/admin.service.js',
  'household-planet-backend/dist/src/common/config/cors.config.js',
  'household-planet-backend/dist/src/common/middleware/security.middleware.js',
  'household-planet-backend/dist/src/main.js',
  'household-planet-backend/dist/src/notifications/notifications.gateway.js',
  'household-planet-backend/dist/src/orders/shipping.service.js',
  'household-planet-backend/dist/src/payments/mpesa.service.js',
  'household-planet-backend/dist/src/websocket/websocket.gateway.js',
  'household-planet-backend/fix-images.js',
  'household-planet-backend/healthcheck.js'
];

console.log('🔍 Scanning and fixing localhost references...');

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Replace localhost:3000 with production domain
      if (content.includes('localhost:3000')) {
        content = content.replace(/localhost:3000/g, 'householdplanetkenya.co.ke');
        modified = true;
      }
      
      // Replace localhost:3001 with production domain
      if (content.includes('localhost:3001')) {
        content = content.replace(/localhost:3001/g, 'householdplanetkenya.co.ke');
        modified = true;
      }
      
      // Replace http://localhost with https://householdplanetkenya.co.ke
      if (content.includes('http://localhost')) {
        content = content.replace(/http:\/\/localhost(:\d+)?/g, 'https://householdplanetkenya.co.ke');
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed: ${file}`);
      }
    } catch (error) {
      console.log(`❌ Error fixing ${file}: ${error.message}`);
    }
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('✅ Localhost scan and fix complete!');