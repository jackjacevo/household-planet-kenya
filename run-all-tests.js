const { exec } = require('child_process')
const path = require('path')

const runCommand = (command, cwd) => {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error in ${cwd}: ${error}`)
        reject(error)
      } else {
        console.log(stdout)
        resolve(stdout)
      }
    })
  })
}

async function runAllTests() {
  console.log('🧪 Starting Comprehensive Test Suite...\n')

  try {
    // Backend Tests
    console.log('📦 Running Backend Tests...')
    await runCommand('npm test', './household-planet-backend')
    await runCommand('npm run test:e2e', './household-planet-backend')
    
    // Frontend Tests
    console.log('🎨 Running Frontend Tests...')
    await runCommand('npm test', './household-planet-frontend')
    await runCommand('npm run test:e2e', './household-planet-frontend')
    
    // Security Tests
    console.log('🔒 Running Security Tests...')
    await runCommand('node security-test.js', './security-tests')
    
    // Load Tests
    console.log('⚡ Running Load Tests...')
    await runCommand('npm run test:load', './household-planet-frontend')
    
    console.log('✅ All tests completed successfully!')
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message)
    process.exit(1)
  }
}

runAllTests()