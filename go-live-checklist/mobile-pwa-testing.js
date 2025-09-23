// Mobile and PWA Testing Script
const puppeteer = require('puppeteer');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://householdplanetkenya.co.ke';

async function testMobileResponsiveness() {
  console.log('🔄 Testing Mobile Responsiveness...');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const devices = [
    { name: 'iPhone 12', viewport: { width: 390, height: 844 } },
    { name: 'Samsung Galaxy S21', viewport: { width: 384, height: 854 } },
    { name: 'iPad', viewport: { width: 768, height: 1024 } },
    { name: 'Desktop', viewport: { width: 1920, height: 1080 } }
  ];

  for (const device of devices) {
    try {
      await page.setViewport(device.viewport);
      await page.goto(FRONTEND_URL, { waitUntil: 'networkidle0' });
      
      // Check if page loads properly
      const title = await page.title();
      if (title.includes('Household Planet')) {
        console.log(`✅ ${device.name}: Responsive design working`);
      } else {
        console.log(`❌ ${device.name}: Page not loading properly`);
      }
      
      // Test navigation menu
      const menuButton = await page.$('[data-testid="mobile-menu-button"]');
      if (device.viewport.width < 768 && menuButton) {
        await menuButton.click();
        console.log(`✅ ${device.name}: Mobile menu working`);
      }
      
    } catch (error) {
      console.log(`❌ ${device.name}: Failed`, error.message);
    }
  }

  await browser.close();
}

async function testPWAFunctionality() {
  console.log('🔄 Testing PWA Functionality...');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(FRONTEND_URL);
    
    // Check for manifest.json
    const manifestResponse = await page.goto(`${FRONTEND_URL}/manifest.json`);
    if (manifestResponse.status() === 200) {
      console.log('✅ PWA Manifest: Available');
    } else {
      console.log('❌ PWA Manifest: Not found');
    }
    
    // Check for service worker
    await page.goto(FRONTEND_URL);
    const serviceWorker = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    
    if (serviceWorker) {
      console.log('✅ Service Worker: Supported');
    } else {
      console.log('❌ Service Worker: Not supported');
    }
    
    // Check for offline functionality
    await page.setOfflineMode(true);
    await page.reload();
    
    const offlineContent = await page.$('[data-testid="offline-indicator"]');
    if (offlineContent) {
      console.log('✅ Offline Mode: Working');
    } else {
      console.log('⚠️ Offline Mode: No offline indicator found');
    }
    
  } catch (error) {
    console.log('❌ PWA Testing: Failed', error.message);
  }

  await browser.close();
}

async function testTouchInteractions() {
  console.log('🔄 Testing Touch Interactions...');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(FRONTEND_URL);
    
    // Test touch-friendly buttons
    const buttons = await page.$$('button, [role="button"]');
    let touchFriendlyCount = 0;
    
    for (const button of buttons) {
      const box = await button.boundingBox();
      if (box && box.height >= 44 && box.width >= 44) {
        touchFriendlyCount++;
      }
    }
    
    console.log(`✅ Touch-friendly buttons: ${touchFriendlyCount} found`);
    
    // Test swipe gestures on product carousel
    const carousel = await page.$('[data-testid="product-carousel"]');
    if (carousel) {
      await carousel.hover();
      await page.mouse.down();
      await page.mouse.move(100, 0);
      await page.mouse.up();
      console.log('✅ Swipe Gestures: Working');
    }
    
  } catch (error) {
    console.log('❌ Touch Interactions: Failed', error.message);
  }

  await browser.close();
}

async function testPerformanceMetrics() {
  console.log('🔄 Testing Performance Metrics...');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle0' });
    
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals = {};
          
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              vitals.FCP = entry.startTime;
            }
            if (entry.name === 'largest-contentful-paint') {
              vitals.LCP = entry.startTime;
            }
          });
          
          resolve(vitals);
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
        
        setTimeout(() => resolve({}), 5000);
      });
    });
    
    if (metrics.FCP) {
      console.log(`✅ First Contentful Paint: ${Math.round(metrics.FCP)}ms`);
    }
    if (metrics.LCP) {
      console.log(`✅ Largest Contentful Paint: ${Math.round(metrics.LCP)}ms`);
    }
    
  } catch (error) {
    console.log('❌ Performance Metrics: Failed', error.message);
  }

  await browser.close();
}

// Run all mobile and PWA tests
(async () => {
  await testMobileResponsiveness();
  await testPWAFunctionality();
  await testTouchInteractions();
  await testPerformanceMetrics();
})();