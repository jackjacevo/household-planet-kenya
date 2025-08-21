const { exec } = require('child_process')

const runCommand = (command, description) => {
  return new Promise((resolve, reject) => {
    console.log(`🚀 ${description}...`)
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ ${description} failed:`, error.message)
        reject(error)
      } else {
        console.log(stdout)
        if (stderr) console.warn(stderr)
        console.log(`✅ ${description} completed\n`)
        resolve(stdout)
      }
    })
  })
}

async function runAllPerformanceTests() {
  console.log('⚡ Starting Performance & Accessibility Test Suite...\n')

  try {
    // Load Testing
    await runCommand(
      'k6 run performance-testing/load-test-advanced.js',
      'High Load Testing (1000+ users)'
    )

    // Database Stress Testing
    await runCommand(
      'k6 run performance-testing/database-stress-test.js',
      'Database Stress Testing'
    )

    // Core Web Vitals
    await runCommand(
      'node performance-testing/core-web-vitals.js',
      'Core Web Vitals Testing'
    )

    // Mobile Network Testing
    await runCommand(
      'node performance-testing/mobile-network-test.js',
      'Mobile Network Performance Testing'
    )

    // WCAG Compliance
    await runCommand(
      'node accessibility-testing/wcag-compliance.js',
      'WCAG 2.1 AA Compliance Testing'
    )

    // Keyboard Navigation
    await runCommand(
      'npx playwright test accessibility-testing/keyboard-navigation.spec.js',
      'Keyboard Navigation Testing'
    )

    // Screen Reader Compatibility
    await runCommand(
      'npx playwright test accessibility-testing/screen-reader-test.js',
      'Screen Reader Compatibility Testing'
    )

    // Color Contrast
    await runCommand(
      'node accessibility-testing/color-contrast-test.js',
      'Color Contrast Testing'
    )

    console.log('🎉 All performance and accessibility tests completed successfully!')
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message)
    process.exit(1)
  }
}

runAllPerformanceTests()