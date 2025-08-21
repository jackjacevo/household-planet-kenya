#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class Phase5Tester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      responsive: [],
      accessibility: [],
      seo: [],
      performance: [],
      userFlows: [],
      errors: []
    };
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Set viewport for mobile testing
    await this.page.setViewport({ width: 375, height: 667 });
    
    // Enable console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.results.errors.push({
          type: 'console_error',
          message: msg.text(),
          url: this.page.url()
        });
      }
    });

    // Enable network monitoring
    await this.page.setRequestInterception(true);
    this.page.on('request', request => {
      request.continue();
    });
  }

  async testResponsiveDesign() {
    console.log('🔍 Testing Responsive Design...');
    
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    const pages = [
      'http://localhost:3000/',
      'http://localhost:3000/products',
      'http://localhost:3000/cart',
      'http://localhost:3000/checkout',
      'http://localhost:3000/account'
    ];

    for (const viewport of viewports) {
      await this.page.setViewport(viewport);
      
      for (const url of pages) {
        try {
          await this.page.goto(url, { waitUntil: 'networkidle0' });
          
          // Check for horizontal scrollbars
          const hasHorizontalScroll = await this.page.evaluate(() => {
            return document.body.scrollWidth > window.innerWidth;
          });

          // Check touch targets (minimum 44px)
          const touchTargets = await this.page.evaluate(() => {
            const buttons = document.querySelectorAll('button, a, input[type="button"], input[type="submit"]');
            const smallTargets = [];
            
            buttons.forEach(btn => {
              const rect = btn.getBoundingClientRect();
              if (rect.width < 44 || rect.height < 44) {
                smallTargets.push({
                  element: btn.tagName,
                  width: rect.width,
                  height: rect.height
                });
              }
            });
            
            return smallTargets;
          });

          this.results.responsive.push({
            viewport: viewport.name,
            url,
            hasHorizontalScroll,
            smallTouchTargets: touchTargets.length,
            passed: !hasHorizontalScroll && touchTargets.length === 0
          });

        } catch (error) {
          this.results.errors.push({
            type: 'responsive_test',
            viewport: viewport.name,
            url,
            error: error.message
          });
        }
      }
    }
  }

  async testAccessibility() {
    console.log('♿ Testing Accessibility (WCAG 2.1 AA)...');
    
    const pages = [
      'http://localhost:3000/',
      'http://localhost:3000/products',
      'http://localhost:3000/login',
      'http://localhost:3000/register'
    ];

    for (const url of pages) {
      try {
        await this.page.goto(url, { waitUntil: 'networkidle0' });
        
        // Inject axe-core
        await this.page.addScriptTag({
          path: require.resolve('axe-core')
        });

        // Run accessibility tests
        const results = await this.page.evaluate(() => {
          return axe.run({
            tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
          });
        });

        // Check for alt text on images
        const imagesWithoutAlt = await this.page.evaluate(() => {
          const images = document.querySelectorAll('img');
          return Array.from(images).filter(img => !img.alt).length;
        });

        // Check for proper heading hierarchy
        const headingIssues = await this.page.evaluate(() => {
          const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
          const levels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
          
          let issues = 0;
          for (let i = 1; i < levels.length; i++) {
            if (levels[i] > levels[i-1] + 1) {
              issues++;
            }
          }
          return issues;
        });

        // Check for keyboard navigation
        const focusableElements = await this.page.evaluate(() => {
          const focusable = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          return focusable.length;
        });

        this.results.accessibility.push({
          url,
          violations: results.violations.length,
          imagesWithoutAlt,
          headingIssues,
          focusableElements,
          passed: results.violations.length === 0 && imagesWithoutAlt === 0 && headingIssues === 0
        });

      } catch (error) {
        this.results.errors.push({
          type: 'accessibility_test',
          url,
          error: error.message
        });
      }
    }
  }

  async testSEO() {
    console.log('🔍 Testing SEO Optimization...');
    
    const pages = [
      { url: 'http://localhost:3000/', type: 'homepage' },
      { url: 'http://localhost:3000/products', type: 'listing' },
      { url: 'http://localhost:3000/about', type: 'content' }
    ];

    for (const { url, type } of pages) {
      try {
        await this.page.goto(url, { waitUntil: 'networkidle0' });
        
        // Check meta tags
        const metaTags = await this.page.evaluate(() => {
          return {
            title: document.title,
            description: document.querySelector('meta[name="description"]')?.content,
            keywords: document.querySelector('meta[name="keywords"]')?.content,
            ogTitle: document.querySelector('meta[property="og:title"]')?.content,
            ogDescription: document.querySelector('meta[property="og:description"]')?.content,
            ogImage: document.querySelector('meta[property="og:image"]')?.content,
            canonical: document.querySelector('link[rel="canonical"]')?.href,
            robots: document.querySelector('meta[name="robots"]')?.content
          };
        });

        // Check structured data
        const structuredData = await this.page.evaluate(() => {
          const scripts = document.querySelectorAll('script[type="application/ld+json"]');
          return scripts.length;
        });

        // Check heading structure
        const headings = await this.page.evaluate(() => {
          const h1s = document.querySelectorAll('h1');
          const h2s = document.querySelectorAll('h2');
          return {
            h1Count: h1s.length,
            h2Count: h2s.length,
            h1Text: h1s[0]?.textContent
          };
        });

        // Check internal links
        const internalLinks = await this.page.evaluate(() => {
          const links = document.querySelectorAll('a[href^="/"], a[href^="http://localhost"]');
          return links.length;
        });

        this.results.seo.push({
          url,
          type,
          metaTags,
          structuredDataCount: structuredData,
          headings,
          internalLinksCount: internalLinks,
          passed: metaTags.title && metaTags.description && headings.h1Count === 1 && structuredData > 0
        });

      } catch (error) {
        this.results.errors.push({
          type: 'seo_test',
          url,
          error: error.message
        });
      }
    }
  }

  async testPerformance() {
    console.log('⚡ Testing Performance...');
    
    const pages = [
      'http://localhost:3000/',
      'http://localhost:3000/products'
    ];

    for (const url of pages) {
      try {
        // Enable performance monitoring
        await this.page.tracing.start({ path: 'trace.json' });
        
        const startTime = Date.now();
        await this.page.goto(url, { waitUntil: 'networkidle0' });
        const loadTime = Date.now() - startTime;

        await this.page.tracing.stop();

        // Get Core Web Vitals
        const metrics = await this.page.evaluate(() => {
          return new Promise((resolve) => {
            new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const vitals = {};
              
              entries.forEach((entry) => {
                if (entry.name === 'first-contentful-paint') {
                  vitals.fcp = entry.startTime;
                }
                if (entry.name === 'largest-contentful-paint') {
                  vitals.lcp = entry.startTime;
                }
              });
              
              resolve(vitals);
            }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
            
            // Fallback timeout
            setTimeout(() => resolve({}), 5000);
          });
        });

        // Check image optimization
        const imageStats = await this.page.evaluate(() => {
          const images = document.querySelectorAll('img');
          let totalSize = 0;
          let unoptimized = 0;
          
          images.forEach(img => {
            if (!img.src.includes('w=') && !img.src.includes('webp')) {
              unoptimized++;
            }
          });
          
          return {
            totalImages: images.length,
            unoptimized
          };
        });

        this.results.performance.push({
          url,
          loadTime,
          metrics,
          imageStats,
          passed: loadTime < 3000 && (metrics.lcp || 0) < 2500
        });

      } catch (error) {
        this.results.errors.push({
          type: 'performance_test',
          url,
          error: error.message
        });
      }
    }
  }

  async testUserFlows() {
    console.log('👤 Testing User Flows...');
    
    try {
      // Test 1: Homepage to Product Detail
      await this.page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
      
      // Click on first product
      const productLink = await this.page.$('a[href*="/products/"]');
      if (productLink) {
        await productLink.click();
        await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
        
        const isProductPage = await this.page.evaluate(() => {
          return document.querySelector('h1') && document.querySelector('[data-testid="add-to-cart"], button:contains("Add to Cart")');
        });
        
        this.results.userFlows.push({
          flow: 'Homepage to Product Detail',
          passed: isProductPage,
          url: this.page.url()
        });
      }

      // Test 2: Add to Cart Flow
      const addToCartButton = await this.page.$('button:contains("Add to Cart"), [data-testid="add-to-cart"]');
      if (addToCartButton) {
        await addToCartButton.click();
        await this.page.waitForTimeout(1000);
        
        // Check if cart updated
        const cartUpdated = await this.page.evaluate(() => {
          const cartBadge = document.querySelector('[data-testid="cart-count"], .cart-count');
          return cartBadge && parseInt(cartBadge.textContent) > 0;
        });
        
        this.results.userFlows.push({
          flow: 'Add to Cart',
          passed: cartUpdated
        });
      }

      // Test 3: Navigation to Cart
      await this.page.goto('http://localhost:3000/cart', { waitUntil: 'networkidle0' });
      
      const cartPageLoaded = await this.page.evaluate(() => {
        return document.querySelector('h1')?.textContent?.includes('Cart') || 
               document.querySelector('[data-testid="cart-page"]');
      });
      
      this.results.userFlows.push({
        flow: 'Cart Page Navigation',
        passed: cartPageLoaded
      });

      // Test 4: Checkout Flow (if cart has items)
      const hasCartItems = await this.page.evaluate(() => {
        return !document.querySelector('h1')?.textContent?.includes('empty');
      });
      
      if (hasCartItems) {
        const checkoutButton = await this.page.$('a[href="/checkout"], button:contains("Checkout")');
        if (checkoutButton) {
          await checkoutButton.click();
          await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
          
          const checkoutPageLoaded = await this.page.evaluate(() => {
            return document.querySelector('h1')?.textContent?.includes('Checkout') ||
                   document.querySelector('[data-testid="checkout-page"]');
          });
          
          this.results.userFlows.push({
            flow: 'Checkout Navigation',
            passed: checkoutPageLoaded
          });
        }
      }

      // Test 5: User Dashboard (if logged in)
      await this.page.goto('http://localhost:3000/account', { waitUntil: 'networkidle0' });
      
      const dashboardLoaded = await this.page.evaluate(() => {
        return document.querySelector('h1')?.textContent?.includes('Welcome') ||
               document.querySelector('[data-testid="dashboard"]') ||
               document.querySelector('h1')?.textContent?.includes('login'); // Redirect to login is also valid
      });
      
      this.results.userFlows.push({
        flow: 'User Dashboard Access',
        passed: dashboardLoaded
      });

    } catch (error) {
      this.results.errors.push({
        type: 'user_flow_test',
        error: error.message
      });
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        responsive: {
          total: this.results.responsive.length,
          passed: this.results.responsive.filter(r => r.passed).length
        },
        accessibility: {
          total: this.results.accessibility.length,
          passed: this.results.accessibility.filter(r => r.passed).length
        },
        seo: {
          total: this.results.seo.length,
          passed: this.results.seo.filter(r => r.passed).length
        },
        performance: {
          total: this.results.performance.length,
          passed: this.results.performance.filter(r => r.passed).length
        },
        userFlows: {
          total: this.results.userFlows.length,
          passed: this.results.userFlows.filter(r => r.passed).length
        },
        errors: this.results.errors.length
      },
      details: this.results
    };

    // Save report
    const reportPath = path.join(__dirname, 'phase5-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = path.join(__dirname, 'phase5-test-report.html');
    fs.writeFileSync(htmlPath, htmlReport);

    console.log('\n📊 Phase 5 Testing Complete!');
    console.log('='.repeat(50));
    console.log(`📱 Responsive Design: ${report.summary.responsive.passed}/${report.summary.responsive.total} passed`);
    console.log(`♿ Accessibility: ${report.summary.accessibility.passed}/${report.summary.accessibility.total} passed`);
    console.log(`🔍 SEO: ${report.summary.seo.passed}/${report.summary.seo.total} passed`);
    console.log(`⚡ Performance: ${report.summary.performance.passed}/${report.summary.performance.total} passed`);
    console.log(`👤 User Flows: ${report.summary.userFlows.passed}/${report.summary.userFlows.total} passed`);
    console.log(`❌ Errors: ${report.summary.errors}`);
    console.log(`\n📄 Reports saved:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   HTML: ${htmlPath}`);
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phase 5 Test Report - Household Planet Kenya</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric.passed { border-left: 4px solid #28a745; }
        .metric.failed { border-left: 4px solid #dc3545; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .test-item { background: #f8f9fa; margin: 10px 0; padding: 15px; border-radius: 5px; }
        .test-item.passed { border-left: 4px solid #28a745; }
        .test-item.failed { border-left: 4px solid #dc3545; }
        .error { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Phase 5 Deliverables Test Report</h1>
            <p>Household Planet Kenya - ${report.timestamp}</p>
        </div>
        
        <div class="summary">
            <div class="metric ${report.summary.responsive.passed === report.summary.responsive.total ? 'passed' : 'failed'}">
                <h3>📱 Responsive Design</h3>
                <p>${report.summary.responsive.passed}/${report.summary.responsive.total} passed</p>
            </div>
            <div class="metric ${report.summary.accessibility.passed === report.summary.accessibility.total ? 'passed' : 'failed'}">
                <h3>♿ Accessibility</h3>
                <p>${report.summary.accessibility.passed}/${report.summary.accessibility.total} passed</p>
            </div>
            <div class="metric ${report.summary.seo.passed === report.summary.seo.total ? 'passed' : 'failed'}">
                <h3>🔍 SEO</h3>
                <p>${report.summary.seo.passed}/${report.summary.seo.total} passed</p>
            </div>
            <div class="metric ${report.summary.performance.passed === report.summary.performance.total ? 'passed' : 'failed'}">
                <h3>⚡ Performance</h3>
                <p>${report.summary.performance.passed}/${report.summary.performance.total} passed</p>
            </div>
            <div class="metric ${report.summary.userFlows.passed === report.summary.userFlows.total ? 'passed' : 'failed'}">
                <h3>👤 User Flows</h3>
                <p>${report.summary.userFlows.passed}/${report.summary.userFlows.total} passed</p>
            </div>
        </div>

        ${report.summary.errors > 0 ? `
        <div class="section">
            <h2>❌ Errors (${report.summary.errors})</h2>
            ${report.details.errors.map(error => `
                <div class="error">
                    <strong>${error.type}:</strong> ${error.message || error.error}
                    ${error.url ? `<br><small>URL: ${error.url}</small>` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}

        <div class="section">
            <h2>📱 Responsive Design Results</h2>
            ${report.details.responsive.map(test => `
                <div class="test-item ${test.passed ? 'passed' : 'failed'}">
                    <strong>${test.viewport} - ${test.url}</strong><br>
                    Horizontal Scroll: ${test.hasHorizontalScroll ? '❌' : '✅'}<br>
                    Small Touch Targets: ${test.smallTouchTargets}
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2>♿ Accessibility Results</h2>
            ${report.details.accessibility.map(test => `
                <div class="test-item ${test.passed ? 'passed' : 'failed'}">
                    <strong>${test.url}</strong><br>
                    Violations: ${test.violations}<br>
                    Images without Alt: ${test.imagesWithoutAlt}<br>
                    Heading Issues: ${test.headingIssues}<br>
                    Focusable Elements: ${test.focusableElements}
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2>🔍 SEO Results</h2>
            ${report.details.seo.map(test => `
                <div class="test-item ${test.passed ? 'passed' : 'failed'}">
                    <strong>${test.url}</strong><br>
                    Title: ${test.metaTags.title ? '✅' : '❌'}<br>
                    Description: ${test.metaTags.description ? '✅' : '❌'}<br>
                    Structured Data: ${test.structuredDataCount} schemas<br>
                    H1 Count: ${test.headings.h1Count}<br>
                    Internal Links: ${test.internalLinksCount}
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2>⚡ Performance Results</h2>
            ${report.details.performance.map(test => `
                <div class="test-item ${test.passed ? 'passed' : 'failed'}">
                    <strong>${test.url}</strong><br>
                    Load Time: ${test.loadTime}ms<br>
                    LCP: ${test.metrics.lcp || 'N/A'}ms<br>
                    FCP: ${test.metrics.fcp || 'N/A'}ms<br>
                    Images: ${test.imageStats.totalImages} total, ${test.imageStats.unoptimized} unoptimized
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2>👤 User Flow Results</h2>
            ${report.details.userFlows.map(test => `
                <div class="test-item ${test.passed ? 'passed' : 'failed'}">
                    <strong>${test.flow}</strong>: ${test.passed ? '✅ Passed' : '❌ Failed'}
                    ${test.url ? `<br><small>URL: ${test.url}</small>` : ''}
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
    `;
  }

  async run() {
    try {
      await this.init();
      await this.testResponsiveDesign();
      await this.testAccessibility();
      await this.testSEO();
      await this.testPerformance();
      await this.testUserFlows();
      await this.generateReport();
    } catch (error) {
      console.error('Test runner error:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Run tests
const tester = new Phase5Tester();
tester.run().catch(console.error);