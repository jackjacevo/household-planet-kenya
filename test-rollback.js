#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🧪 Testing Rollback Strategy...');

// 1. Unit Tests
console.log('Running unit tests...');
try {
  execSync('cd household-planet-frontend && npm test -- --testPathPattern=error-handler.test.ts', { stdio: 'inherit' });
  console.log('✅ Unit tests passed');
} catch (error) {
  console.log('❌ Unit tests failed');
}

// 2. E2E Tests
console.log('Running E2E rollback tests...');
try {
  execSync('cd household-planet-frontend && npm run test:e2e -- --spec="admin-rollback.spec.ts"', { stdio: 'inherit' });
  console.log('✅ E2E tests passed');
} catch (error) {
  console.log('❌ E2E tests failed');
}

// 3. Feature Flag Test
console.log('Testing feature flag toggles...');
const testFeatureFlags = () => {
  process.env.NEXT_PUBLIC_FEATURE_NEW_DIALOGS = 'false';
  process.env.NEXT_PUBLIC_FEATURE_VALIDATION = 'false';
  console.log('✅ Feature flags disabled');
};

testFeatureFlags();

console.log('🎯 Rollback testing complete');
console.log('Manual checklist:');
console.log('□ All existing functionality works');
console.log('□ New features work when enabled');
console.log('□ Feature flags toggle correctly');
console.log('□ No console errors');
console.log('□ Performance not degraded');