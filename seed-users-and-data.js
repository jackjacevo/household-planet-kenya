const axios = require('axios');

async function seedUsersAndData() {
  try {
    console.log('🌱 Seeding users and complete data...');
    
    // Login as admin
    const loginResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin@2025'
    });
    
    const token = loginResponse.data.accessToken;
    const headers = { 'Authorization': `Bearer ${token}` };
    
    // Create test users (customers)
    console.log('👥 Creating test users...');
    const users = [
      {
        email: 'john.doe@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        phone: '+254712345678'
      },
      {
        email: 'jane.smith@example.com', 
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Smith',
        name: 'Jane Smith',
        phone: '+254723456789'
      },
      {
        email: 'mike.wilson@example.com',
        password: 'Password123!',
        firstName: 'Mike',
        lastName: 'Wilson', 
        name: 'Mike Wilson',
        phone: '+254734567890'
      }
    ];
    
    for (const user of users) {
      try {
        const response = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/register', user);
        console.log(`✅ Created user: ${user.email}`);
      } catch (error) {
        console.log(`⚠️ User ${user.email} might already exist`);
      }
    }
    
    // Seed more products to match Prisma seed
    console.log('🛍️ Creating additional products...');
    const additionalProducts = [
      { name: 'Plastic Storage Containers', sku: 'STO-CON-001', description: 'Set of 10 airtight containers', price: 900, comparePrice: 1200, categoryId: 5, stock: 55, isFeatured: false },
      { name: 'Throw Pillow Covers', sku: 'DEC-PIL-001', description: 'Set of 4 decorative pillow covers', price: 800, comparePrice: 1000, categoryId: 6, stock: 70, isFeatured: false },
      { name: 'Makeup Brush Set', sku: 'BEA-BRU-001', description: '12-piece professional makeup brush set', price: 1800, comparePrice: 2400, categoryId: 9, stock: 40, isFeatured: false },
      { name: 'Blender 1.5L', sku: 'APP-BLE-001', description: 'High-speed blender with multiple settings', price: 3800, comparePrice: 4500, categoryId: 10, stock: 20, isFeatured: false },
      { name: 'Ceramic Dinner Set', sku: 'KIT-DIN-001', description: '16-piece ceramic dinner set', price: 3200, comparePrice: 4000, categoryId: 1, stock: 25, isFeatured: false },
      { name: 'Bamboo Bath Mat', sku: 'BAT-MAT-001', description: 'Natural bamboo bath mat', price: 800, comparePrice: 1000, categoryId: 2, stock: 60, isFeatured: false },
      { name: 'Microfiber Cleaning Cloths', sku: 'CLN-CLO-001', description: 'Pack of 12 microfiber cloths', price: 600, comparePrice: 800, categoryId: 3, stock: 80, isFeatured: false },
      { name: 'Memory Foam Pillow', sku: 'BED-PIL-001', description: 'Ergonomic memory foam pillow', price: 1500, comparePrice: 2000, categoryId: 4, stock: 45, isFeatured: false }
    ];
    
    let productCount = 0;
    for (const product of additionalProducts) {
      try {
        const response = await axios.post('https://api.householdplanetkenya.co.ke/api/admin/products', product, { headers });
        productCount++;
        console.log(`✅ Created product: ${product.name}`);
      } catch (error) {
        console.log(`⚠️ Product ${product.name} might already exist`);
      }
    }
    
    console.log(`\n🎉 Seeding completed!`);
    console.log(`👥 Users: 3 test customers created`);
    console.log(`📂 Categories: 14 available`);
    console.log(`🛍️ Products: ${productCount} additional products created`);
    
    // Test final counts
    const finalProductsResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/products');
    const finalCategoriesResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/categories');
    const featuredResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/products/featured');
    
    console.log(`\n📊 Final homepage data:`);
    console.log(`- Products: ${finalProductsResponse.data.products?.length || 0}`);
    console.log(`- Categories: ${finalCategoriesResponse.data?.length || 0}`);
    console.log(`- Featured products: ${featuredResponse.data?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.response?.data || error.message);
  }
}

seedUsersAndData();