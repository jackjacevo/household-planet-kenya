const fs = require('fs');
const path = require('path');

// Map of incorrect imports to correct ones
const importFixes = {
  "@/components/ui/input": "@/components/ui/Input",
  "@/components/ui/textarea": "@/components/ui/Textarea",
  "@/components/ui/badge": "@/components/ui/Badge"
};

function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    for (const [incorrect, correct] of Object.entries(importFixes)) {
      if (content.includes(incorrect)) {
        content = content.replace(new RegExp(incorrect.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), correct);
        changed = true;
      }
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed imports in: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      fixedCount += walkDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      if (fixImportsInFile(fullPath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
}

console.log('🔧 Fixing UI component import paths...');
const frontendSrcPath = path.join(__dirname, 'household-planet-frontend', 'src');
const fixedCount = walkDirectory(frontendSrcPath);
console.log(`\n✅ Fixed imports in ${fixedCount} files`);
console.log('\n🚀 You can now try building the frontend again!');