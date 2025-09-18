const fs = require('fs');
const path = require('path');

const files = [
  'src/lib/api.ts',
  'src/lib/settings-api.ts',
  'src/lib/socket.ts'
];

const frontendPath = 'household-planet-frontend';

files.forEach(file => {
  const filePath = path.join(frontendPath, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/|| '\/api'/g, "|| 'https://householdplanetkenya.co.ke/api'");
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${file}`);
  }
});

console.log('All API URLs fixed to use full domain!');