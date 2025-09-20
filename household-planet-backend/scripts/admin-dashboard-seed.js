const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAdminDashboard() {
  try {
    console.log('🌱 Seeding comprehensive admin dashboard data...');

    // Clear existing data first
    await prisma.adminActivity.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.setting.deleteMany({});

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin@2025', 12);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@householdplanet.co.ke',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        name: 'Admin User',
        role: 'SUPER_ADMIN',
        emailVerified: true,
        isActive: true,
        permissions: JSON.stringify(['admin:read', 'admin:write', 'admin:delete', 'orders:read', 'orders:write'])
      }
    });

    // Create staff users
    const staffPassword = await bcrypt.hash('Staff@2025', 12);
    const staff1 = await prisma.user.create({
      data: {
        email: 'staff1@householdplanet.co.ke',
        password: staffPassword,
        firstName: 'Jane',
        lastName: 'Smith',
        name: 'Jane Smith',
        role: 'STAFF',
        emailVerified: true,
        isActive: true,
        permissions: JSON.stringify(['orders:read', 'orders:write', 'products:read'])
      }
    });

    const staff2 = await prisma.user.create({
      data: {
        email: 'staff2@householdplanet.co.ke',
        password: staffPassword,
        firstName: 'Mike',
        lastName: 'Johnson',
        name: 'Mike Johnson',
        role: 'STAFF',
        emailVerified: true,
        isActive: true,
        permissions: JSON.stringify(['orders:read', 'customers:read'])
      }
    });

    // Create categories
    const categories = [
      { name: 'Kitchen and Dining', slug: 'kitchen-dining', description: 'Cookware, Utensils, Dinnerware, Appliances, Storage', isActive: true },
      { name: 'Bathroom Accessories', slug: 'bathroom-accessories', description: 'Towels, Mats, Organizers, Fixtures, Decor', isActive: true },
      { name: 'Cleaning and Laundry', slug: 'cleaning-laundry', description: 'Cleaning Supplies, Tools, Laundry Accessories', isActive: true },
      { name: 'Beddings and Bedroom Accessories', slug: 'beddings-bedroom', description: 'Sheets, Comforters, Pillows, Mattress Protectors', isActive: true },
      { name: 'Storage and Organization', slug: 'storage-organization', description: 'Containers, Shelving, Closet Organizers, Baskets', isActive: true },
      { name: 'Home Decor and Accessories', slug: 'home-decor', description: 'Wall Art, Decorative Items, Rugs, Curtains', isActive: true },
      { name: 'Beauty and Cosmetics', slug: 'beauty-cosmetics', description: 'Skincare, Makeup, Tools, Mirrors', isActive: true },
      { name: 'Home Appliances', slug: 'home-appliances', description: 'Small Appliances, Kitchen Gadgets, Electronics', isActive: true }
    ];

    const createdCategories = [];
    for (const category of categories) {
      const created = await prisma.category.create({ data: category });
      createdCategories.push(created);
    }

    // Create comprehensive products with realistic data
    const products = [
      // Kitchen & Dining - High sales
      { name: 'Non-Stick Frying Pan Set', slug: 'non-stick-frying-pan-set', sku: 'KIT-PAN-001', description: '3-piece non-stick frying pan set with ergonomic handles', price: 2500, comparePrice: 3000, categoryId: createdCategories[0].id, stock: 45, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500']), tags: JSON.stringify(['kitchen', 'cookware', 'non-stick']), totalSales: 156, viewCount: 1240 },
      { name: 'Stainless Steel Cookware Set', slug: 'stainless-steel-cookware-set', sku: 'KIT-COO-002', description: '7-piece stainless steel cookware set with glass lids', price: 4500, comparePrice: 5500, categoryId: createdCategories[0].id, stock: 28, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1584990347498-7895d9d6e2d8?w=500']), tags: JSON.stringify(['kitchen', 'cookware', 'stainless-steel']), totalSales: 89, viewCount: 890 },
      { name: 'Ceramic Dinnerware Set', slug: 'ceramic-dinnerware-set', sku: 'KIT-DIN-003', description: '16-piece ceramic dinnerware set for 4 people', price: 3200, comparePrice: 4000, categoryId: createdCategories[0].id, stock: 22, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500']), tags: JSON.stringify(['kitchen', 'dinnerware', 'ceramic']), totalSales: 67, viewCount: 567 },
      
      // Bathroom - Medium sales
      { name: 'Cotton Bath Towel Set', slug: 'cotton-bath-towel-set', sku: 'BAT-TOW-004', description: '6-piece premium cotton bath towel set', price: 1800, comparePrice: 2200, categoryId: createdCategories[1].id, stock: 35, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=500']), tags: JSON.stringify(['bathroom', 'towels', 'cotton']), totalSales: 134, viewCount: 789 },
      { name: 'Bamboo Bathroom Organizer', slug: 'bamboo-bathroom-organizer', sku: 'BAT-ORG-005', description: 'Eco-friendly bamboo bathroom storage organizer', price: 1200, comparePrice: 1500, categoryId: createdCategories[1].id, stock: 18, isFeatured: false, images: JSON.stringify(['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500']), tags: JSON.stringify(['bathroom', 'organizer', 'bamboo']), totalSales: 45, viewCount: 234 },
      
      // Cleaning - High volume, low price
      { name: 'All-Purpose Cleaner 500ml', slug: 'all-purpose-cleaner-500ml', sku: 'CLN-APC-006', description: 'Multi-surface cleaning solution with fresh scent', price: 350, comparePrice: 450, categoryId: createdCategories[2].id, stock: 89, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500']), tags: JSON.stringify(['cleaning', 'multi-purpose']), totalSales: 267, viewCount: 1456 },
      { name: 'Microfiber Cleaning Cloths', slug: 'microfiber-cleaning-cloths', sku: 'CLN-MIC-007', description: 'Pack of 12 microfiber cleaning cloths', price: 800, comparePrice: 1000, categoryId: createdCategories[2].id, stock: 56, isFeatured: false, images: JSON.stringify(['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500']), tags: JSON.stringify(['cleaning', 'microfiber']), totalSales: 189, viewCount: 678 },
      
      // Bedding - Seasonal high sales
      { name: 'Cotton Bed Sheet Set', slug: 'cotton-bed-sheet-set', sku: 'BED-SHE-008', description: 'Queen size 100% cotton bed sheet set', price: 2200, comparePrice: 2800, categoryId: createdCategories[3].id, stock: 31, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500']), tags: JSON.stringify(['bedding', 'cotton', 'sheets']), totalSales: 98, viewCount: 567 },
      { name: 'Memory Foam Pillow', slug: 'memory-foam-pillow', sku: 'BED-PIL-009', description: 'Ergonomic memory foam pillow with cooling gel', price: 1500, comparePrice: 1800, categoryId: createdCategories[3].id, stock: 42, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500']), tags: JSON.stringify(['bedding', 'pillow', 'memory-foam']), totalSales: 76, viewCount: 445 },
      
      // Storage - Consistent sales
      { name: 'Storage Basket Set', slug: 'storage-basket-set', sku: 'STO-BAS-010', description: '3-piece woven storage basket set with handles', price: 1200, comparePrice: 1500, categoryId: createdCategories[4].id, stock: 27, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500']), tags: JSON.stringify(['storage', 'baskets', 'organization']), totalSales: 112, viewCount: 678 },
      { name: 'Plastic Storage Containers', slug: 'plastic-storage-containers', sku: 'STO-CON-011', description: 'Set of 10 airtight plastic storage containers', price: 1800, comparePrice: 2200, categoryId: createdCategories[4].id, stock: 38, isFeatured: false, images: JSON.stringify(['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500']), tags: JSON.stringify(['storage', 'containers', 'plastic']), totalSales: 67, viewCount: 345 },
      
      // Home Decor - Premium items
      { name: 'Decorative Wall Mirror', slug: 'decorative-wall-mirror', sku: 'DEC-MIR-012', description: 'Round decorative wall mirror with gold frame', price: 2800, comparePrice: 3500, categoryId: createdCategories[5].id, stock: 15, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500']), tags: JSON.stringify(['decor', 'mirror', 'wall-art']), totalSales: 34, viewCount: 234 },
      { name: 'Artificial Plant Set', slug: 'artificial-plant-set', sku: 'DEC-PLA-013', description: 'Set of 3 realistic artificial plants in pots', price: 1600, comparePrice: 2000, categoryId: createdCategories[5].id, stock: 23, isFeatured: false, images: JSON.stringify(['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500']), tags: JSON.stringify(['decor', 'plants', 'artificial']), totalSales: 45, viewCount: 189 },
      
      // Beauty - High margin
      { name: 'Skincare Gift Set', slug: 'skincare-gift-set', sku: 'BEA-SKI-014', description: 'Complete skincare routine set with cleanser, toner, and moisturizer', price: 3500, comparePrice: 4200, categoryId: createdCategories[6].id, stock: 21, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500']), tags: JSON.stringify(['beauty', 'skincare', 'gift-set']), totalSales: 78, viewCount: 456 },
      { name: 'Makeup Brush Set', slug: 'makeup-brush-set', sku: 'BEA-BRU-015', description: 'Professional 12-piece makeup brush set with case', price: 2200, comparePrice: 2800, categoryId: createdCategories[6].id, stock: 28, isFeatured: false, images: JSON.stringify(['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500']), tags: JSON.stringify(['beauty', 'makeup', 'brushes']), totalSales: 56, viewCount: 234 },
      
      // Appliances - High value
      { name: 'Electric Kettle 1.7L', slug: 'electric-kettle-17l', sku: 'APP-KET-016', description: 'Stainless steel electric kettle with auto shut-off', price: 2200, comparePrice: 2800, categoryId: createdCategories[7].id, stock: 33, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500']), tags: JSON.stringify(['appliances', 'kettle', 'electric']), totalSales: 89, viewCount: 567 },
      { name: 'Coffee Maker', slug: 'coffee-maker', sku: 'APP-COF-017', description: '12-cup programmable coffee maker with timer', price: 4500, comparePrice: 5500, categoryId: createdCategories[7].id, stock: 18, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500']), tags: JSON.stringify(['appliances', 'coffee', 'maker']), totalSales: 45, viewCount: 345 }
    ];

    const createdProducts = [];
    for (const product of products) {
      const created = await prisma.product.create({ data: product });
      createdProducts.push(created);
    }

    // Create diverse customers from different counties
    const customers = [
      { email: 'john.doe@gmail.com', firstName: 'John', lastName: 'Doe', name: 'John Doe', role: 'CUSTOMER', emailVerified: true, isActive: true },
      { email: 'jane.smith@yahoo.com', firstName: 'Jane', lastName: 'Smith', name: 'Jane Smith', role: 'CUSTOMER', emailVerified: true, isActive: true },
      { email: 'mike.johnson@outlook.com', firstName: 'Mike', lastName: 'Johnson', name: 'Mike Johnson', role: 'CUSTOMER', emailVerified: true, isActive: true },
      { email: 'sarah.wilson@gmail.com', firstName: 'Sarah', lastName: 'Wilson', name: 'Sarah Wilson', role: 'CUSTOMER', emailVerified: true, isActive: true },
      { email: 'david.brown@gmail.com', firstName: 'David', lastName: 'Brown', name: 'David Brown', role: 'CUSTOMER', emailVerified: true, isActive: true },
      { email: 'mary.davis@yahoo.com', firstName: 'Mary', lastName: 'Davis', name: 'Mary Davis', role: 'CUSTOMER', emailVerified: true, isActive: true },
      { email: 'peter.miller@gmail.com', firstName: 'Peter', lastName: 'Miller', name: 'Peter Miller', role: 'CUSTOMER', emailVerified: true, isActive: true },
      { email: 'lucy.garcia@outlook.com', firstName: 'Lucy', lastName: 'Garcia', name: 'Lucy Garcia', role: 'CUSTOMER', emailVerified: true, isActive: true }
    ];

    const createdCustomers = [];
    for (const customer of customers) {
      const password = await bcrypt.hash('password123', 12);
      const created = await prisma.user.create({
        data: { ...customer, password }
      });
      createdCustomers.push(created);
    }

    // Create orders with realistic distribution across time and counties
    const counties = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Machakos', 'Kiambu'];
    const statuses = ['COMPLETED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'PENDING'];
    const paymentMethods = ['M_PESA', 'CARD', 'CASH_ON_DELIVERY'];
    
    const orders = [];
    const now = new Date();
    
    // Create 25 orders spread over the last 30 days
    for (let i = 0; i < 25; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const orderDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      const customer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
      const county = counties[Math.floor(Math.random() * counties.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      // Calculate realistic totals based on products
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
      let subtotal = 0;
      const orderItems = [];
      
      for (let j = 0; j < numItems; j++) {
        const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
        const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 quantity
        const itemTotal = product.price * quantity;
        subtotal += itemTotal;
        
        orderItems.push({
          productId: product.id,
          quantity,
          price: product.price,
          total: itemTotal
        });
      }
      
      const shippingCost = Math.floor(Math.random() * 500) + 100; // 100-600 shipping
      const total = subtotal + shippingCost;
      
      orders.push({
        userId: customer.id,
        orderNumber: `HP${Date.now() + i}`,
        status,
        total,
        subtotal,
        shippingCost,
        paymentMethod,
        paymentStatus: status === 'COMPLETED' || status === 'DELIVERED' ? 'PAID' : 'PENDING',
        deliveryLocation: county,
        createdAt: orderDate,
        shippingAddress: JSON.stringify({
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: `+25471${Math.floor(Math.random() * 9000000) + 1000000}`,
          address: `${Math.floor(Math.random() * 999) + 1} Main Street`,
          city: county,
          county: county
        }),
        items: orderItems
      });
    }

    // Create orders and their items
    const createdOrders = [];
    for (const orderData of orders) {
      const { items, ...orderInfo } = orderData;
      const order = await prisma.order.create({ data: orderInfo });
      
      // Create order items
      for (const item of items) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            ...item
          }
        });
      }
      
      createdOrders.push(order);
    }

    // Create admin activities
    const activities = [
      { userId: admin.id, action: 'LOGIN', details: 'Admin logged in', entityType: 'USER', entityId: admin.id, ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0', createdAt: new Date(now.getTime() - (1 * 60 * 60 * 1000)) },
      { userId: admin.id, action: 'PRODUCT_CREATE', details: 'Created new product: Non-Stick Frying Pan Set', entityType: 'PRODUCT', entityId: createdProducts[0].id, ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0', createdAt: new Date(now.getTime() - (2 * 60 * 60 * 1000)) },
      { userId: staff1.id, action: 'ORDER_UPDATE', details: 'Updated order status to SHIPPED', entityType: 'ORDER', entityId: createdOrders[0].id, ipAddress: '192.168.1.2', userAgent: 'Mozilla/5.0', createdAt: new Date(now.getTime() - (3 * 60 * 60 * 1000)) },
      { userId: staff2.id, action: 'CUSTOMER_VIEW', details: 'Viewed customer profile', entityType: 'USER', entityId: createdCustomers[0].id, ipAddress: '192.168.1.3', userAgent: 'Mozilla/5.0', createdAt: new Date(now.getTime() - (4 * 60 * 60 * 1000)) },
      { userId: admin.id, action: 'CATEGORY_CREATE', details: 'Created new category: Kitchen and Dining', entityType: 'CATEGORY', entityId: createdCategories[0].id, ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0', createdAt: new Date(now.getTime() - (5 * 60 * 60 * 1000)) }
    ];

    for (const activity of activities) {
      await prisma.adminActivity.create({ data: activity });
    }

    // Create delivery locations (comprehensive Kenya coverage)
    const deliveryLocations = [
      // Tier 1 - Ksh 100-200
      { name: 'Nairobi CBD', tier: 1, price: 100, description: 'Orders within CBD only', estimatedDays: 1, expressAvailable: true, expressPrice: 200 },
      { name: 'Kajiado (Naekana)', tier: 1, price: 150, description: 'Via Naekana', estimatedDays: 2, expressAvailable: false },
      { name: 'Kitengela (Via Shuttle)', tier: 1, price: 150, description: 'Via Shuttle', estimatedDays: 2, expressAvailable: false },
      { name: 'Thika (Super Metrol)', tier: 1, price: 150, description: 'Via Super Metrol', estimatedDays: 2, expressAvailable: false },
      { name: 'Juja (Via Super Metrol)', tier: 1, price: 200, description: 'Via Super Metrol', estimatedDays: 3, expressAvailable: false },
      { name: 'Kikuyu Town (Super Metrol)', tier: 1, price: 200, description: 'Via Super Metrol', estimatedDays: 3, expressAvailable: false },
      
      // Tier 2 - Ksh 250-300 (sample - full list would be too long)
      { name: 'Pangani', tier: 2, price: 250, estimatedDays: 2, expressAvailable: true, expressPrice: 400 },
      { name: 'Upperhill', tier: 2, price: 250, estimatedDays: 2, expressAvailable: true, expressPrice: 400 },
      { name: 'Westlands', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
      { name: 'Eastleigh', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
      
      // Tier 3 - Ksh 350-400 (sample)
      { name: 'Karen', tier: 3, price: 650, estimatedDays: 3, expressAvailable: true, expressPrice: 850 },
      { name: 'Lavington', tier: 3, price: 350, estimatedDays: 2, expressAvailable: true, expressPrice: 500 },
      
      // Tier 4 - Ksh 450-1000
      { name: 'JKIA', tier: 4, price: 700, estimatedDays: 2, expressAvailable: true, expressPrice: 900 },
      { name: 'Ngong Town', tier: 4, price: 1000, estimatedDays: 5, expressAvailable: false }
    ];

    for (let i = 0; i < deliveryLocations.length; i++) {
      const location = deliveryLocations[i];
      const locationId = (Date.now() + i).toString();
      await prisma.setting.create({
        data: {
          category: 'delivery_locations',
          key: `location_${locationId}`,
          value: JSON.stringify({ ...location, isActive: true }),
          type: 'json',
          description: `Delivery location: ${location.name}`,
          isPublic: true
        }
      });
    }

    console.log('✅ Admin dashboard seeding completed successfully:');
    console.log(`- 1 Admin user (admin@householdplanet.co.ke / Admin@2025)`);
    console.log(`- 2 Staff users (staff1@householdplanet.co.ke, staff2@householdplanet.co.ke / Staff@2025)`);
    console.log(`- ${createdCategories.length} categories`);
    console.log(`- ${createdProducts.length} products with realistic sales data`);
    console.log(`- ${createdCustomers.length} customers`);
    console.log(`- ${createdOrders.length} orders across ${counties.length} counties`);
    console.log(`- ${activities.length} admin activities`);
    console.log(`- ${deliveryLocations.length} delivery locations`);
    console.log('- Realistic revenue, sales, and analytics data');

  } catch (error) {
    console.error('❌ Admin dashboard seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { seedAdminDashboard };

// Run if called directly
if (require.main === module) {
  seedAdminDashboard();
}