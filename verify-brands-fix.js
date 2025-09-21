const fs = require('fs');
const path = require('path');

function searchInFile(filePath, searchTerm) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const matches = [];
    
    lines.forEach((line, index) => {
      if (line.includes(searchTerm)) {
        matches.push({
          line: index + 1,
          content: line.trim()
        });
      }
    });
    
    return matches;
  } catch (error) {
    return [];
  }
}

function searchInDirectory(dir, searchTerm, fileExtensions = ['.tsx', '.ts', '.js', '.jsx']) {
  const results = [];
  
  function walkDir(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    files.forEach(file => {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        walkDir(filePath);
      } else if (stat.isFile() && fileExtensions.some(ext => file.endsWith(ext))) {
        const matches = searchInFile(filePath, searchTerm);
        if (matches.length > 0) {
          results.push({
            file: filePath,
            matches: matches
          });
        }
      }
    });
  }
  
  walkDir(dir);
  return results;
}

console.log('🔍 Verifying brands API fix...\n');

const frontendSrc = 'c:\\Users\\Lipaflex\\Documents\\VS PROJECTS\\HouseholdPlanetKenya\\household-planet-frontend\\src';

// Search for old API endpoint
console.log('1. Checking for old /api/brands endpoint usage...');
const oldEndpointResults = searchInDirectory(frontendSrc, '/api/brands');

if (oldEndpointResults.length === 0) {
  console.log('✅ No old /api/brands endpoints found');
} else {
  console.log('❌ Found old /api/brands endpoints:');
  oldEndpointResults.forEach(result => {
    console.log(`   File: ${result.file}`);
    result.matches.forEach(match => {
      console.log(`     Line ${match.line}: ${match.content}`);
    });
  });
}

// Search for correct API endpoint
console.log('\n2. Checking for correct /api/products/brands endpoint usage...');
const newEndpointResults = searchInDirectory(frontendSrc, '/api/products/brands');

if (newEndpointResults.length > 0) {
  console.log('✅ Found correct /api/products/brands endpoints:');
  newEndpointResults.forEach(result => {
    const fileName = path.basename(result.file);
    console.log(`   ✓ ${fileName} (${result.matches.length} references)`);
  });
} else {
  console.log('⚠️  No /api/products/brands endpoints found');
}

console.log('\n📊 Summary:');
console.log(`- Old endpoints: ${oldEndpointResults.length}`);
console.log(`- New endpoints: ${newEndpointResults.length}`);

if (oldEndpointResults.length === 0 && newEndpointResults.length > 0) {
  console.log('\n✅ All brands API endpoints have been fixed!');
  console.log('🚀 The 404 errors should resolve after frontend deployment.');
} else if (oldEndpointResults.length > 0) {
  console.log('\n❌ Some old endpoints still need to be fixed.');
} else {
  console.log('\n⚠️  No brands API calls found - this might indicate an issue.');
}