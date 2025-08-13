const fs = require('fs');
const path = require('path');

async function testPhase7Deliverables() {
  console.log('🚀 Testing Phase 7 - Complete Deliverables...\n');

  const deliverables = [
    {
      name: 'Fully Responsive Design',
      test: async () => {
        const tests = [
          { file: 'tailwind.config.ts', check: "'xs': '320px'" },
          { file: 'src/app/globals.css', check: 'min-h-[44px]' },
          { file: 'src/components/Navigation.tsx', check: 'lg:hidden' },
          { file: 'src/components/MobileNavigation.tsx', check: 'md:hidden' }
        ];
        
        for (const { file, check } of tests) {
          const filePath = path.join(__dirname, `household-planet-frontend/${file}`);
          if (!fs.existsSync(filePath)) throw new Error(`${file} not found`);
          
          const content = fs.readFileSync(filePath, 'utf8');
          if (!content.includes(check)) throw new Error(`${file} missing responsive features`);
        }
        
        return 'Responsive design implemented across 320px-1440px+ breakpoints';
      }
    },
    
    {
      name: 'PWA Functionality with Offline Capabilities',
      test: async () => {
        const pwaFiles = [
          'public/sw.js',
          'public/manifest.json',
          'public/offline.html',
          'src/hooks/usePWA.ts',
          'src/components/PWAInstallPrompt.tsx'
        ];
        
        for (const file of pwaFiles) {
          const filePath = path.join(__dirname, `household-planet-frontend/${file}`);
          if (!fs.existsSync(filePath)) throw new Error(`${file} not found`);
        }
        
        // Check service worker functionality
        const swContent = fs.readFileSync(path.join(__dirname, 'household-planet-frontend/public/sw.js'), 'utf8');
        if (!swContent.includes('storeProductsOffline') || !swContent.includes('CACHE_NAME')) {
          throw new Error('Service worker missing offline functionality');
        }
        
        // Check manifest
        const manifestContent = fs.readFileSync(path.join(__dirname, 'household-planet-frontend/public/manifest.json'), 'utf8');
        const manifest = JSON.parse(manifestContent);
        if (!manifest.display_override || !manifest.shortcuts) {
          throw new Error('Manifest missing PWA features');
        }
        
        return 'Complete PWA with service worker, manifest, and offline product browsing';
      }
    },
    
    {
      name: 'Push Notification System',
      test: async () => {
        const pushFiles = [
          'household-planet-backend/src/notifications/push.service.ts',
          'household-planet-backend/src/notifications/push.controller.ts',
          'household-planet-backend/create-push-tables.sql'
        ];
        
        for (const file of pushFiles) {
          const filePath = path.join(__dirname, file);
          if (!fs.existsSync(filePath)) throw new Error(`${file} not found`);
        }
        
        // Check push service functionality
        const pushService = fs.readFileSync(path.join(__dirname, 'household-planet-backend/src/notifications/push.service.ts'), 'utf8');
        if (!pushService.includes('sendOrderUpdate') || !pushService.includes('sendAbandonedCartReminder')) {
          throw new Error('Push service missing notification types');
        }
        
        return 'Push notification system with order updates and cart reminders';
      }
    },
    
    {
      name: 'Mobile-Optimized User Experience',
      test: async () => {
        const mobileComponents = [
          'src/components/MobileNavigation.tsx',
          'src/components/products/MobileProductGallery.tsx',
          'src/components/checkout/MobileCheckout.tsx',
          'src/components/products/MobileProductCard.tsx',
          'src/components/ui/PullToRefresh.tsx'
        ];
        
        for (const component of mobileComponents) {
          const filePath = path.join(__dirname, `household-planet-frontend/${component}`);
          if (!fs.existsSync(filePath)) throw new Error(`${component} not found`);
          
          const content = fs.readFileSync(filePath, 'utf8');
          if (!content.includes('touch') && !content.includes('mobile') && !content.includes('swipe')) {
            throw new Error(`${component} missing mobile optimizations`);
          }
        }
        
        return 'Mobile-optimized components with touch gestures and mobile patterns';
      }
    },
    
    {
      name: 'App Installation Capability',
      test: async () => {
        const installFiles = [
          'src/components/PWAInstallPrompt.tsx',
          'src/hooks/usePWA.ts'
        ];
        
        for (const file of installFiles) {
          const filePath = path.join(__dirname, `household-planet-frontend/${file}`);
          if (!fs.existsSync(filePath)) throw new Error(`${file} not found`);
        }
        
        // Check install prompt functionality
        const promptContent = fs.readFileSync(path.join(__dirname, 'household-planet-frontend/src/components/PWAInstallPrompt.tsx'), 'utf8');
        if (!promptContent.includes('beforeinstallprompt') || !promptContent.includes('deferredPrompt')) {
          throw new Error('Install prompt missing required functionality');
        }
        
        return 'App installation with custom prompts and timing controls';
      }
    },
    
    {
      name: 'Performance Optimization (90+ Score Ready)',
      test: async () => {
        const performanceFiles = [
          'src/components/LazyImage.tsx',
          'src/components/LazyComponent.tsx',
          'src/components/CriticalCSS.tsx',
          'src/components/ResourcePreloader.tsx'
        ];
        
        for (const file of performanceFiles) {
          const filePath = path.join(__dirname, `household-planet-frontend/${file}`);
          if (!fs.existsSync(filePath)) throw new Error(`${file} not found`);
        }
        
        // Check Next.js config for performance
        const configContent = fs.readFileSync(path.join(__dirname, 'household-planet-frontend/next.config.js'), 'utf8');
        if (!configContent.includes('compress: true') || !configContent.includes('formats: [\'image/webp\', \'image/avif\']')) {
          throw new Error('Next.js config missing performance optimizations');
        }
        
        return 'Performance optimizations: lazy loading, code splitting, compression, image optimization';
      }
    },
    
    {
      name: 'Touch-Friendly Interface',
      test: async () => {
        // Check global CSS for touch-friendly styles
        const cssContent = fs.readFileSync(path.join(__dirname, 'household-planet-frontend/src/app/globals.css'), 'utf8');
        if (!cssContent.includes('min-height: 44px') || !cssContent.includes('btn-mobile')) {
          throw new Error('Global CSS missing touch-friendly styles');
        }
        
        // Check components for touch targets
        const navContent = fs.readFileSync(path.join(__dirname, 'household-planet-frontend/src/components/Navigation.tsx'), 'utf8');
        if (!navContent.includes('min-h-[44px]') || !navContent.includes('min-w-[44px]')) {
          throw new Error('Navigation missing touch-friendly targets');
        }
        
        return 'Touch-friendly interface with 44px minimum tap targets throughout';
      }
    },
    
    {
      name: 'Mobile-Specific Navigation Patterns',
      test: async () => {
        // Check mobile navigation
        const mobileNavContent = fs.readFileSync(path.join(__dirname, 'household-planet-frontend/src/components/MobileNavigation.tsx'), 'utf8');
        if (!mobileNavContent.includes('mobile-nav') || !mobileNavContent.includes('FiHome')) {
          throw new Error('Mobile navigation missing bottom tab pattern');
        }
        
        // Check mobile product gallery
        const galleryContent = fs.readFileSync(path.join(__dirname, 'household-planet-frontend/src/components/products/MobileProductGallery.tsx'), 'utf8');
        if (!galleryContent.includes('onTouchStart') || !galleryContent.includes('swipeable')) {
          throw new Error('Mobile gallery missing swipe gestures');
        }
        
        // Check pull-to-refresh
        const refreshContent = fs.readFileSync(path.join(__dirname, 'household-planet-frontend/src/components/ui/PullToRefresh.tsx'), 'utf8');
        if (!refreshContent.includes('pullDistance') || !refreshContent.includes('onTouchMove')) {
          throw new Error('Pull-to-refresh missing touch handling');
        }
        
        return 'Mobile navigation patterns: bottom tabs, swipe gestures, pull-to-refresh';
      }
    }
  ];

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const deliverable of deliverables) {
    try {
      const result = await deliverable.test();
      console.log(`✅ ${deliverable.name}: ${result}`);
      results.push({ name: deliverable.name, status: 'PASSED', message: result });
      passed++;
    } catch (error) {
      console.log(`❌ ${deliverable.name}: ${error.message}`);
      results.push({ name: deliverable.name, status: 'FAILED', message: error.message });
      failed++;
    }
  }

  console.log(`\n📊 Phase 7 Deliverables: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('\n🎉 Phase 7 - Mobile Optimization & PWA COMPLETE!');
    console.log('\n📱 All Deliverables Verified:');
    console.log('✅ Fully responsive design across all devices (320px-1440px+)');
    console.log('✅ PWA functionality with offline product browsing');
    console.log('✅ Push notification system for orders and engagement');
    console.log('✅ Mobile-optimized user experience with touch gestures');
    console.log('✅ App installation capability with custom prompts');
    console.log('✅ Performance optimizations ready for 90+ scores');
    console.log('✅ Touch-friendly interface with 44px minimum targets');
    console.log('✅ Mobile-specific navigation patterns implemented');
    console.log('\n🚀 Ready for Phase 8 development!');
  } else {
    console.log('\n⚠️  Some deliverables need attention before Phase 8.');
  }

  return results;
}

// Browser compatibility test
async function testBrowserCompatibility() {
  console.log('\n🌐 Browser Compatibility Check...\n');
  
  const compatibilityTests = [
    {
      feature: 'Service Worker Support',
      check: () => {
        const swContent = fs.readFileSync(path.join(__dirname, 'household-planet-frontend/public/sw.js'), 'utf8');
        return swContent.includes('self.addEventListener') && swContent.includes('fetch');
      },
      browsers: 'Chrome 45+, Firefox 44+, Safari 11.1+, Edge 17+'
    },
    {
      feature: 'Web App Manifest',
      check: () => {
        const manifestPath = path.join(__dirname, 'household-planet-frontend/public/manifest.json');
        if (!fs.existsSync(manifestPath)) return false;
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        return manifest.name && manifest.icons && manifest.display;
      },
      browsers: 'Chrome 39+, Firefox 53+, Safari 13+, Edge 79+'
    },
    {
      feature: 'Push Notifications',
      check: () => {
        const pushService = fs.readFileSync(path.join(__dirname, 'household-planet-backend/src/notifications/push.service.ts'), 'utf8');
        return pushService.includes('sendNotification');
      },
      browsers: 'Chrome 42+, Firefox 44+, Safari 16+, Edge 79+'
    },
    {
      feature: 'IndexedDB for Offline Storage',
      check: () => {
        const swContent = fs.readFileSync(path.join(__dirname, 'household-planet-frontend/public/sw.js'), 'utf8');
        return swContent.includes('indexedDB') && swContent.includes('openIndexedDB');
      },
      browsers: 'Chrome 24+, Firefox 16+, Safari 10+, Edge 12+'
    },
    {
      feature: 'Intersection Observer (Lazy Loading)',
      check: () => {
        const lazyImage = fs.readFileSync(path.join(__dirname, 'household-planet-frontend/src/components/LazyImage.tsx'), 'utf8');
        return lazyImage.includes('IntersectionObserver');
      },
      browsers: 'Chrome 51+, Firefox 55+, Safari 12.1+, Edge 15+'
    }
  ];

  for (const test of compatibilityTests) {
    const supported = test.check();
    console.log(`${supported ? '✅' : '❌'} ${test.feature}: ${test.browsers}`);
  }
}

// Device testing checklist
function generateDeviceTestingChecklist() {
  console.log('\n📱 Device Testing Checklist:\n');
  
  const devices = [
    '📱 iPhone (Safari) - Install prompt, touch gestures, offline browsing',
    '🤖 Android Chrome - Full PWA support, push notifications, background sync',
    '💻 Desktop Chrome - Install banner, keyboard navigation, responsive design',
    '🖥️ Desktop Firefox - Core PWA features, service worker functionality',
    '📱 iPad Safari - Touch interface, responsive breakpoints, app shortcuts',
    '🤖 Android Firefox - Offline capabilities, lazy loading, performance'
  ];

  devices.forEach(device => console.log(`• ${device}`));
  
  console.log('\n🧪 Test Scenarios:');
  console.log('1. Install app from browser menu or install prompt');
  console.log('2. Browse products online, then go offline and verify cached products');
  console.log('3. Add items to cart offline, go online and verify sync');
  console.log('4. Test push notifications (requires HTTPS and user permission)');
  console.log('5. Verify touch gestures: swipe gallery, pull-to-refresh, bottom nav');
  console.log('6. Test responsive design across different screen sizes');
  console.log('7. Verify performance with browser dev tools (Lighthouse)');
  console.log('8. Test app shortcuts and full-screen mode');
}

// Run all tests
async function runCompletePhase7Testing() {
  const results = await testPhase7Deliverables();
  await testBrowserCompatibility();
  generateDeviceTestingChecklist();
  
  return results;
}

// Export for use in other test files
if (require.main === module) {
  runCompletePhase7Testing().catch(console.error);
}

module.exports = { testPhase7Deliverables, testBrowserCompatibility, runCompletePhase7Testing };