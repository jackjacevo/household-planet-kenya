const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Starting bundle analysis...');

// Install bundle analyzer if not present
try {
  require('@next/bundle-analyzer');
} catch (error) {
  console.log('📦 Installing @next/bundle-analyzer...');
  execSync('npm install --save-dev @next/bundle-analyzer', { stdio: 'inherit' });
}

// Set environment variable for analysis
process.env.ANALYZE = 'true';

// Build and analyze
try {
  console.log('🏗️  Building application for analysis...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Bundle analysis complete!');
  console.log('📊 Check the opened browser tabs for detailed bundle information');
  
  // Generate simple report
  const buildDir = path.join(__dirname, '.next');
  if (fs.existsSync(buildDir)) {
    const stats = fs.statSync(buildDir);
    console.log(`📁 Build directory size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  }
  
} catch (error) {
  console.error('❌ Bundle analysis failed:', error.message);
  process.exit(1);
}