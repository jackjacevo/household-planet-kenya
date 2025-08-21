const axe = require('@axe-core/cli')
const puppeteer = require('puppeteer')

const pages = [
  'http://localhost:3000/',
  'http://localhost:3000/products',
  'http://localhost:3000/login',
  'http://localhost:3000/register',
  'http://localhost:3000/cart',
  'http://localhost:3000/checkout',
]

async function runAccessibilityTests() {
  console.log('♿ Running WCAG 2.1 AA Compliance Tests...\n')

  const browser = await puppeteer.launch()
  
  for (const url of pages) {
    console.log(`Testing: ${url}`)
    
    const page = await browser.newPage()
    await page.goto(url)
    
    // Inject axe-core
    await page.addScriptTag({ path: require.resolve('axe-core') })
    
    // Run accessibility tests
    const results = await page.evaluate(() => {
      return axe.run({
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
      })
    })

    // Report violations
    if (results.violations.length === 0) {
      console.log('  ✅ No accessibility violations found')
    } else {
      console.log(`  ❌ Found ${results.violations.length} violations:`)
      results.violations.forEach(violation => {
        console.log(`    - ${violation.id}: ${violation.description}`)
        console.log(`      Impact: ${violation.impact}`)
        console.log(`      Nodes: ${violation.nodes.length}`)
      })
    }
    
    await page.close()
    console.log('')
  }
  
  await browser.close()
}

runAccessibilityTests().catch(console.error)