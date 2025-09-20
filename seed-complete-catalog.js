const axios = require('axios');

async function seedCompleteCatalog() {
  try {
    console.log('🌱 Seeding complete product catalog to production...');
    
    // Login as admin
    const loginResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
      email: 'admin@householdplanet.co.ke',
      password: 'Admin@2025'
    });
    
    const token = loginResponse.data.accessToken;
    const headers = { 'Authorization': `Bearer ${token}` };
    
    // Create all 14 categories
    console.log('📂 Creating 14 product categories...');
    const categories = [
      { name: 'Kitchen and Dining', description: 'Cookware, Utensils, Dinnerware, Appliances, Storage' },
      { name: 'Bathroom Accessories', description: 'Towels, Mats, Organizers, Fixtures, Decor' },
      { name: 'Cleaning and Laundry', description: 'Cleaning Supplies, Tools, Laundry Accessories' },
      { name: 'Beddings and Bedroom Accessories', description: 'Sheets, Comforters, Pillows, Mattress Protectors' },
      { name: 'Storage and Organization', description: 'Containers, Shelving, Closet Organizers, Baskets' },
      { name: 'Home Decor and Accessories', description: 'Wall Art, Decorative Items, Rugs, Curtains' },
      { name: 'Jewelry', description: 'Fashion Jewelry, Jewelry Boxes, Accessories' },
      { name: 'Humidifier, Candles and Aromatherapy', description: 'Essential Oils, Diffusers, Scented Candles' },
      { name: 'Beauty and Cosmetics', description: 'Skincare, Makeup, Tools, Mirrors' },
      { name: 'Home Appliances', description: 'Small Appliances, Kitchen Gadgets, Electronics' },
      { name: 'Furniture', description: 'Living Room, Bedroom, Dining, Office Furniture' },
      { name: 'Outdoor and Garden', description: 'Patio Furniture, Garden Tools, Planters' },
      { name: 'Lighting and Electrical', description: 'Lamps, Fixtures, Bulbs, Extension Cords' },
      { name: 'Bags and Belts', description: 'Handbags, Backpacks, Belts, Accessories' }
    ];
    
    const createdCategories = [];
    for (const category of categories) {
      try {
        const response = await axios.post('https://api.householdplanetkenya.co.ke/api/admin/categories', category, { headers });
        createdCategories.push(response.data);
        console.log(`✅ Created: ${category.name}`);
      } catch (error) {
        console.log(`⚠️ ${category.name} might already exist`);
      }
    }
    
    // Create sample products for each category
    console.log('🛍️ Creating sample products...');
    const products = [
      // Kitchen and Dining
      { name: 'Non-Stick Frying Pan Set', sku: 'KIT-PAN-001', description: '3-piece non-stick frying pan set', price: 2500, comparePrice: 3000, categoryId: 1, stock: 50, isFeatured: true },
      { name: 'Stainless Steel Cookware Set', sku: 'KIT-COO-001', description: '7-piece stainless steel cookware set', price: 4500, comparePrice: 5500, categoryId: 1, stock: 30, isFeatured: true },
      { name: 'Ceramic Dinner Set', sku: 'KIT-DIN-001', description: '16-piece ceramic dinner set', price: 3200, comparePrice: 4000, categoryId: 1, stock: 25, isFeatured: false },
      
      // Bathroom Accessories
      { name: 'Cotton Bath Towel Set', sku: 'BAT-TOW-001', description: '6-piece cotton bath towel set', price: 1800, comparePrice: 2200, categoryId: 2, stock: 40, isFeatured: true },
      { name: 'Bamboo Bath Mat', sku: 'BAT-MAT-001', description: 'Natural bamboo bath mat', price: 800, comparePrice: 1000, categoryId: 2, stock: 60, isFeatured: false },
      
      // Cleaning and Laundry
      { name: 'All-Purpose Cleaner 500ml', sku: 'CLN-APC-001', description: 'Multi-surface cleaning solution', price: 350, comparePrice: 450, categoryId: 3, stock: 100, isFeatured: true },
      { name: 'Microfiber Cleaning Cloths', sku: 'CLN-CLO-001', description: 'Pack of 12 microfiber cloths', price: 600, comparePrice: 800, categoryId: 3, stock: 80, isFeatured: false },
      
      // Beddings and Bedroom
      { name: 'Cotton Bed Sheet Set', sku: 'BED-SHE-001', description: 'Queen size cotton bed sheet set', price: 2200, comparePrice: 2800, categoryId: 4, stock: 35, isFeatured: true },
      { name: 'Memory Foam Pillow', sku: 'BED-PIL-001', description: 'Ergonomic memory foam pillow', price: 1500, comparePrice: 2000, categoryId: 4, stock: 45, isFeatured: false },
      
      // Storage and Organization
      { name: 'Storage Basket Set', sku: 'STO-BAS-001', description: '3-piece woven storage basket set', price: 1200, comparePrice: 1500, categoryId: 5, stock: 30, isFeatured: true },
      { name: 'Plastic Storage Containers', sku: 'STO-CON-001', description: 'Set of 10 airtight containers', price: 900, comparePrice: 1200, categoryId: 5, stock: 55, isFeatured: false },
      
      // Home Decor
      { name: 'Decorative Wall Mirror', sku: 'DEC-MIR-001', description: 'Round decorative wall mirror', price: 2800, comparePrice: 3500, categoryId: 6, stock: 20, isFeatured: true },
      { name: 'Throw Pillow Covers', sku: 'DEC-PIL-001', description: 'Set of 4 decorative pillow covers', price: 800, comparePrice: 1000, categoryId: 6, stock: 70, isFeatured: false },
      
      // Beauty and Cosmetics
      { name: 'Skincare Gift Set', sku: 'BEA-SKI-001', description: 'Complete skincare routine set', price: 3500, comparePrice: 4200, categoryId: 9, stock: 25, isFeatured: true },
      { name: 'Makeup Brush Set', sku: 'BEA-BRU-001', description: '12-piece professional makeup brush set', price: 1800, comparePrice: 2400, categoryId: 9, stock: 40, isFeatured: false },
      
      // Home Appliances
      { name: 'Electric Kettle 1.7L', sku: 'APP-KET-001', description: 'Stainless steel electric kettle', price: 2200, comparePrice: 2800, categoryId: 10, stock: 35, isFeatured: true },
      { name: 'Blender 1.5L', sku: 'APP-BLE-001', description: 'High-speed blender with multiple settings', price: 3800, comparePrice: 4500, categoryId: 10, stock: 20, isFeatured: false }
    ];
    
    let createdCount = 0;
    for (const product of products) {
      try {
        const response = await axios.post('https://api.householdplanetkenya.co.ke/api/admin/products', product, { headers });
        createdCount++;
        console.log(`✅ Created: ${product.name}`);
      } catch (error) {
        console.log(`❌ Failed to create: ${product.name} - ${error.response?.data?.message || error.message}`);
      }
    }
    
    console.log(`\n🎉 Catalog seeding completed!`);
    console.log(`📂 Categories: ${categories.length} created`);
    console.log(`🛍️ Products: ${createdCount}/${products.length} created`);
    console.log(`✨ Featured products: ${products.filter(p => p.isFeatured).length}`);
    
    // Test the results
    const finalProductsResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/products');
    const finalCategoriesResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/categories');
    
    console.log(`\n📊 Final count:`);
    console.log(`- Public products: ${finalProductsResponse.data.products?.length || 0}`);
    console.log(`- Public categories: ${finalCategoriesResponse.data?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.response?.data || error.message);
  }
}

seedCompleteCatalog();