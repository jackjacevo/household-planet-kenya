const https = require('https');

function testEndpoint(url, description) {
    return new Promise((resolve) => {
        const req = https.get(url, (res) => {
            console.log(`${description}:`);
            console.log(`  Status: ${res.statusCode}`);
            console.log(`  Headers:`, res.headers);
            resolve(res.statusCode);
        });
        
        req.on('error', (error) => {
            console.log(`${description}: ERROR - ${error.message}`);
            resolve(null);
        });
        
        req.setTimeout(5000, () => {
            console.log(`${description}: TIMEOUT`);
            req.destroy();
            resolve(null);
        });
    });
}

async function verifyDeployment() {
    console.log('🔍 Verifying deployment status...\n');
    
    // Test backend API
    await testEndpoint('https://api.householdplanetkenya.co.ke/health', 'Backend Health Check');
    await testEndpoint('https://api.householdplanetkenya.co.ke/api/products?limit=1', 'Products API');
    
    // Test frontend
    await testEndpoint('https://householdplanetkenya.co.ke', 'Frontend');
    
    console.log('\n📋 Deployment Status Summary:');
    console.log('- If backend shows 502: Backend not deployed/running');
    console.log('- If backend shows 200: Backend is running');
    console.log('- CORS errors occur when backend is running but CORS not configured');
}

verifyDeployment();