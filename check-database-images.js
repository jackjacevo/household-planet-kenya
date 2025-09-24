const axios = require('axios');

const API_BASE = 'https://householdplanetkenya.co.ke/api';

async function checkDatabaseImages() {
  console.log('🔍 Checking Database Image Storage...\n');
  
  try {
    // 1. Check Categories with Images
    console.log('1️⃣ Checking Categories...');
    const categoriesResponse = await axios.get(`${API_BASE}/categories`);
    const categories = categoriesResponse.data;
    
    console.log(`Found ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`- ${cat.name}: ${cat.image || 'NO IMAGE'}`);
    });

    // 2. Check Products with Images
    console.log('\n2️⃣ Checking Products...');
    const productsResponse = await axios.get(`${API_BASE}/products?limit=10`);
    const products = productsResponse.data.products || productsResponse.data;
    
    console.log(`Found ${products.length} products:`);
    products.forEach(product => {
      const imageCount = Array.isArray(product.images) ? product.images.length : 0;
      console.log(`- ${product.name}: ${imageCount} images`);
      if (product.images && product.images.length > 0) {
        product.images.forEach((img, idx) => {
          console.log(`  ${idx + 1}. ${img}`);
        });
      }
    });

    // 3. Test Image Access
    console.log('\n3️⃣ Testing Image Access...');
    
    // Test category image access
    const categoryWithImage = categories.find(cat => cat.image);
    if (categoryWithImage) {
      try {
        const imageUrl = `${API_BASE}${categoryWithImage.image}`;
        const imageResponse = await axios.head(imageUrl);
        console.log(`✅ Category image accessible: ${imageUrl} (${imageResponse.status})`);
      } catch (error) {
        console.log(`❌ Category image not accessible: ${error.response?.status || error.message}`);
      }
    }

    // Test product image access
    const productWithImages = products.find(p => p.images && p.images.length > 0);
    if (productWithImages) {
      try {
        const imageUrl = `${API_BASE}${productWithImages.images[0]}`;
        const imageResponse = await axios.head(imageUrl);
        console.log(`✅ Product image accessible: ${imageUrl} (${imageResponse.status})`);
      } catch (error) {
        console.log(`❌ Product image not accessible: ${error.response?.status || error.message}`);
      }
    }

    // 4. Check Upload Endpoints
    console.log('\n4️⃣ Checking Upload Endpoints...');
    
    const endpoints = [
      '/upload/category',
      '/upload/products', 
      '/upload/images',
      '/admin/products/temp/images'
    ];

    for (const endpoint of endpoints) {
      try {
        await axios.options(`${API_BASE}${endpoint}`);
        console.log(`✅ ${endpoint} - Available`);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`🔒 ${endpoint} - Requires Authentication`);
        } else {
          console.log(`❌ ${endpoint} - ${error.response?.status || 'Not Available'}`);
        }
      }
    }

    console.log('\n📊 Database Image Check Complete!');

  } catch (error) {
    console.error('❌ Check failed:', error.response?.data || error.message);
  }
}

checkDatabaseImages();