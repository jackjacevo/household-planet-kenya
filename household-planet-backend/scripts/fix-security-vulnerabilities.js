const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function fixSecurityVulnerabilities() {
  try {
    console.log('Fixing security vulnerabilities...');
    
    // Read current package.json
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Update vulnerable packages to secure versions
    const securityUpdates = {
      'axios': '^1.12.0',
      'puppeteer': '^24.22.0',
      'ws': '^8.18.0'
    };
    
    // Apply security updates
    for (const [pkg, version] of Object.entries(securityUpdates)) {
      if (packageJson.dependencies[pkg]) {
        console.log(`Updating ${pkg} to ${version}`);
        packageJson.dependencies[pkg] = version;
      }
    }
    
    // Write updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    console.log('Updated package.json with security fixes');
    console.log('Run "npm install" to apply the updates');
    
  } catch (error) {
    console.error('Error fixing security vulnerabilities:', error);
    throw error;
  }
}

if (require.main === module) {
  fixSecurityVulnerabilities()
    .then(() => {
      console.log('Security vulnerabilities fixed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to fix security vulnerabilities:', error);
      process.exit(1);
    });
}

module.exports = { fixSecurityVulnerabilities };