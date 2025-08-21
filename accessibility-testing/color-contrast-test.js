const puppeteer = require('puppeteer')
const axe = require('@axe-core/puppeteer')

async function checkColorContrast() {
  console.log('🎨 Running Color Contrast Tests...\n')

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  
  const pages = [
    'http://localhost:3000/',
    'http://localhost:3000/products',
    'http://localhost:3000/login',
  ]

  for (const url of pages) {
    console.log(`Testing: ${url}`)
    await page.goto(url)
    
    // Run axe accessibility tests focused on color contrast
    const results = await axe.analyze(page, {
      rules: {
        'color-contrast': { enabled: true },
        'color-contrast-enhanced': { enabled: true },
      }
    })

    if (results.violations.length === 0) {
      console.log('  ✅ All color contrast ratios meet WCAG AA standards')
    } else {
      console.log('  ❌ Color contrast violations found:')
      
      results.violations.forEach(violation => {
        console.log(`    - ${violation.description}`)
        console.log(`      Impact: ${violation.impact}`)
        
        violation.nodes.forEach(node => {
          console.log(`      Element: ${node.target[0]}`)
          console.log(`      Contrast ratio: ${node.any[0]?.data?.contrastRatio || 'Unknown'}`)
        })
      })
    }
    console.log('')
  }

  await browser.close()
}

// Manual color contrast verification
const colorPairs = [
  { bg: '#ffffff', fg: '#000000', name: 'Black on White' },
  { bg: '#1f2937', fg: '#ffffff', name: 'White on Dark Gray' },
  { bg: '#3b82f6', fg: '#ffffff', name: 'White on Blue' },
  { bg: '#ef4444', fg: '#ffffff', name: 'White on Red' },
  { bg: '#10b981', fg: '#ffffff', name: 'White on Green' },
]

function calculateContrastRatio(bg, fg) {
  // Simplified contrast ratio calculation
  const getLuminance = (hex) => {
    const rgb = parseInt(hex.slice(1), 16)
    const r = (rgb >> 16) & 0xff
    const g = (rgb >> 8) & 0xff
    const b = (rgb >> 0) & 0xff
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  const l1 = getLuminance(bg)
  const l2 = getLuminance(fg)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

console.log('📊 Manual Color Contrast Verification:\n')
colorPairs.forEach(pair => {
  const ratio = calculateContrastRatio(pair.bg, pair.fg)
  const aaPass = ratio >= 4.5
  const aaaPass = ratio >= 7
  
  console.log(`${pair.name}: ${ratio.toFixed(2)}:1 ${aaPass ? '✅ AA' : '❌ AA'} ${aaaPass ? '✅ AAA' : '❌ AAA'}`)
})

checkColorContrast().catch(console.error)