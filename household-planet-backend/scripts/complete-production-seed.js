const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function completeProductionSeed() {
  try {
    console.log('🌱 Starting complete production seeding...');

    // Clear all data in correct order
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

    console.log('✅ Cleared existing data');

    // 1. Create Users
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

    const customers = [
      { email: 'john.doe@gmail.com', firstName: 'John', lastName: 'Doe', name: 'John Doe', role: 'CUSTOMER', emailVerified: true, isActive: true },
      { email: 'jane.smith@yahoo.com', firstName: 'Jane', lastName: 'Smith', name: 'Jane Smith', role: 'CUSTOMER', emailVerified: true, isActive: true },
      { email: 'mike.johnson@outlook.com', firstName: 'Mike', lastName: 'Johnson', name: 'Mike Johnson', role: 'CUSTOMER', emailVerified: true, isActive: true }
    ];

    const createdCustomers = [];
    for (const customer of customers) {
      const password = await bcrypt.hash('password123', 12);
      const created = await prisma.user.create({
        data: { ...customer, password }
      });
      createdCustomers.push(created);
    }

    // 2. Create Brands
    const brands = [
      { name: 'Samsung', slug: 'samsung', isActive: true },
      { name: 'LG', slug: 'lg', isActive: true },
      { name: 'Philips', slug: 'philips', isActive: true },
      { name: 'Tefal', slug: 'tefal', isActive: true }
    ];

    const createdBrands = [];
    for (const brand of brands) {
      const created = await prisma.brand.create({ data: brand });
      createdBrands.push(created);
    }

    // 3. Create Categories
    const categories = [
      { name: 'Kitchen and Dining', slug: 'kitchen-dining', description: 'Cookware, Utensils, Dinnerware, Appliances', isActive: true },
      { name: 'Bathroom Accessories', slug: 'bathroom-accessories', description: 'Towels, Mats, Organizers, Fixtures', isActive: true },
      { name: 'Cleaning and Laundry', slug: 'cleaning-laundry', description: 'Cleaning Supplies, Tools, Laundry Accessories', isActive: true },
      { name: 'Home Appliances', slug: 'home-appliances', description: 'Small Appliances, Kitchen Gadgets', isActive: true }
    ];

    const createdCategories = [];
    for (const category of categories) {
      const created = await prisma.category.create({ data: category });
      createdCategories.push(created);
    }

    // 4. Create Products
    const products = [
      { name: 'Samsung Non-Stick Frying Pan Set', slug: 'samsung-frying-pan-set', sku: 'SAM-PAN-001', description: '3-piece Samsung non-stick frying pan set', price: 2500, comparePrice: 3000, categoryId: createdCategories[0].id, brandId: createdBrands[0].id, stock: 45, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500']), tags: JSON.stringify(['kitchen', 'cookware']), totalSales: 156, viewCount: 1240 },
      { name: 'LG Electric Kettle', slug: 'lg-electric-kettle', sku: 'LG-KET-002', description: 'LG 1.7L stainless steel electric kettle', price: 2200, comparePrice: 2800, categoryId: createdCategories[3].id, brandId: createdBrands[1].id, stock: 33, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500']), tags: JSON.stringify(['appliances', 'kettle']), totalSales: 89, viewCount: 567 },
      { name: 'Cotton Bath Towel Set', slug: 'cotton-bath-towel-set', sku: 'BAT-TOW-003', description: '6-piece premium cotton bath towel set', price: 1800, comparePrice: 2200, categoryId: createdCategories[1].id, stock: 35, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=500']), tags: JSON.stringify(['bathroom', 'towels']), totalSales: 134, viewCount: 789 },
      { name: 'All-Purpose Cleaner', slug: 'all-purpose-cleaner', sku: 'CLN-APC-004', description: 'Multi-surface cleaning solution 500ml', price: 350, comparePrice: 450, categoryId: createdCategories[2].id, stock: 89, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500']), tags: JSON.stringify(['cleaning']), totalSales: 267, viewCount: 1456 }
    ];

    const createdProducts = [];
    for (const product of products) {
      const created = await prisma.product.create({ data: product });
      createdProducts.push(created);
    }

    // 5. Create Orders
    const orders = [];
    for (let i = 0; i < 10; i++) {
      const customer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
      const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const quantity = Math.floor(Math.random() * 2) + 1;
      const total = product.price * quantity + 200; // Add shipping

      const order = await prisma.order.create({
        data: {
          userId: customer.id,
          orderNumber: `HP${Date.now() + i}`,
          status: ['COMPLETED', 'PROCESSING', 'SHIPPED'][Math.floor(Math.random() * 3)],
          total,
          subtotal: product.price * quantity,
          shippingCost: 200,
          paymentMethod: ['M_PESA', 'CARD'][Math.floor(Math.random() * 2)],
          paymentStatus: 'PAID',
          shippingAddress: JSON.stringify({
            firstName: customer.firstName,
            lastName: customer.lastName,
            phone: '+254712345678',
            address: '123 Main St',
            city: 'Nairobi',
            county: 'Nairobi'
          })
        }
      });

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity,
          price: product.price,
          total: product.price * quantity
        }
      });

      orders.push(order);
    }

    // 6. Create Promo Codes
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
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
      }
    ];

    for (const promoCode of promoCodes) {
      await prisma.promoCode.create({ data: promoCode });
    }

    // 7. Create Settings
    const settings = [
      { category: 'company', key: 'site_name', value: 'Household Planet Kenya', type: 'string', description: 'Website name', isPublic: true },
      { category: 'company', key: 'contact_email', value: 'info@householdplanet.co.ke', type: 'string', description: 'Contact email', isPublic: true },
      { category: 'payment', key: 'tax_rate', value: '16', type: 'number', description: 'VAT rate', isPublic: true },
      { category: 'payment', key: 'free_shipping_threshold', value: '5000', type: 'number', description: 'Free shipping threshold', isPublic: true }
    ];

    for (const setting of settings) {
      await prisma.setting.create({ data: setting });
    }

    // 8. Create Delivery Locations
    const deliveryLocations = [
      { name: 'Nairobi CBD', tier: 1, price: 100, estimatedDays: 1, expressAvailable: true, expressPrice: 200 },
      { name: 'Westlands', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
      { name: 'Karen', tier: 3, price: 650, estimatedDays: 3, expressAvailable: true, expressPrice: 850 }
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

    // 9. Create Content
    const banners = [
      {
        title: 'Summer Sale 2024',
        subtitle: 'Up to 50% off on kitchen appliances',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200',
        link: '/products?category=kitchen-dining',
        buttonText: 'Shop Now',
        position: 'HERO',
        isActive: true,
        sortOrder: 1
      }
    ];

    for (const banner of banners) {
      await prisma.banner.create({ data: banner });
    }

    const faqs = [
      {
        question: 'How do I place an order?',
        answer: 'Browse products, add to cart, and checkout. Create account or checkout as guest.',
        category: 'Orders',
        isPublished: true,
        sortOrder: 1
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept M-Pesa, bank transfers, and cash on delivery.',
        category: 'Payment',
        isPublished: true,
        sortOrder: 2
      }
    ];

    for (const faq of faqs) {
      await prisma.fAQ.create({ data: faq });
    }

    const emailTemplates = [
      {
        name: 'welcome_email',
        subject: 'Welcome to Household Planet Kenya!',
        htmlContent: '<h1>Welcome!</h1><p>Thank you for joining us.</p>',
        textContent: 'Welcome to Household Planet Kenya!',
        isActive: true
      }
    ];

    for (const template of emailTemplates) {
      await prisma.emailTemplate.create({ data: template });
    }

    // 10. Create Admin Activities
    await prisma.adminActivity.create({
      data: {
        userId: admin.id,
        action: 'SYSTEM_SEED',
        details: 'Complete production database seeding completed',
        entityType: 'SYSTEM',
        ipAddress: '127.0.0.1',
        userAgent: 'Seeding Script'
      }
    });

    console.log('✅ Complete production seeding successful!');
    console.log('📊 Summary:');
    console.log(`- 1 Admin user (admin@householdplanet.co.ke / Admin@2025)`);
    console.log(`- ${createdCustomers.length} customers`);
    console.log(`- ${createdBrands.length} brands`);
    console.log(`- ${createdCategories.length} categories`);
    console.log(`- ${createdProducts.length} products`);
    console.log(`- ${orders.length} orders`);
    console.log(`- 2 promo codes`);
    console.log(`- ${settings.length + deliveryLocations.length} settings`);
    console.log(`- 1 banner, 2 FAQs, 1 email template`);
    console.log('🚀 Ready for production!');

  } catch (error) {
    console.error('❌ Complete production seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { completeProductionSeed };

if (require.main === module) {
  completeProductionSeed();
}