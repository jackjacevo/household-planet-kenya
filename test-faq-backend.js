const fetch = require('node-fetch');

async function testFAQEndpoints() {
  const baseUrl = 'http://localhost:3001';
  
  console.log('🔍 Testing FAQ endpoints...');
  
  try {
    // Test FAQ categories
    console.log('\n📂 Testing FAQ categories endpoint...');
    const categoriesResponse = await fetch(`${baseUrl}/content/faqs/categories`);
    console.log(`Status: ${categoriesResponse.status}`);
    
    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json();
      console.log('Categories:', categories);
    } else {
      console.log('Error response:', await categoriesResponse.text());
    }
    
    // Test FAQs
    console.log('\n❓ Testing FAQs endpoint...');
    const faqsResponse = await fetch(`${baseUrl}/content/faqs`);
    console.log(`Status: ${faqsResponse.status}`);
    
    if (faqsResponse.ok) {
      const faqs = await faqsResponse.json();
      console.log(`Found ${faqs.length} FAQs`);
      if (faqs.length > 0) {
        console.log('First FAQ:', faqs[0]);
      }
    } else {
      console.log('Error response:', await faqsResponse.text());
    }
    
  } catch (error) {
    console.error('❌ Error testing endpoints:', error.message);
  }
}

testFAQEndpoints();