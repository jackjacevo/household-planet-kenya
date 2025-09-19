const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { fixSecurityVulnerabilities } = require('./fix-security-vulnerabilities');

async function setupProductionBuild() {
  try {
    console.log('🚀 Setting up production build...\n');

    // 1. Fix security vulnerabilities
    console.log('1. Fixing security vulnerabilities...');
    await fixSecurityVulnerabilities();
    
    // Install updated packages
    console.log('Installing updated packages...');
    execSync('npm install', { stdio: 'inherit' });
    
    // 2. Generate Prisma client (no database connection needed)
    console.log('\n2. Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // 3. Build application
    console.log('\n3. Building application...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // 4. Check build output
    console.log('\n4. Checking build output...');
    
    const distPath = path.join(__dirname, '..', 'dist');
    if (fs.existsSync(distPath)) {
      console.log('✅ Application built successfully');
      
      // List build contents
      const files = fs.readdirSync(distPath);
      console.log('Build contents:', files);
    } else {
      throw new Error('Build output directory not found');
    }
    
    console.log('\n🎉 Production build completed!');
    console.log('\n📋 Runtime setup will be handled by start.sh:');
    console.log('1. Database schema push/migration');
    console.log('2. Settings table creation');
    console.log('3. Application startup');
    
  } catch (error) {
    console.error('❌ Production build failed:', error);
    throw error;
  }
}

if (require.main === module) {
  setupProductionBuild()
    .then(() => {
      console.log('\n✅ Production build completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Production build failed:', error);
      process.exit(1);
    });
}

module.exports = { setupProductionBuild };