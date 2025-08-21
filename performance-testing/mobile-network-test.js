const puppeteer = require('puppeteer')

const networkConditions = {
  '3G': {
    offline: false,
    downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
    uploadThroughput: 750 * 1024 / 8,           // 750 Kbps
    latency: 40,
  },
  '4G': {
    offline: false,
    downloadThroughput: 4 * 1024 * 1024 / 8,   // 4 Mbps
    uploadThroughput: 3 * 1024 * 1024 / 8,     // 3 Mbps
    latency: 20,
  },
  'Slow 3G': {
    offline: false,
    downloadThroughput: 500 * 1024 / 8,        // 500 Kbps
    uploadThroughput: 500 * 1024 / 8,          // 500 Kbps
    latency: 400,
  },
}

async function testMobileNetworkPerformance() {
  console.log('📱 Running Mobile Network Performance Tests...\n')

  const browser = await puppeteer.launch()
  
  for (const [networkName, conditions] of Object.entries(networkConditions)) {
    console.log(`Testing on ${networkName} network...`)
    
    const page = await browser.newPage()
    
    // Set mobile viewport
    await page.setViewport({
      width: 375,
      height: 667,
      isMobile: true,
      hasTouch: true,
    })
    
    // Apply network conditions
    const client = await page.target().createCDPSession()
    await client.send('Network.emulateNetworkConditions', conditions)
    
    const startTime = Date.now()
    
    try {
      await page.goto('http://localhost:3000', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      })
      
      const loadTime = Date.now() - startTime
      const acceptable = loadTime < (networkName === 'Slow 3G' ? 10000 : 5000)
      
      console.log(`  Load time: ${loadTime}ms ${acceptable ? '✅' : '❌'}`)
      
      // Test critical functionality
      await page.click('[data-testid="products-link"]')
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      
      console.log(`  Navigation works: ✅`)
      
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`)
    }
    
    await page.close()
    console.log('')
  }
  
  await browser.close()
}

testMobileNetworkPerformance().catch(console.error)