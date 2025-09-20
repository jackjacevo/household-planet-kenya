const axios = require('axios');

async function seedProductionData() {
  try {
    console.log('🌱 Seeding production database with sample data...');
    
    // Login as admin first
    const loginResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
      email: 'admin@householdplanet.co.ke',
      password: 'Admin@2025'
    });
    
    const token = loginResponse.data.accessToken;
    const headers = { 'Authorization': `Bearer ${token}` };
    
    // Create categories
    console.log('📂 Creating categories...');
    const categories = [
      { name: 'Kitchen & Dining', description: 'Kitchen appliances, cookware, and dining essentials' },
      { name: 'Home Cleaning', description: 'Cleaning supplies and equipment' },
      { name: 'Bathroom Essentials', description: 'Bathroom accessories and toiletries' },
      { name: 'Storage & Organization', description: 'Storage solutions and organizers' },
    ];
    
    const createdCategories = [];
    for (const category of categories) {
      try {
        const response = await axios.post('https://api.householdplanetkenya.co.ke/api/admin/categories', category, { headers });
        createdCategories.push(response.data);
        console.log(`✅ Created category: ${category.name}`);
      } catch (error) {
        console.log(`⚠️ Category ${category.name} might already exist`);
      }
    }
    
    // Create products
    console.log('🛍️ Creating products...');
    const products = [
      {
        name: 'Non-Stick Frying Pan Set',
        sku: 'KIT-PAN-001',
        description: 'Professional grade non-stick frying pan set with heat-resistant handles',
        shortDescription: '3-piece non-stick frying pan set',
        price: 2500,
        comparePrice: 3000,
        categoryId: 1,
        stock: 50,
        isFeatured: true,
        tags: ['kitchen', 'cookware', 'non-stick'],
        images: []
      },
      {
        name: 'All-Purpose Cleaner 500ml',
        sku: 'CLN-APC-001',
        description: 'Multi-surface cleaner suitable for kitchen, bathroom, and general cleaning',
        shortDescription: 'Multi-surface cleaning solution',
        price: 350,
        comparePrice: 450,
        categoryId: 2,
        stock: 100,
        isFeatured: true,
        tags: ['cleaning', 'household', 'multi-surface'],
        images: []
      },
      {
        name: 'Storage Basket Set',
        sku: 'STO-BAS-001',
        description: 'Set of 3 woven storage baskets in different sizes for home organization',
        shortDescription: '3-piece storage basket set',
        price: 1200,
        comparePrice: 1500,
        categoryId: 4,
        stock: 30,
        isFeatured: true,
        tags: ['storage', 'organization', 'baskets'],
        images: []
      }
    ];
    
    for (const product of products) {
      try {
        const response = await axios.post('https://api.householdplanetkenya.co.ke/api/admin/products', product, { headers });
        console.log(`✅ Created product: ${product.name}`);
      } catch (error) {
        console.log(`⚠️ Product ${product.name} creation failed:`, error.response?.data?.message || error.message);
      }
    }
    
    console.log('🎉 Production database seeded successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.response?.data || error.message);
  }
}

seedProductionData();