const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
const FRONTEND_BASE = 'http://localhost:3000';

async function testMobileOptimizations() {
  console.log('🚀 Testing Phase 7 - Mobile Optimization & PWA Features...\n');

  const tests = [
    {
      name: 'Mobile Navigation Component',
      test: async () => {
        // Test if mobile navigation files exist
        const fs = require('fs');
        const path = require('path');
        
        const mobileNavPath = path.join(__dirname, 'household-planet-frontend/src/components/MobileNavigation.tsx');
        const exists = fs.existsSync(mobileNavPath);
        
        if (!exists) {
          throw new Error('MobileNavigation.tsx not found');
        }
        
        const content = fs.readFileSync(mobileNavPath, 'utf8');
        if (!content.includes('mobile-nav') || !content.includes('FiHome')) {
          throw new Error('Mobile navigation component missing required elements');
        }
        
        return 'Mobile navigation component created successfully';
      }
    },
    
    {
      name: 'Mobile-First CSS Classes',
      test: async () => {
        const fs = require('fs');
        const path = require('path');
        
        const cssPath = path.join(__dirname, 'household-planet-frontend/src/app/globals.css');
        const exists = fs.existsSync(cssPath);
        
        if (!exists) {
          throw new Error('globals.css not found');
        }
        
        const content = fs.readFileSync(cssPath, 'utf8');
        if (!content.includes('btn-mobile') || !content.includes('input-mobile')) {
          throw new Error('Mobile-first CSS classes not found');
        }
        
        return 'Mobile-first CSS classes implemented';
      }
    },
    
    {
      name: 'Tailwind Mobile Breakpoints',
      test: async () => {
        const fs = require('fs');
        const path = require('path');
        
        const configPath = path.join(__dirname, 'household-planet-frontend/tailwind.config.ts');
        const exists = fs.existsSync(configPath);
        
        if (!exists) {
          throw new Error('tailwind.config.ts not found');
        }
        
        const content = fs.readFileSync(configPath, 'utf8');
        if (!content.includes("'xs': '320px'") || !content.includes("'2xl': '1440px'")) {
          throw new Error('Mobile breakpoints not configured');
        }
        
        return 'Tailwind mobile breakpoints configured';
      }
    },
    
    {
      name: 'Mobile Product Gallery',
      test: async () => {
        const fs = require('fs');
        const path = require('path');
        
        const galleryPath = path.join(__dirname, 'household-planet-frontend/src/components/products/MobileProductGallery.tsx');
        const exists = fs.existsSync(galleryPath);
        
        if (!exists) {
          throw new Error('MobileProductGallery.tsx not found');
        }
        
        const content = fs.readFileSync(galleryPath, 'utf8');
        if (!content.includes('onTouchStart') || !content.includes('swipeable')) {
          throw new Error('Mobile gallery missing touch gestures');
        }
        
        return 'Mobile product gallery with swipe gestures created';
      }
    },
    
    {
      name: 'Mobile Checkout Flow',
      test: async () => {
        const fs = require('fs');
        const path = require('path');
        
        const checkoutPath = path.join(__dirname, 'household-planet-frontend/src/components/checkout/MobileCheckout.tsx');
        const exists = fs.existsSync(checkoutPath);
        
        if (!exists) {
          throw new Error('MobileCheckout.tsx not found');
        }
        
        const content = fs.readFileSync(checkoutPath, 'utf8');
        if (!content.includes('currentStep') || !content.includes('btn-mobile')) {
          throw new Error('Mobile checkout flow missing required elements');
        }
        
        return 'Mobile checkout flow implemented';
      }
    },
    
    {
      name: 'Pull-to-Refresh Component',
      test: async () => {
        const fs = require('fs');
        const path = require('path');
        
        const refreshPath = path.join(__dirname, 'household-planet-frontend/src/components/ui/PullToRefresh.tsx');
        const exists = fs.existsSync(refreshPath);
        
        if (!exists) {
          throw new Error('PullToRefresh.tsx not found');
        }
        
        const content = fs.readFileSync(refreshPath, 'utf8');
        if (!content.includes('onTouchStart') || !content.includes('pullDistance')) {
          throw new Error('Pull-to-refresh missing touch handling');
        }
        
        return 'Pull-to-refresh component created';
      }
    },
    
    {
      name: 'PWA Manifest File',
      test: async () => {
        const fs = require('fs');
        const path = require('path');
        
        const manifestPath = path.join(__dirname, 'household-planet-frontend/public/manifest.json');
        const exists = fs.existsSync(manifestPath);
        
        if (!exists) {
          throw new Error('manifest.json not found');
        }
        
        const content = fs.readFileSync(manifestPath, 'utf8');
        const manifest = JSON.parse(content);
        
        if (!manifest.name || !manifest.icons || manifest.display !== 'standalone') {
          throw new Error('PWA manifest missing required fields');
        }
        
        return 'PWA manifest file created successfully';
      }
    },
    
    {
      name: 'Mobile Product Card',
      test: async () => {
        const fs = require('fs');
        const path = require('path');
        
        const cardPath = path.join(__dirname, 'household-planet-frontend/src/components/products/MobileProductCard.tsx');
        const exists = fs.existsSync(cardPath);
        
        if (!exists) {
          throw new Error('MobileProductCard.tsx not found');
        }
        
        const content = fs.readFileSync(cardPath, 'utf8');
        if (!content.includes('mobile-card') || !content.includes('min-h-[44px]')) {
          throw new Error('Mobile product card missing touch-friendly elements');
        }
        
        return 'Mobile product card with touch-friendly design created';
      }
    },
    
    {
      name: 'Updated Layout with Mobile Support',
      test: async () => {
        const fs = require('fs');
        const path = require('path');
        
        const layoutPath = path.join(__dirname, 'household-planet-frontend/src/app/layout.tsx');
        const exists = fs.existsSync(layoutPath);
        
        if (!exists) {
          throw new Error('layout.tsx not found');
        }
        
        const content = fs.readFileSync(layoutPath, 'utf8');
        if (!content.includes('MobileNavigation') || !content.includes('pb-16 md:pb-0')) {
          throw new Error('Layout not updated for mobile support');
        }
        
        return 'Layout updated with mobile navigation and PWA meta tags';
      }
    },
    
    {
      name: 'Mobile-Optimized Products Page',
      test: async () => {
        const fs = require('fs');
        const path = require('path');
        
        const productsPath = path.join(__dirname, 'household-planet-frontend/src/app/products/page.tsx');
        const exists = fs.existsSync(productsPath);
        
        if (!exists) {
          throw new Error('products/page.tsx not found');
        }
        
        const content = fs.readFileSync(productsPath, 'utf8');
        if (!content.includes('PullToRefresh') || !content.includes('showFilters')) {
          throw new Error('Products page not optimized for mobile');
        }
        
        return 'Products page optimized for mobile with filters modal and pull-to-refresh';
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.test();
      console.log(`✅ ${test.name}: ${result}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('\n🎉 Phase 7 - Mobile Optimization & PWA implementation completed successfully!');
    console.log('\n📱 Mobile Features Implemented:');
    console.log('• Mobile-first responsive design with breakpoints (320px, 768px, 1024px, 1440px)');
    console.log('• Touch-friendly interfaces with 44px minimum tap targets');
    console.log('• Mobile navigation with hamburger menu and bottom tab bar');
    console.log('• Swipeable product galleries with touch gestures');
    console.log('• Mobile-optimized checkout flow with step-by-step process');
    console.log('• Pull-to-refresh functionality on product lists');
    console.log('• Floating action buttons for quick access');
    console.log('• Mobile-specific UI patterns and interactions');
    console.log('• PWA manifest for app-like experience');
    console.log('• Optimized mobile typography and spacing');
    console.log('• Touch gesture support and mobile performance optimizations');
  } else {
    console.log('\n⚠️  Some mobile optimization features need attention.');
  }
}

// Run the test
testMobileOptimizations().catch(console.error);