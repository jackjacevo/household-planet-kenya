#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 HOUSEHOLD PLANET KENYA - DEPLOYMENT READINESS CHECK');
console.log('====================================================\n');

const issues = [];
const warnings = [];
const passed = [];

// Check 1: Environment Configuration
console.log('1. Checking Environment Configuration...');
const envFiles = [
  'household-planet-backend/.env.production',
  'household-planet-backend/.env.example',
  '.env.dokploy'
];

envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    passed.push(`✅ ${file} exists`);
    
    // Check for critical environment variables
    const content = fs.readFileSync(file, 'utf8');
    const requiredVars = ['JWT_SECRET', 'DATABASE_URL', 'CORS_ORIGIN'];
    
    requiredVars.forEach(varName => {
      if (content.includes(varName)) {
        passed.push(`✅ ${varName} configured in ${file}`);
      } else {
        issues.push(`❌ Missing ${varName} in ${file}`);
      }
    });
    
    // Check for weak JWT secret
    if (content.includes('JWT_SECRET=your-super-secret-jwt-key-change-in-production')) {
      issues.push(`❌ Default JWT secret detected in ${file} - SECURITY RISK`);
    }
  } else {
    issues.push(`❌ Missing ${file}`);
  }
});

// Check 2: Docker Configuration
console.log('\n2. Checking Docker Configuration...');
const dockerFiles = [
  'household-planet-backend/Dockerfile',
  'docker-compose.dokploy.yml',
  'dokploy.yml'
];

dockerFiles.forEach(file => {
  if (fs.existsSync(file)) {
    passed.push(`✅ ${file} exists`);
  } else {
    issues.push(`❌ Missing ${file}`);
  }
});

// Check 3: Database Configuration
console.log('\n3. Checking Database Configuration...');
const prismaSchema = 'household-planet-backend/prisma/schema.prisma';
if (fs.existsSync(prismaSchema)) {
  passed.push(`✅ Prisma schema exists`);
  
  const schemaContent = fs.readFileSync(prismaSchema, 'utf8');
  
  // Check database provider
  if (schemaContent.includes('provider = "sqlite"')) {
    warnings.push(`⚠️  Using SQLite - consider PostgreSQL for production`);
  } else if (schemaContent.includes('provider = "postgresql"')) {
    passed.push(`✅ PostgreSQL configured`);
  }
  
  // Check for binary targets (important for Docker)
  if (schemaContent.includes('binaryTargets')) {
    passed.push(`✅ Binary targets configured for Docker`);
  } else {
    warnings.push(`⚠️  No binary targets specified - may cause issues in Docker`);
  }
} else {
  issues.push(`❌ Missing Prisma schema`);
}

// Check 4: Package.json and Dependencies
console.log('\n4. Checking Package Configuration...');
const packageJson = 'household-planet-backend/package.json';
if (fs.existsSync(packageJson)) {
  passed.push(`✅ Package.json exists`);
  
  const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
  
  // Check for production script
  if (pkg.scripts && pkg.scripts['start:prod']) {
    passed.push(`✅ Production start script configured`);
  } else {
    issues.push(`❌ Missing start:prod script`);
  }
  
  // Check for build script
  if (pkg.scripts && pkg.scripts['build']) {
    passed.push(`✅ Build script configured`);
  } else {
    issues.push(`❌ Missing build script`);
  }
  
  // Check for Prisma scripts
  if (pkg.scripts && pkg.scripts['prisma:generate']) {
    passed.push(`✅ Prisma generate script configured`);
  } else {
    warnings.push(`⚠️  Missing prisma:generate script`);
  }
} else {
  issues.push(`❌ Missing package.json`);
}

// Check 5: Security Configuration
console.log('\n5. Checking Security Configuration...');
const mainTs = 'household-planet-backend/src/main.ts';
if (fs.existsSync(mainTs)) {
  const mainContent = fs.readFileSync(mainTs, 'utf8');
  
  // Check for security middleware
  if (mainContent.includes('helmet')) {
    passed.push(`✅ Helmet security middleware configured`);
  } else {
    issues.push(`❌ Missing Helmet security middleware`);
  }
  
  // Check for CORS configuration
  if (mainContent.includes('enableCors')) {
    passed.push(`✅ CORS configured`);
  } else {
    issues.push(`❌ Missing CORS configuration`);
  }
  
  // Check for compression
  if (mainContent.includes('compression')) {
    passed.push(`✅ Compression middleware configured`);
  } else {
    warnings.push(`⚠️  Missing compression middleware`);
  }
  
  // Check for health check endpoints
  if (mainContent.includes('/health')) {
    passed.push(`✅ Health check endpoints configured`);
  } else {
    issues.push(`❌ Missing health check endpoints`);
  }
} else {
  issues.push(`❌ Missing main.ts file`);
}

// Check 6: Start Script
console.log('\n6. Checking Start Script...');
const startScript = 'household-planet-backend/start.sh';
if (fs.existsSync(startScript)) {
  passed.push(`✅ Start script exists`);
  
  const startContent = fs.readFileSync(startScript, 'utf8');
  
  // Check for database migrations
  if (startContent.includes('prisma migrate deploy')) {
    passed.push(`✅ Database migrations configured in start script`);
  } else {
    issues.push(`❌ Missing database migrations in start script`);
  }
  
  // Check for Prisma generate
  if (startContent.includes('prisma generate')) {
    passed.push(`✅ Prisma generate in start script`);
  } else {
    warnings.push(`⚠️  Missing prisma generate in start script`);
  }
} else {
  issues.push(`❌ Missing start.sh script`);
}

// Check 7: Health Check Script
console.log('\n7. Checking Health Check Script...');
const healthCheck = 'household-planet-backend/healthcheck.js';
if (fs.existsSync(healthCheck)) {
  passed.push(`✅ Health check script exists`);
} else {
  warnings.push(`⚠️  Missing healthcheck.js script`);
}

// Check 8: Upload Directory Structure
console.log('\n8. Checking Upload Directory Structure...');
const uploadsDir = 'household-planet-backend/uploads';
if (fs.existsSync(uploadsDir)) {
  passed.push(`✅ Uploads directory exists`);
} else {
  warnings.push(`⚠️  Uploads directory missing - will be created at runtime`);
}

// Check 9: Production Environment Variables
console.log('\n9. Checking Production Environment Variables...');
const prodEnv = 'household-planet-backend/.env.production';
if (fs.existsSync(prodEnv)) {
  const prodContent = fs.readFileSync(prodEnv, 'utf8');
  
  // Check NODE_ENV
  if (prodContent.includes('NODE_ENV=production')) {
    passed.push(`✅ NODE_ENV set to production`);
  } else {
    issues.push(`❌ NODE_ENV not set to production`);
  }
  
  // Check for production CORS origin
  if (prodContent.includes('CORS_ORIGIN=https://')) {
    passed.push(`✅ Production CORS origin configured`);
  } else {
    issues.push(`❌ Production CORS origin not configured`);
  }
}

// Check 10: Dokploy Configuration
console.log('\n10. Checking Dokploy Configuration...');
const dokployConfig = 'docker-compose.dokploy.yml';
if (fs.existsSync(dokployConfig)) {
  const dokployContent = fs.readFileSync(dokployConfig, 'utf8');
  
  // Check for health checks
  if (dokployContent.includes('healthcheck:')) {
    passed.push(`✅ Docker health checks configured`);
  } else {
    warnings.push(`⚠️  Missing Docker health checks`);
  }
  
  // Check for volumes
  if (dokployContent.includes('volumes:')) {
    passed.push(`✅ Docker volumes configured`);
  } else {
    warnings.push(`⚠️  Missing Docker volumes configuration`);
  }
  
  // Check for networks
  if (dokployContent.includes('networks:')) {
    passed.push(`✅ Docker networks configured`);
  } else {
    warnings.push(`⚠️  Missing Docker networks configuration`);
  }
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('DEPLOYMENT READINESS SUMMARY');
console.log('='.repeat(60));

console.log(`\n✅ PASSED: ${passed.length} checks`);
if (passed.length > 0) {
  passed.forEach(item => console.log(`   ${item}`));
}

console.log(`\n⚠️  WARNINGS: ${warnings.length} items`);
if (warnings.length > 0) {
  warnings.forEach(item => console.log(`   ${item}`));
}

console.log(`\n❌ CRITICAL ISSUES: ${issues.length} items`);
if (issues.length > 0) {
  issues.forEach(item => console.log(`   ${item}`));
}

// Overall assessment
console.log('\n' + '='.repeat(60));
if (issues.length === 0) {
  console.log('🎉 DEPLOYMENT READY! All critical checks passed.');
  if (warnings.length > 0) {
    console.log('📝 Consider addressing warnings for optimal deployment.');
  }
} else {
  console.log('🚨 NOT READY FOR DEPLOYMENT! Critical issues must be resolved.');
  console.log('📋 Fix all critical issues before deploying to production.');
}

console.log('\n📚 Next Steps:');
console.log('1. Fix all critical issues (❌)');
console.log('2. Review and address warnings (⚠️)');
console.log('3. Test deployment in staging environment');
console.log('4. Deploy to production with monitoring');

process.exit(issues.length > 0 ? 1 : 0);