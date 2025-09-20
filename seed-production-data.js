#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'https://api.householdplanetkenya.co.ke';

async function seedProductionData() {
  console.log('🌱 Seeding Production Data...\n');

  try {
    // 1. Check current data
    console.log('📊 Checking current data...');
    const categoriesResponse = await axios.get(`${API_URL}/api/categories`);
    const productsResponse = await axios.get(`${API_URL}/api/products`);
    const locationsResponse = await axios.get(`${API_URL}/api/delivery/locations`);

    console.log(`Categories: ${categoriesResponse.data.length}`);
    console.log(`Products: ${productsResponse.data.length}`);
    console.log(`Delivery Locations: ${locationsResponse.data.length}\n`);

    // 2. Seed products if none exist
    if (productsResponse.data.length === 0) {
      console.log('🛍️ Adding sample products...');
      
      const sampleProducts = [
        {
          name: "Premium Kitchen Utensil Set",
          description: "Complete 12-piece stainless steel kitchen utensil set perfect for modern Kenyan homes",
          price: 2500,
          categoryId: categoriesResponse.data[0]?.id,
          stock: 50,
          images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500"],
          isActive: true
        },
        {
          name: "Ceramic Dinner Plate Set",
          description: "Beautiful 6-piece ceramic dinner plate set, dishwasher safe",
          price: 1800,
          categoryId: categoriesResponse.data[1]?.id,
          stock: 30,
          images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500"],
          isActive: true
        },
        {
          name: "Non-Stick Cooking Pan",
          description: "High-quality non-stick frying pan, 28cm diameter",
          price: 1200,
          categoryId: categoriesResponse.data[0]?.id,
          stock: 25,
          images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500"],
          isActive: true
        }
      ];

      for (const product of sampleProducts) {
        try {
          const response = await axios.post(`${API_URL}/api/products`, product);
          console.log(`✅ Added: ${product.name}`);
        } catch (error) {
          console.log(`❌ Failed to add ${product.name}: ${error.response?.data?.message || error.message}`);
        }
      }
    }

    // 3. Seed delivery locations if none exist
    if (locationsResponse.data.length === 0) {
      console.log('\n🚚 Adding delivery locations...');
      
      const locations = [
        { name: "Nairobi CBD", cost: 200, estimatedDays: 1 },
        { name: "Westlands", cost: 250, estimatedDays: 1 },
        { name: "Karen", cost: 300, estimatedDays: 2 },
        { name: "Kiambu", cost: 350, estimatedDays: 2 },
        { name: "Thika", cost: 400, estimatedDays: 3 }
      ];

      for (const location of locations) {
        try {
          const response = await axios.post(`${API_URL}/api/delivery/locations`, location);
          console.log(`✅ Added location: ${location.name}`);
        } catch (error) {
          console.log(`❌ Failed to add ${location.name}: ${error.response?.data?.message || error.message}`);
        }
      }
    }

    // 4. Final verification
    console.log('\n🔍 Final verification...');
    const finalCategories = await axios.get(`${API_URL}/api/categories`);
    const finalProducts = await axios.get(`${API_URL}/api/products`);
    const finalLocations = await axios.get(`${API_URL}/api/delivery/locations`);

    console.log(`✅ Categories: ${finalCategories.data.length}`);
    console.log(`✅ Products: ${finalProducts.data.length}`);
    console.log(`✅ Delivery Locations: ${finalLocations.data.length}`);

    console.log('\n🎉 Production data seeding completed!');
    console.log(`🌍 Visit: https://householdplanetkenya.co.ke`);

  } catch (error) {
    console.error('❌ Error seeding production data:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

seedProductionData();