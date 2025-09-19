const fs = require('fs');
const path = require('path');

// Configuration for URL replacements
const URL_REPLACEMENTS = {
  'http://localhost:3000': 'https://householdplanetkenya.co.ke',
  'http://localhost:3001': 'https://api.householdplanetkenya.co.ke',
  'http://127.0.0.1:3000': 'https://householdplanetkenya.co.ke',
  'http://127.0.0.1:3001': 'https://api.householdplanetkenya.co.ke'
};

// File extensions to process
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.env', '.html', '.md'];

// Directories to scan
const SCAN_DIRECTORIES = [
  'household-planet-frontend/src',
  'household-planet-backend/src',
  'household-planet-frontend/.env.local',
  'household-planet-backend/.env'
];

function replaceInFile(filePath, replacements) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    for (const [oldUrl, newUrl] of Object.entries(replacements)) {
      if (content.includes(oldUrl)) {
        content = content.replace(new RegExp(oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newUrl);
        hasChanges = true;
        console.log(`✅ Fixed ${oldUrl} → ${newUrl} in ${filePath}`);
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function scanDirectory(dirPath, replacements) {
  let totalFiles = 0;
  let modifiedFiles = 0;
  
  function processDirectory(currentPath) {
    try {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip node_modules, .git, .next, etc.
          if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(item)) {
            processDirectory(fullPath);
          }
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (FILE_EXTENSIONS.includes(ext) || item.startsWith('.env')) {
            totalFiles++;
            if (replaceInFile(fullPath, replacements)) {
              modifiedFiles++;
            }
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error scanning directory ${currentPath}:`, error.message);
    }
  }
  
  if (fs.existsSync(dirPath)) {
    if (fs.statSync(dirPath).isFile()) {
      // Single file
      totalFiles = 1;
      if (replaceInFile(dirPath, replacements)) {
        modifiedFiles = 1;
      }
    } else {
      // Directory
      processDirectory(dirPath);
    }
  } else {
    console.log(`⚠️  Path not found: ${dirPath}`);
  }
  
  return { totalFiles, modifiedFiles };
}

function main() {
  console.log('🔧 Starting localhost URL replacement...\n');
  
  let totalFilesProcessed = 0;
  let totalFilesModified = 0;
  
  for (const scanPath of SCAN_DIRECTORIES) {
    console.log(`📁 Scanning: ${scanPath}`);
    const { totalFiles, modifiedFiles } = scanDirectory(scanPath, URL_REPLACEMENTS);
    totalFilesProcessed += totalFiles;
    totalFilesModified += modifiedFiles;
    console.log(`   Files processed: ${totalFiles}, Modified: ${modifiedFiles}\n`);
  }
  
  console.log('📊 Summary:');
  console.log(`   Total files processed: ${totalFilesProcessed}`);
  console.log(`   Total files modified: ${totalFilesModified}`);
  
  if (totalFilesModified > 0) {
    console.log('\n✅ Localhost URLs have been replaced with production URLs!');
    console.log('\n🔄 Next steps:');
    console.log('   1. Restart your development servers');
    console.log('   2. Clear browser cache');
    console.log('   3. Test the application');
  } else {
    console.log('\n✅ No localhost URLs found - your codebase is already configured for production!');
  }
}

main();