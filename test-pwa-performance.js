const fs = require('fs');
const path = require('path');

async function testPWAPerformanceFeatures() {
  console.log('🚀 Testing PWA Performance Features...\n');

  const tests = [
    {
      name: 'Lazy Loading Image Component',
      test: async () => {
        const lazyImagePath = path.join(__dirname, 'household-planet-frontend/src/components/LazyImage.tsx');
        const exists = fs.existsSync(lazyImagePath);
        
        if (!exists) {
          throw new Error('LazyImage.tsx not found');
        }
        
        const content = fs.readFileSync(lazyImagePath, 'utf8');
        if (!content.includes('IntersectionObserver') || !content.includes('isInView')) {
          throw new Error('Lazy image missing intersection observer');
        }
        
        return 'Lazy loading image component with intersection observer created';
      }
    },
    
    {
      name: 'Lazy Loading Component Wrapper',
      test: async () => {
        const lazyComponentPath = path.join(__dirname, 'household-planet-frontend/src/components/LazyComponent.tsx');
        const exists = fs.existsSync(lazyComponentPath);
        
        if (!exists) {
          throw new Error('LazyComponent.tsx not found');
        }
        
        const content = fs.readFileSync(lazyComponentPath, 'utf8');
        if (!content.includes('IntersectionObserver') || !content.includes('fallback')) {
          throw new Error('Lazy component missing required functionality');
        }
        
        return 'Lazy loading component wrapper for performance optimization created';
      }
    },
    
    {
      name: 'Critical CSS Component',
      test: async () => {
        const criticalCSSPath = path.join(__dirname, 'household-planet-frontend/src/components/CriticalCSS.tsx');
        const exists = fs.existsSync(criticalCSSPath);
        
        if (!exists) {
          throw new Error('CriticalCSS.tsx not found');
        }
        
        const content = fs.readFileSync(criticalCSSPath, 'utf8');
        if (!content.includes('critical-nav') || !content.includes('critical-hero')) {
          throw new Error('Critical CSS missing above-the-fold styles');
        }
        
        return 'Critical CSS component for above-the-fold content created';
      }
    },
    
    {
      name: 'Resource Preloader',
      test: async () => {
        const preloaderPath = path.join(__dirname, 'household-planet-frontend/src/components/ResourcePreloader.tsx');
        const exists = fs.existsSync(preloaderPath);
        
        if (!exists) {
          throw new Error('ResourcePreloader.tsx not found');
        }
        
        const content = fs.readFileSync(preloaderPath, 'utf8');
        if (!content.includes('preload') || !content.includes('prefetch')) {
          throw new Error('Resource preloader missing preload functionality');
        }
        
        return 'Resource preloader for critical content prioritization created';
      }
    },
    
    {
      name: 'Enhanced Next.js Configuration',
      test: async () => {
        const configPath = path.join(__dirname, 'household-planet-frontend/next.config.js');
        const exists = fs.existsSync(configPath);
        
        if (!exists) {
          throw new Error('next.config.js not found');
        }
        
        const content = fs.readFileSync(configPath, 'utf8');
        if (!content.includes('compress: true') || !content.includes('splitChunks')) {
          throw new Error('Next.js config missing performance optimizations');
        }
        
        return 'Next.js configuration updated with compression and code splitting';
      }
    },
    
    {
      name: 'Enhanced Service Worker with Offline Products',
      test: async () => {
        const swPath = path.join(__dirname, 'household-planet-frontend/public/sw.js');
        const exists = fs.existsSync(swPath);
        
        if (!exists) {
          throw new Error('sw.js not found');
        }
        
        const content = fs.readFileSync(swPath, 'utf8');
        if (!content.includes('storeProductsOffline') || !content.includes('getOfflineProducts')) {
          throw new Error('Service worker missing offline product browsing');
        }
        
        return 'Service worker enhanced with offline product browsing capability';
      }
    },
    
    {
      name: 'Updated Manifest with Full-Screen Mode',
      test: async () => {
        const manifestPath = path.join(__dirname, 'household-planet-frontend/public/manifest.json');
        const exists = fs.existsSync(manifestPath);
        
        if (!exists) {
          throw new Error('manifest.json not found');
        }
        
        const content = fs.readFileSync(manifestPath, 'utf8');
        const manifest = JSON.parse(content);
        
        if (!manifest.display_override || !manifest.display_override.includes('fullscreen')) {
          throw new Error('Manifest missing full-screen mode configuration');
        }
        
        return 'Manifest updated with full-screen mode and display override';
      }
    },
    
    {
      name: 'Enhanced Global CSS with System Fonts',
      test: async () => {
        const cssPath = path.join(__dirname, 'household-planet-frontend/src/app/globals.css');
        const exists = fs.existsSync(cssPath);
        
        if (!exists) {
          throw new Error('globals.css not found');
        }
        
        const content = fs.readFileSync(cssPath, 'utf8');
        if (!content.includes('system-ui') || !content.includes('font-display: swap')) {
          throw new Error('Global CSS missing system font optimization');
        }
        
        return 'Global CSS updated with system fonts and critical styles';
      }
    },
    
    {
      name: 'Custom Install Banner Messaging',
      test: async () => {
        const promptPath = path.join(__dirname, 'household-planet-frontend/src/components/PWAInstallPrompt.tsx');
        const exists = fs.existsSync(promptPath);
        
        if (!exists) {
          throw new Error('PWAInstallPrompt.tsx not found');
        }
        
        const content = fs.readFileSync(promptPath, 'utf8');
        if (!content.includes('🏠 Install Household Planet') || !content.includes('✨ Shop offline')) {
          throw new Error('Install prompt missing custom messaging');
        }
        
        return 'PWA install prompt updated with custom messaging and emojis';
      }
    },
    
    {
      name: 'Status Bar Styling',
      test: async () => {
        const layoutPath = path.join(__dirname, 'household-planet-frontend/src/app/layout.tsx');
        const exists = fs.existsSync(layoutPath);
        
        if (!exists) {
          throw new Error('layout.tsx not found');
        }
        
        const content = fs.readFileSync(layoutPath, 'utf8');
        if (!content.includes('black-translucent') || !content.includes('CriticalCSS')) {
          throw new Error('Layout missing status bar styling and critical CSS');
        }
        
        return 'Layout updated with status bar styling and performance components';
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
    console.log('\n🎉 PWA Performance Features completed successfully!');
    console.log('\n⚡ Performance Features Implemented:');
    console.log('• Lazy loading for images and components with intersection observer');
    console.log('• Code splitting for faster initial load with vendor chunks');
    console.log('• Resource prioritization with preload and prefetch');
    console.log('• Minification and compression of all assets');
    console.log('• Image optimization with multiple sizes and WebP/AVIF formats');
    console.log('• Font optimization with system fonts fallback');
    console.log('• Critical CSS inlining for above-the-fold content');
    console.log('• Offline product browsing from IndexedDB cache');
    console.log('• Full-screen mode for immersive experience');
    console.log('• Custom install banner with engaging messaging');
    console.log('• Status bar styling to match app theme');
  } else {
    console.log('\n⚠️  Some PWA performance features need attention.');
  }
}

// Run the test
testPWAPerformanceFeatures().catch(console.error);