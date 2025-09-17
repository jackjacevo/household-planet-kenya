const fetch = require('node-fetch');

async function testFixedFAQs() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔍 Testing fixed FAQ endpoints...');
  
  try {
    // Test FAQ categories through frontend API
    console.log('\n📂 Testing FAQ categories through frontend...');
    const categoriesResponse = await fetch(`${baseUrl}/api/content/faqs/categories`);
    console.log(`Status: ${categoriesResponse.status}`);
    
    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json();
      console.log('Categories:', categories);
    } else {
      console.log('Error response:', await categoriesResponse.text());
    }
    
    // Test FAQs through frontend API
    console.log('\n❓ Testing FAQs through frontend...');
    const faqsResponse = await fetch(`${baseUrl}/api/content/faqs`);
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
    
    // Test direct backend endpoints
    console.log('\n🔗 Testing direct backend endpoints...');
    const backendUrl = 'http://localhost:3001';
    
    const directCategoriesResponse = await fetch(`${backendUrl}/api/content/faqs/categories`);
    console.log(`Direct categories status: ${directCategoriesResponse.status}`);
    
    const directFaqsResponse = await fetch(`${backendUrl}/api/content/faqs`);
    console.log(`Direct FAQs status: ${directFaqsResponse.status}`);
    
  } catch (error) {
    console.error('❌ Error testing endpoints:', error.message);
  }
}

testFixedFAQs();