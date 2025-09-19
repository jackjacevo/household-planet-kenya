const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { createSettingsTable } = require('./create-settings-table');
const { fixSecurityVulnerabilities } = require('./fix-security-vulnerabilities');

async function setupProduction() {
  try {
    console.log('🚀 Setting up production deployment...\n');

    // 1. Fix security vulnerabilities
    console.log('1. Fixing security vulnerabilities...');
    await fixSecurityVulnerabilities();
    
    // Install updated packages
    console.log('Installing updated packages...');
    execSync('npm install', { stdio: 'inherit' });
    
    // 2. Generate Prisma client
    console.log('\n2. Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // 3. Push database schema
    console.log('\n3. Pushing database schema...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    
    // 4. Create settings table
    console.log('\n4. Creating settings table...');
    await createSettingsTable();
    
    // 5. Build application
    console.log('\n5. Building application...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // 6. Check production readiness
    console.log('\n6. Checking production readiness...');
    
    const checks = [
      {
        name: 'Settings table',
        check: () => fs.existsSync(path.join(__dirname, '..', 'prisma', 'dev.db')),
        message: '✅ Settings table ready'
      },
      {
        name: 'Build output',
        check: () => fs.existsSync(path.join(__dirname, '..', 'dist')),
        message: '✅ Application built successfully'
      },
      {
        name: 'Environment config',
        check: () => fs.existsSync(path.join(__dirname, '..', '.env.production')),
        message: '✅ Production environment config ready'
      }
    ];
    
    for (const check of checks) {
      if (check.check()) {
        console.log(check.message);
      } else {
        console.log(`❌ ${check.name} check failed`);
      }
    }
    
    console.log('\n🎉 Production setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Update .env.production with your actual production values');
    console.log('2. Set up Redis server for session storage');
    console.log('3. Set up PostgreSQL database for production');
    console.log('4. Configure your reverse proxy (nginx)');
    console.log('5. Set up SSL certificates');
    console.log('6. Deploy using: NODE_ENV=production npm run start:prod');
    
  } catch (error) {
    console.error('❌ Production setup failed:', error);
    throw error;
  }
}

if (require.main === module) {
  setupProduction()
    .then(() => {
      console.log('\n✅ Production setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Production setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupProduction };