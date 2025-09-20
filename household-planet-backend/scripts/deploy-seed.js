const { execSync } = require('child_process');

async function deploySeed() {
  try {
    console.log('🚀 Deploying database schema and seed data...');
    
    // Push schema to production database
    console.log('📋 Pushing database schema...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    
    // Run seed script
    console.log('🌱 Seeding production database...');
    execSync('npx prisma db seed', { stdio: 'inherit' });
    
    console.log('✅ Production database seeded successfully!');
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deploySeed();