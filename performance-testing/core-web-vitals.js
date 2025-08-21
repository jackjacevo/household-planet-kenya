const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')

const pages = [
  'https://householdplanet.co.ke/',
  'https://householdplanet.co.ke/products',
  'https://householdplanet.co.ke/products/1',
  'https://householdplanet.co.ke/cart',
  'https://householdplanet.co.ke/checkout',
]

async function runCoreWebVitalsTest() {
  console.log('🚀 Running Core Web Vitals Tests...\n')

  for (const url of pages) {
    console.log(`Testing: ${url}`)
    
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] })
    
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port,
    }

    const runnerResult = await lighthouse(url, options)
    const { lhr } = runnerResult

    // Core Web Vitals
    const fcp = lhr.audits['first-contentful-paint'].numericValue
    const lcp = lhr.audits['largest-contentful-paint'].numericValue
    const cls = lhr.audits['cumulative-layout-shift'].numericValue
    const fid = lhr.audits['max-potential-fid'].numericValue

    console.log(`  FCP: ${Math.round(fcp)}ms ${fcp < 1800 ? '✅' : '❌'}`)
    console.log(`  LCP: ${Math.round(lcp)}ms ${lcp < 2500 ? '✅' : '❌'}`)
    console.log(`  CLS: ${cls.toFixed(3)} ${cls < 0.1 ? '✅' : '❌'}`)
    console.log(`  FID: ${Math.round(fid)}ms ${fid < 100 ? '✅' : '❌'}`)
    console.log(`  Performance Score: ${lhr.categories.performance.score * 100}/100\n`)

    await chrome.kill()
  }
}

runCoreWebVitalsTest().catch(console.error)