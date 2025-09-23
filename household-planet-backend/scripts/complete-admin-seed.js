const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function completeAdminSeed() {
  try {
    console.log('🌱 Seeding complete admin dashboard data...');

    // Clear existing data
    await prisma.promoCodeUsage.deleteMany({});
    await prisma.promoCode.deleteMany({});
    await prisma.adminActivity.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.brand.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.setting.deleteMany({});

    // Create admin and staff users
    const adminPassword = await bcrypt.hash('Admin@2025', 12);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@householdplanetkenya.co.ke',
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

    const staffPassword = await bcrypt.hash('Staff@2025', 12);
    const staff1 = await prisma.user.create({
      data: {
        email: 'staff1@householdplanetkenya.co.ke',
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

    // Create brands
    const brands = [
      { name: 'Samsung', slug: 'samsung', logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100', isActive: true },
      { name: 'LG', slug: 'lg', logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100', isActive: true },
      { name: 'Philips', slug: 'philips', logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100', isActive: true },
      { name: 'Tefal', slug: 'tefal', logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100', isActive: true },
      { name: 'Pyrex', slug: 'pyrex', logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100', isActive: true },
      { name: 'Tupperware', slug: 'tupperware', logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100', isActive: true }
    ];

    const createdBrands = [];
    for (const brand of brands) {
      const created = await prisma.brand.create({ data: brand });
      createdBrands.push(created);
    }

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

    // Create products with brands
    const products = [
      { name: 'Samsung Non-Stick Frying Pan Set', slug: 'samsung-non-stick-frying-pan-set', sku: 'SAM-PAN-001', description: '3-piece Samsung non-stick frying pan set', price: 2500, comparePrice: 3000, categoryId: createdCategories[0].id, brandId: createdBrands[0].id, stock: 45, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500']), tags: JSON.stringify(['kitchen', 'cookware']), totalSales: 156, viewCount: 1240 },
      { name: 'LG Stainless Steel Cookware Set', slug: 'lg-stainless-steel-cookware-set', sku: 'LG-COO-002', description: '7-piece LG stainless steel cookware set', price: 4500, comparePrice: 5500, categoryId: createdCategories[0].id, brandId: createdBrands[1].id, stock: 28, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1584990347498-7895d9d6e2d8?w=500']), tags: JSON.stringify(['kitchen', 'cookware']), totalSales: 89, viewCount: 890 },
      { name: 'Pyrex Ceramic Dinnerware Set', slug: 'pyrex-ceramic-dinnerware-set', sku: 'PYR-DIN-003', description: '16-piece Pyrex ceramic dinnerware set', price: 3200, comparePrice: 4000, categoryId: createdCategories[0].id, brandId: createdBrands[4].id, stock: 22, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500']), tags: JSON.stringify(['kitchen', 'dinnerware']), totalSales: 67, viewCount: 567 },
      { name: 'Cotton Bath Towel Set', slug: 'cotton-bath-towel-set', sku: 'BAT-TOW-004', description: '6-piece premium cotton bath towel set', price: 1800, comparePrice: 2200, categoryId: createdCategories[1].id, stock: 35, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=500']), tags: JSON.stringify(['bathroom', 'towels']), totalSales: 134, viewCount: 789 },
      { name: 'All-Purpose Cleaner 500ml', slug: 'all-purpose-cleaner-500ml', sku: 'CLN-APC-006', description: 'Multi-surface cleaning solution', price: 350, comparePrice: 450, categoryId: createdCategories[2].id, stock: 89, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500']), tags: JSON.stringify(['cleaning']), totalSales: 267, viewCount: 1456 },
      { name: 'Cotton Bed Sheet Set', slug: 'cotton-bed-sheet-set', sku: 'BED-SHE-008', description: 'Queen size 100% cotton bed sheet set', price: 2200, comparePrice: 2800, categoryId: createdCategories[3].id, stock: 31, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500']), tags: JSON.stringify(['bedding']), totalSales: 98, viewCount: 567 },
      { name: 'Tupperware Storage Basket Set', slug: 'tupperware-storage-basket-set', sku: 'TUP-BAS-010', description: '3-piece Tupperware storage basket set', price: 1200, comparePrice: 1500, categoryId: createdCategories[4].id, brandId: createdBrands[5].id, stock: 27, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500']), tags: JSON.stringify(['storage']), totalSales: 112, viewCount: 678 },
      { name: 'Decorative Wall Mirror', slug: 'decorative-wall-mirror', sku: 'DEC-MIR-012', description: 'Round decorative wall mirror with gold frame', price: 2800, comparePrice: 3500, categoryId: createdCategories[5].id, stock: 15, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500']), tags: JSON.stringify(['decor']), totalSales: 34, viewCount: 234 },
      { name: 'Skincare Gift Set', slug: 'skincare-gift-set', sku: 'BEA-SKI-014', description: 'Complete skincare routine set', price: 3500, comparePrice: 4200, categoryId: createdCategories[6].id, stock: 21, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500']), tags: JSON.stringify(['beauty']), totalSales: 78, viewCount: 456 },
      { name: 'Philips Electric Kettle 1.7L', slug: 'philips-electric-kettle-17l', sku: 'PHI-KET-016', description: 'Philips stainless steel electric kettle', price: 2200, comparePrice: 2800, categoryId: createdCategories[7].id, brandId: createdBrands[2].id, stock: 33, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500']), tags: JSON.stringify(['appliances']), totalSales: 89, viewCount: 567 }
    ];

    const createdProducts = [];
    for (const product of products) {
      const created = await prisma.product.create({ data: product });
      createdProducts.push(created);
    }

    // Create customers
    const customers = [
      { email: 'john.doe@gmail.com', firstName: 'John', lastName: 'Doe', name: 'John Doe', role: 'CUSTOMER', emailVerified: true, isActive: true },
      { email: 'jane.smith@yahoo.com', firstName: 'Jane', lastName: 'Smith', name: 'Jane Smith', role: 'CUSTOMER', emailVerified: true, isActive: true },
      { email: 'mike.johnson@outlook.com', firstName: 'Mike', lastName: 'Johnson', name: 'Mike Johnson', role: 'CUSTOMER', emailVerified: true, isActive: true },
      { email: 'sarah.wilson@gmail.com', firstName: 'Sarah', lastName: 'Wilson', name: 'Sarah Wilson', role: 'CUSTOMER', emailVerified: true, isActive: true },
      { email: 'david.brown@gmail.com', firstName: 'David', lastName: 'Brown', name: 'David Brown', role: 'CUSTOMER', emailVerified: true, isActive: true }
    ];

    const createdCustomers = [];
    for (const customer of customers) {
      const password = await bcrypt.hash('password123', 12);
      const created = await prisma.user.create({
        data: { ...customer, password }
      });
      createdCustomers.push(created);
    }

    // Create promo codes
    const promoCodes = [
      {
        code: 'WELCOME20',
        name: '20% Welcome Discount',
        description: 'Welcome discount for new customers',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderAmount: 1000,
        maxDiscount: 500,
        usageLimit: 100,
        usageCount: 15,
        userUsageLimit: 1,
        isActive: true,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        createdBy: 'admin'
      },
      {
        code: 'SAVE50',
        name: 'KSh 50 Off',
        description: 'Fixed discount of KSh 50',
        discountType: 'FIXED',
        discountValue: 50,
        minOrderAmount: 500,
        usageLimit: 200,
        usageCount: 45,
        userUsageLimit: 3,
        isActive: true,
        validFrom: new Date(),
        createdBy: 'admin'
      },
      {
        code: 'BULK15',
        name: '15% Bulk Order Discount',
        description: 'Discount for bulk orders',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        minOrderAmount: 5000,
        maxDiscount: 1000,
        usageLimit: 50,
        usageCount: 8,
        userUsageLimit: 2,
        isActive: true,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        createdBy: 'admin'
      },
      {
        code: 'EXPIRED10',
        name: '10% Expired Code',
        description: 'This code has expired',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 1000,
        usageLimit: 100,
        usageCount: 25,
        userUsageLimit: 1,
        isActive: false,
        validFrom: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        validUntil: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        createdBy: 'admin'
      }
    ];

    const createdPromoCodes = [];
    for (const promoCode of promoCodes) {
      const created = await prisma.promoCode.create({ data: promoCode });
      createdPromoCodes.push(created);
    }

    // Create orders with realistic distribution
    const counties = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Machakos', 'Kiambu'];
    const statuses = ['COMPLETED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'PENDING'];
    const paymentMethods = ['M_PESA', 'CARD', 'CASH_ON_DELIVERY'];
    
    const orders = [];
    const now = new Date();
    
    // Create 30 orders spread over the last 30 days
    for (let i = 0; i < 30; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const orderDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      const customer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
      const county = counties[Math.floor(Math.random() * counties.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      const numItems = Math.floor(Math.random() * 3) + 1;
      let subtotal = 0;
      const orderItems = [];
      
      for (let j = 0; j < numItems; j++) {
        const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
        const quantity = Math.floor(Math.random() * 2) + 1;
        const itemTotal = product.price * quantity;
        subtotal += itemTotal;
        
        orderItems.push({
          productId: product.id,
          quantity,
          price: product.price,
          total: itemTotal
        });
      }
      
      // Apply promo code to some orders
      let discountAmount = 0;
      let promoCode = null;
      if (Math.random() < 0.3) { // 30% chance of promo code usage
        promoCode = createdPromoCodes[Math.floor(Math.random() * createdPromoCodes.length)].code;
        if (promoCode === 'WELCOME20') {
          discountAmount = Math.min(subtotal * 0.2, 500);
        } else if (promoCode === 'SAVE50') {
          discountAmount = 50;
        } else if (promoCode === 'BULK15') {
          discountAmount = Math.min(subtotal * 0.15, 1000);
        }
      }
      
      const shippingCost = Math.floor(Math.random() * 500) + 100;
      const total = subtotal + shippingCost - discountAmount;
      
      orders.push({
        userId: customer.id,
        orderNumber: `HP${Date.now() + i}`,
        status,
        total,
        subtotal,
        discountAmount,
        promoCode,
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
      
      for (const item of items) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            ...item
          }
        });
      }
      
      // Create promo code usage if applicable
      if (orderInfo.promoCode) {
        const promoCodeRecord = createdPromoCodes.find(pc => pc.code === orderInfo.promoCode);
        if (promoCodeRecord) {
          await prisma.promoCodeUsage.create({
            data: {
              promoCodeId: promoCodeRecord.id,
              userId: orderInfo.userId,
              orderId: order.id,
              discountAmount: orderInfo.discountAmount,
              orderAmount: orderInfo.subtotal,
              usedAt: orderInfo.createdAt
            }
          });
        }
      }
      
      createdOrders.push(order);
    }

    // Create admin activities
    const activities = [
      { userId: admin.id, action: 'LOGIN', details: 'Admin logged in to dashboard', entityType: 'USER', entityId: admin.id, ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0', createdAt: new Date(now.getTime() - (1 * 60 * 60 * 1000)) },
      { userId: admin.id, action: 'PRODUCT_CREATE', details: 'Created new product: Samsung Non-Stick Frying Pan Set', entityType: 'PRODUCT', entityId: createdProducts[0].id, ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0', createdAt: new Date(now.getTime() - (2 * 60 * 60 * 1000)) },
      { userId: staff1.id, action: 'ORDER_UPDATE', details: 'Updated order status to SHIPPED', entityType: 'ORDER', entityId: createdOrders[0].id, ipAddress: '192.168.1.2', userAgent: 'Mozilla/5.0', createdAt: new Date(now.getTime() - (3 * 60 * 60 * 1000)) },
      { userId: admin.id, action: 'PROMO_CREATE', details: 'Created promo code: WELCOME20', entityType: 'PROMO_CODE', entityId: createdPromoCodes[0].id, ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0', createdAt: new Date(now.getTime() - (4 * 60 * 60 * 1000)) },
      { userId: admin.id, action: 'BRAND_CREATE', details: 'Created new brand: Samsung', entityType: 'BRAND', entityId: createdBrands[0].id, ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0', createdAt: new Date(now.getTime() - (5 * 60 * 60 * 1000)) },
      { userId: staff1.id, action: 'CUSTOMER_VIEW', details: 'Viewed customer profile', entityType: 'USER', entityId: createdCustomers[0].id, ipAddress: '192.168.1.2', userAgent: 'Mozilla/5.0', createdAt: new Date(now.getTime() - (6 * 60 * 60 * 1000)) }
    ];

    for (const activity of activities) {
      await prisma.adminActivity.create({ data: activity });
    }

    // Create delivery locations
    const deliveryLocations = [
      { name: 'Nairobi CBD', tier: 1, price: 100, description: 'Orders within CBD only', estimatedDays: 1, expressAvailable: true, expressPrice: 200 },
      { name: 'Westlands', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
      { name: 'Karen', tier: 3, price: 650, estimatedDays: 3, expressAvailable: true, expressPrice: 850 },
      { name: 'JKIA', tier: 4, price: 700, estimatedDays: 2, expressAvailable: true, expressPrice: 900 }
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

    console.log('✅ Complete admin dashboard seeding successful:');
    console.log(`- 1 Admin user (admin@householdplanetkenya.co.ke / Admin@2025)`);
    console.log(`- 1 Staff user (staff1@householdplanetkenya.co.ke / Staff@2025)`);
    console.log(`- ${createdBrands.length} brands`);
    console.log(`- ${createdCategories.length} categories`);
    console.log(`- ${createdProducts.length} products with brands`);
    console.log(`- ${createdCustomers.length} customers`);
    console.log(`- ${createdOrders.length} orders with realistic data`);
    console.log(`- ${createdPromoCodes.length} promo codes (active and expired)`);
    console.log(`- ${activities.length} admin activities`);
    console.log(`- ${deliveryLocations.length} delivery locations`);

  } catch (error) {
    console.error('❌ Complete admin seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { completeAdminSeed };

if (require.main === module) {
  completeAdminSeed();
}