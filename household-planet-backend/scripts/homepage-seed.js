const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedHomepage() {
  try {
    console.log('🏠 Seeding homepage data...');

    // Clear existing data
    await prisma.promoCodeUsage.deleteMany({});
    await prisma.promoCode.deleteMany({});
    await prisma.blogPost.deleteMany({});
    await prisma.fAQ.deleteMany({});
    await prisma.emailTemplate.deleteMany({});
    await prisma.contentPage.deleteMany({});
    await prisma.banner.deleteMany({});
    await prisma.adminActivity.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.brand.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.setting.deleteMany({});

    // 1. Create Admin User
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
        permissions: JSON.stringify(['admin:read', 'admin:write', 'admin:delete'])
      }
    });

    // 2. Create Customers (for testimonials and orders)
    const customers = [
      { email: 'sarah.wanjiku@gmail.com', firstName: 'Sarah', lastName: 'Wanjiku', name: 'Sarah Wanjiku', role: 'CUSTOMER', emailVerified: true, isActive: true },
      { email: 'james.mwangi@yahoo.com', firstName: 'James', lastName: 'Mwangi', name: 'James Mwangi', role: 'CUSTOMER', emailVerified: true, isActive: true },
      { email: 'grace.akinyi@outlook.com', firstName: 'Grace', lastName: 'Akinyi', name: 'Grace Akinyi', role: 'CUSTOMER', emailVerified: true, isActive: true },
      { email: 'peter.kamau@gmail.com', firstName: 'Peter', lastName: 'Kamau', name: 'Peter Kamau', role: 'CUSTOMER', emailVerified: true, isActive: true },
      { email: 'mary.njeri@yahoo.com', firstName: 'Mary', lastName: 'Njeri', name: 'Mary Njeri', role: 'CUSTOMER', emailVerified: true, isActive: true }
    ];

    const createdCustomers = [];
    for (const customer of customers) {
      const password = await bcrypt.hash('password123', 12);
      const created = await prisma.user.create({
        data: { ...customer, password }
      });
      createdCustomers.push(created);
    }

    // 3. Create Brands
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

    // 4. Create Categories (for FeaturedCategories component)
    const categories = [
      { name: 'Kitchen and Dining', slug: 'kitchen-dining', description: 'Cookware, Utensils, Dinnerware, Appliances, Storage', isActive: true, image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=500' },
      { name: 'Bathroom Accessories', slug: 'bathroom-accessories', description: 'Towels, Mats, Organizers, Fixtures, Decor', isActive: true, image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500' },
      { name: 'Cleaning and Laundry', slug: 'cleaning-laundry', description: 'Cleaning Supplies, Tools, Laundry Accessories', isActive: true, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500' },
      { name: 'Beddings and Bedroom', slug: 'beddings-bedroom', description: 'Sheets, Comforters, Pillows, Mattress Protectors', isActive: true, image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500' },
      { name: 'Storage and Organization', slug: 'storage-organization', description: 'Containers, Shelving, Closet Organizers, Baskets', isActive: true, image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500' },
      { name: 'Home Decor', slug: 'home-decor', description: 'Wall Art, Decorative Items, Rugs, Curtains', isActive: true, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500' },
      { name: 'Beauty and Cosmetics', slug: 'beauty-cosmetics', description: 'Skincare, Makeup, Tools, Mirrors', isActive: true, image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500' },
      { name: 'Home Appliances', slug: 'home-appliances', description: 'Small Appliances, Kitchen Gadgets, Electronics', isActive: true, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500' }
    ];

    const createdCategories = [];
    for (const category of categories) {
      const created = await prisma.category.create({ data: category });
      createdCategories.push(created);
    }

    // 5. Create Featured Products (for BestSellers, NewArrivals, PopularItems components)
    const products = [
      // Kitchen & Dining - High sales for BestSellers
      { name: 'Samsung Non-Stick Frying Pan Set', slug: 'samsung-non-stick-frying-pan-set', sku: 'SAM-PAN-001', description: '3-piece Samsung non-stick frying pan set with ergonomic handles. Perfect for healthy cooking with minimal oil.', price: 2500, comparePrice: 3000, categoryId: createdCategories[0].id, brandId: createdBrands[0].id, stock: 45, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500', 'https://images.unsplash.com/photo-1584990347498-7895d9d6e2d8?w=500']), tags: JSON.stringify(['kitchen', 'cookware', 'non-stick', 'samsung']), totalSales: 256, viewCount: 1840, averageRating: 4.8, totalReviews: 45 },
      
      { name: 'LG Stainless Steel Cookware Set', slug: 'lg-stainless-steel-cookware-set', sku: 'LG-COO-002', description: '7-piece LG stainless steel cookware set with glass lids. Durable and perfect for all cooking needs.', price: 4500, comparePrice: 5500, categoryId: createdCategories[0].id, brandId: createdBrands[1].id, stock: 28, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1584990347498-7895d9d6e2d8?w=500', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500']), tags: JSON.stringify(['kitchen', 'cookware', 'stainless-steel', 'lg']), totalSales: 189, viewCount: 1290, averageRating: 4.9, totalReviews: 32 },
      
      { name: 'Pyrex Glass Dinnerware Set', slug: 'pyrex-glass-dinnerware-set', sku: 'PYR-DIN-003', description: '16-piece Pyrex glass dinnerware set. Elegant, durable, and perfect for family dining.', price: 3200, comparePrice: 4000, categoryId: createdCategories[0].id, brandId: createdBrands[4].id, stock: 22, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500']), tags: JSON.stringify(['kitchen', 'dinnerware', 'glass', 'pyrex']), totalSales: 167, viewCount: 967, averageRating: 4.7, totalReviews: 28 },
      
      // Bathroom - Popular items
      { name: 'Premium Cotton Bath Towel Set', slug: 'premium-cotton-bath-towel-set', sku: 'BAT-TOW-004', description: '6-piece premium 100% cotton bath towel set. Super absorbent and luxuriously soft.', price: 1800, comparePrice: 2200, categoryId: createdCategories[1].id, stock: 35, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=500']), tags: JSON.stringify(['bathroom', 'towels', 'cotton', 'premium']), totalSales: 234, viewCount: 1189, averageRating: 4.6, totalReviews: 41 },
      
      { name: 'Bamboo Bathroom Organizer Set', slug: 'bamboo-bathroom-organizer-set', sku: 'BAT-ORG-005', description: 'Eco-friendly bamboo bathroom storage organizer. Sustainable and stylish organization solution.', price: 1200, comparePrice: 1500, categoryId: createdCategories[1].id, stock: 18, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500']), tags: JSON.stringify(['bathroom', 'organizer', 'bamboo', 'eco-friendly']), totalSales: 145, viewCount: 634, averageRating: 4.5, totalReviews: 23 },
      
      // Cleaning - High volume
      { name: 'All-Purpose Cleaner 500ml', slug: 'all-purpose-cleaner-500ml', sku: 'CLN-APC-006', description: 'Multi-surface cleaning solution with fresh lemon scent. Safe and effective for all surfaces.', price: 350, comparePrice: 450, categoryId: createdCategories[2].id, stock: 89, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500']), tags: JSON.stringify(['cleaning', 'multi-purpose', 'lemon']), totalSales: 467, viewCount: 2156, averageRating: 4.4, totalReviews: 78 },
      
      { name: 'Microfiber Cleaning Cloth Set', slug: 'microfiber-cleaning-cloth-set', sku: 'CLN-MIC-007', description: 'Pack of 12 premium microfiber cleaning cloths. Lint-free and highly absorbent.', price: 800, comparePrice: 1000, categoryId: createdCategories[2].id, stock: 56, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500']), tags: JSON.stringify(['cleaning', 'microfiber', 'cloths']), totalSales: 289, viewCount: 1278, averageRating: 4.7, totalReviews: 52 },
      
      // Bedding - Seasonal favorites
      { name: 'Egyptian Cotton Bed Sheet Set', slug: 'egyptian-cotton-bed-sheet-set', sku: 'BED-SHE-008', description: 'Queen size 100% Egyptian cotton bed sheet set. Luxuriously soft and breathable.', price: 2200, comparePrice: 2800, categoryId: createdCategories[3].id, stock: 31, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500']), tags: JSON.stringify(['bedding', 'cotton', 'sheets', 'egyptian']), totalSales: 198, viewCount: 867, averageRating: 4.8, totalReviews: 35 },
      
      { name: 'Memory Foam Pillow', slug: 'memory-foam-pillow', sku: 'BED-PIL-009', description: 'Ergonomic memory foam pillow with cooling gel layer. Perfect for neck and spine support.', price: 1500, comparePrice: 1800, categoryId: createdCategories[3].id, stock: 42, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500']), tags: JSON.stringify(['bedding', 'pillow', 'memory-foam', 'cooling']), totalSales: 176, viewCount: 745, averageRating: 4.6, totalReviews: 29 },
      
      // Storage - Consistent sellers
      { name: 'Tupperware Storage Container Set', slug: 'tupperware-storage-container-set', sku: 'TUP-STO-010', description: '10-piece Tupperware airtight storage container set. Keep food fresh longer with premium quality.', price: 1800, comparePrice: 2200, categoryId: createdCategories[4].id, brandId: createdBrands[5].id, stock: 38, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500']), tags: JSON.stringify(['storage', 'containers', 'tupperware', 'airtight']), totalSales: 167, viewCount: 678, averageRating: 4.7, totalReviews: 31 },
      
      { name: 'Woven Storage Basket Set', slug: 'woven-storage-basket-set', sku: 'STO-BAS-011', description: '3-piece handwoven storage basket set with handles. Beautiful and functional organization solution.', price: 1200, comparePrice: 1500, categoryId: createdCategories[4].id, stock: 27, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500']), tags: JSON.stringify(['storage', 'baskets', 'woven', 'handmade']), totalSales: 212, viewCount: 978, averageRating: 4.5, totalReviews: 38 },
      
      // Home Decor - Premium items
      { name: 'Gold Frame Wall Mirror', slug: 'gold-frame-wall-mirror', sku: 'DEC-MIR-012', description: 'Round decorative wall mirror with elegant gold frame. Perfect statement piece for any room.', price: 2800, comparePrice: 3500, categoryId: createdCategories[5].id, stock: 15, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500']), tags: JSON.stringify(['decor', 'mirror', 'wall-art', 'gold']), totalSales: 134, viewCount: 534, averageRating: 4.9, totalReviews: 22 },
      
      { name: 'Artificial Plant Collection', slug: 'artificial-plant-collection', sku: 'DEC-PLA-013', description: 'Set of 3 realistic artificial plants in decorative pots. Low maintenance greenery for your home.', price: 1600, comparePrice: 2000, categoryId: createdCategories[5].id, stock: 23, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500']), tags: JSON.stringify(['decor', 'plants', 'artificial', 'greenery']), totalSales: 145, viewCount: 489, averageRating: 4.3, totalReviews: 26 },
      
      // Beauty - High margin
      { name: 'Complete Skincare Gift Set', slug: 'complete-skincare-gift-set', sku: 'BEA-SKI-014', description: 'Complete skincare routine set with cleanser, toner, moisturizer, and serum. Perfect for all skin types.', price: 3500, comparePrice: 4200, categoryId: createdCategories[6].id, stock: 21, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500']), tags: JSON.stringify(['beauty', 'skincare', 'gift-set', 'complete']), totalSales: 178, viewCount: 756, averageRating: 4.8, totalReviews: 33 },
      
      { name: 'Professional Makeup Brush Set', slug: 'professional-makeup-brush-set', sku: 'BEA-BRU-015', description: 'Professional 12-piece makeup brush set with premium synthetic bristles and elegant case.', price: 2200, comparePrice: 2800, categoryId: createdCategories[6].id, stock: 28, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500']), tags: JSON.stringify(['beauty', 'makeup', 'brushes', 'professional']), totalSales: 156, viewCount: 634, averageRating: 4.6, totalReviews: 28 },
      
      // Appliances - High value items
      { name: 'Philips Electric Kettle 1.7L', slug: 'philips-electric-kettle-17l', sku: 'PHI-KET-016', description: 'Philips 1.7L stainless steel electric kettle with auto shut-off and boil-dry protection.', price: 2200, comparePrice: 2800, categoryId: createdCategories[7].id, brandId: createdBrands[2].id, stock: 33, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500']), tags: JSON.stringify(['appliances', 'kettle', 'electric', 'philips']), totalSales: 189, viewCount: 867, averageRating: 4.7, totalReviews: 34 },
      
      { name: 'Samsung Coffee Maker', slug: 'samsung-coffee-maker', sku: 'SAM-COF-017', description: '12-cup programmable Samsung coffee maker with timer and auto shut-off. Perfect morning companion.', price: 4500, comparePrice: 5500, categoryId: createdCategories[7].id, brandId: createdBrands[0].id, stock: 18, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500']), tags: JSON.stringify(['appliances', 'coffee', 'maker', 'samsung']), totalSales: 145, viewCount: 645, averageRating: 4.8, totalReviews: 25 }
    ];

    const createdProducts = [];
    for (const product of products) {
      const created = await prisma.product.create({ data: product });
      createdProducts.push(created);
    }

    // 6. Create Orders (for customer testimonials and sales data)
    const counties = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Machakos', 'Kiambu'];
    const statuses = ['COMPLETED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const paymentMethods = ['M_PESA', 'CARD', 'CASH_ON_DELIVERY'];
    
    const orders = [];
    const now = new Date();
    
    // Create 50 orders for realistic data
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 60); // Last 60 days
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
      
      const shippingCost = subtotal >= 5000 ? 0 : Math.floor(Math.random() * 500) + 100;
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

    // 7. Create Hero Banners
    const banners = [
      {
        title: 'Transform Your Home Today',
        subtitle: 'Discover premium household items at unbeatable prices',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920',
        link: '/products',
        buttonText: 'Shop Now',
        position: 'HERO',
        isActive: true,
        sortOrder: 1,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Summer Kitchen Sale',
        subtitle: 'Up to 50% off on premium cookware and appliances',
        image: 'https://images.unsplash.com/photo-1584990347498-7895d9d6e2d8?w=1920',
        link: '/products?category=kitchen-dining',
        buttonText: 'Shop Kitchen',
        position: 'HERO',
        isActive: true,
        sortOrder: 2,
        startDate: new Date(),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Free Delivery',
        subtitle: 'On all orders above KSh 5,000 across Kenya',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920',
        link: '/delivery-info',
        buttonText: 'Learn More',
        position: 'PROMO',
        isActive: true,
        sortOrder: 3
      }
    ];

    for (const banner of banners) {
      await prisma.banner.create({ data: banner });
    }

    // 8. Create Promo Codes (for flash sales)
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
        usageCount: 25,
        userUsageLimit: 1,
        isActive: true,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: 'admin'
      },
      {
        code: 'FLASH50',
        name: 'Flash Sale - KSh 50 Off',
        description: 'Limited time flash sale discount',
        discountType: 'FIXED',
        discountValue: 50,
        minOrderAmount: 500,
        usageLimit: 200,
        usageCount: 78,
        userUsageLimit: 3,
        isActive: true,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
        usageCount: 12,
        userUsageLimit: 2,
        isActive: true,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        createdBy: 'admin'
      }
    ];

    for (const promoCode of promoCodes) {
      await prisma.promoCode.create({ data: promoCode });
    }

    // 9. Create Settings (for site configuration)
    const settings = [
      // Company Settings
      { category: 'company', key: 'site_name', value: 'Household Planet Kenya', type: 'string', description: 'Website name', isPublic: true },
      { category: 'company', key: 'site_description', value: 'Your one-stop shop for quality household items in Kenya', type: 'string', description: 'Website description', isPublic: true },
      { category: 'company', key: 'contact_email', value: 'info@householdplanet.co.ke', type: 'string', description: 'Contact email', isPublic: true },
      { category: 'company', key: 'contact_phone', value: '+254700000000', type: 'string', description: 'Contact phone', isPublic: true },
      { category: 'company', key: 'whatsapp_number', value: '+254700000000', type: 'string', description: 'WhatsApp number', isPublic: true },
      
      // Payment Settings
      { category: 'payment', key: 'free_shipping_threshold', value: '5000', type: 'number', description: 'Free shipping threshold', isPublic: true },
      { category: 'payment', key: 'currency', value: 'KSh', type: 'string', description: 'Currency symbol', isPublic: true },
      
      // Social Media
      { category: 'social', key: 'facebook_url', value: 'https://facebook.com/householdplanetkenya', type: 'string', description: 'Facebook page', isPublic: true },
      { category: 'social', key: 'instagram_url', value: 'https://instagram.com/householdplanetkenya', type: 'string', description: 'Instagram profile', isPublic: true },
      { category: 'social', key: 'twitter_url', value: 'https://twitter.com/householdplanet', type: 'string', description: 'Twitter profile', isPublic: true }
    ];

    for (const setting of settings) {
      await prisma.setting.create({ data: setting });
    }

    // 10. Create Delivery Locations
    const deliveryLocations = [
      { name: 'Nairobi CBD', tier: 1, price: 100, description: 'Orders within CBD only', estimatedDays: 1, expressAvailable: true, expressPrice: 200 },
      { name: 'Westlands', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
      { name: 'Karen', tier: 3, price: 650, estimatedDays: 3, expressAvailable: true, expressPrice: 850 },
      { name: 'Mombasa', tier: 2, price: 350, estimatedDays: 3, expressAvailable: false },
      { name: 'Kisumu', tier: 2, price: 400, estimatedDays: 4, expressAvailable: false }
    ];

    for (let i = 0; i < deliveryLocations.length; i++) {
      const location = deliveryLocations[i];
      await prisma.setting.create({
        data: {
          category: 'delivery_locations',
          key: `location_${Date.now() + i}`,
          value: JSON.stringify({ ...location, isActive: true }),
          type: 'json',
          description: `Delivery location: ${location.name}`,
          isPublic: true
        }
      });
    }

    console.log('✅ Homepage seeding completed successfully!');
    console.log('📊 Homepage Data Summary:');
    console.log(`- 1 Admin user (admin@householdplanet.co.ke / Admin@2025)`);
    console.log(`- ${createdCustomers.length} customers (for testimonials)`);
    console.log(`- ${createdBrands.length} brands`);
    console.log(`- ${createdCategories.length} categories (with images)`);
    console.log(`- ${createdProducts.length} featured products (with ratings & reviews)`);
    console.log(`- ${createdOrders.length} orders (realistic sales data)`);
    console.log(`- ${banners.length} hero banners`);
    console.log(`- ${promoCodes.length} promo codes (for flash sales)`);
    console.log(`- ${settings.length} site settings`);
    console.log(`- ${deliveryLocations.length} delivery locations`);
    console.log('🏠 Homepage ready with comprehensive data!');

  } catch (error) {
    console.error('❌ Homepage seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { seedHomepage };

if (require.main === module) {
  seedHomepage();
}