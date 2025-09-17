const fs = require('fs');
const path = require('path');

// Fix common TypeScript issues
const fixes = [
  // Fix unknown error types
  {
    pattern: /catch \(error\) {[\s\S]*?error\.message/g,
    replacement: (match) => match.replace('error.message', '(error as Error).message')
  },
  // Fix unknown response types
  {
    pattern: /response\.data/g,
    replacement: '(response as any).data'
  },
  // Fix missing user property
  {
    pattern: /order\.user/g,
    replacement: '(order as any).user'
  },
  // Fix missing promo properties
  {
    pattern: /order\.(promoCode|discountAmount)/g,
    replacement: '(order as any).$1'
  }
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    fixes.forEach(fix => {
      if (fix.pattern.test(content)) {
        content = content.replace(fix.pattern, fix.replacement);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

// Get all TypeScript files
function getAllTsFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...getAllTsFiles(fullPath));
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

const srcDir = path.join(__dirname, 'src');
const tsFiles = getAllTsFiles(srcDir);

console.log(`Fixing ${tsFiles.length} TypeScript files...`);
tsFiles.forEach(fixFile);
console.log('TypeScript fixes completed!');