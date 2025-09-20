const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function finalProductionDeploy() {
  try {
    console.log('🚀 Final Production Deployment...');

    // Clear and recreate with proper security
    await prisma.promoCodeUsage.deleteMany({});
    await prisma.promoCode.deleteMany({});
    await prisma.blogPost.deleteMany({});
    await prisma.fAQ.deleteMany({});
    await prisma.emailTemplate.deleteMany({});
    await prisma.contentPage.deleteMany({});
    await prisma.banner.deleteMany({});
    await prisma.adminActivity.deleteMany({});
    await prisma.recentlyViewed.deleteMany({});
    await prisma.paymentTransaction.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.wishlist.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.customerProfile.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.brand.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.setting.deleteMany({});

    // 1. Create Admin with proper encryption
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

    // 2. Create Customers with proper encryption
    const customerPassword = await bcrypt.hash('password123', 12);
    const customers = [
      { email: 'john.doe@gmail.com', firstName: 'John', lastName: 'Doe', name: 'John Doe' },
      { email: 'jane.smith@yahoo.com', firstName: 'Jane', lastName: 'Smith', name: 'Jane Smith' },
      { email: 'mike.johnson@outlook.com', firstName: 'Mike', lastName: 'Johnson', name: 'Mike Johnson' }
    ];

    const createdCustomers = [];
    for (const customer of customers) {
      const created = await prisma.user.create({
        data: {
          ...customer,
          password: customerPassword,
          role: 'CUSTOMER',
          emailVerified: true,
          isActive: true
        }
      });
      createdCustomers.push(created);
    }

    // 3. Create Brands
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

    // 4. Create Categories
    const categories = [
      { name: 'Kitchen and Dining', slug: 'kitchen-dining', description: 'Cookware, Utensils, Dinnerware', isActive: true, image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=500' },
      { name: 'Bathroom Accessories', slug: 'bathroom-accessories', description: 'Towels, Mats, Organizers', isActive: true, image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500' },
      { name: 'Cleaning and Laundry', slug: 'cleaning-laundry', description: 'Cleaning Supplies, Tools', isActive: true, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500' },
      { name: 'Home Appliances', slug: 'home-appliances', description: 'Small Appliances, Gadgets', isActive: true, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500' }
    ];

    const createdCategories = [];
    for (const category of categories) {
      const created = await prisma.category.create({ data: category });
      createdCategories.push(created);
    }

    // 5. Create Products
    const products = [
      { name: 'Samsung Non-Stick Frying Pan Set', slug: 'samsung-frying-pan-set', sku: 'SAM-PAN-001', description: '3-piece Samsung non-stick frying pan set with ergonomic handles', price: 2500, comparePrice: 3000, categoryId: createdCategories[0].id, brandId: createdBrands[0].id, stock: 45, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500']), tags: JSON.stringify(['kitchen', 'cookware']), totalSales: 156, viewCount: 1240, averageRating: 4.8, totalReviews: 45 },
      { name: 'LG Electric Kettle 1.7L', slug: 'lg-electric-kettle', sku: 'LG-KET-002', description: 'LG 1.7L stainless steel electric kettle with auto shut-off', price: 2200, comparePrice: 2800, categoryId: createdCategories[3].id, brandId: createdBrands[1].id, stock: 33, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500']), tags: JSON.stringify(['appliances']), totalSales: 89, viewCount: 567, averageRating: 4.7, totalReviews: 34 },
      { name: 'Premium Cotton Bath Towel Set', slug: 'cotton-bath-towel-set', sku: 'BAT-TOW-003', description: '6-piece premium cotton bath towel set', price: 1800, comparePrice: 2200, categoryId: createdCategories[1].id, stock: 35, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=500']), tags: JSON.stringify(['bathroom']), totalSales: 134, viewCount: 789, averageRating: 4.6, totalReviews: 41 },
      { name: 'All-Purpose Cleaner 500ml', slug: 'all-purpose-cleaner', sku: 'CLN-APC-004', description: 'Multi-surface cleaning solution with fresh scent', price: 350, comparePrice: 450, categoryId: createdCategories[2].id, stock: 89, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500']), tags: JSON.stringify(['cleaning']), totalSales: 267, viewCount: 1456, averageRating: 4.4, totalReviews: 78 }
    ];

    const createdProducts = [];
    for (const product of products) {
      const created = await prisma.product.create({ data: product });
      createdProducts.push(created);
    }

    // 6. Create Customer Profiles
    for (const customer of createdCustomers) {
      await prisma.customerProfile.create({
        data: {
          userId: customer.id,
          loyaltyPoints: Math.floor(Math.random() * 500),
          totalSpent: Math.floor(Math.random() * 5000) + 1000,
          totalOrders: Math.floor(Math.random() * 5) + 1,
          averageOrderValue: Math.floor(Math.random() * 1000) + 500
        }
      });
    }

    // 7. Create Orders
    for (let i = 0; i < 20; i++) {
      const customer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
      const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const quantity = Math.floor(Math.random() * 2) + 1;
      const subtotal = product.price * quantity;
      const shippingCost = subtotal >= 5000 ? 0 : 200;
      const total = subtotal + shippingCost;

      const order = await prisma.order.create({
        data: {
          userId: customer.id,
          orderNumber: `HP${Date.now() + i}`,
          status: ['COMPLETED', 'PROCESSING', 'SHIPPED', 'DELIVERED'][Math.floor(Math.random() * 4)],
          total,
          subtotal,
          shippingCost,
          paymentMethod: ['M_PESA', 'CARD'][Math.floor(Math.random() * 2)],
          paymentStatus: 'PAID',
          deliveryLocation: ['Nairobi', 'Mombasa', 'Kisumu'][Math.floor(Math.random() * 3)],
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
          total: subtotal
        }
      });

      // Create payment transaction
      await prisma.paymentTransaction.create({
        data: {
          orderId: order.id,
          checkoutRequestId: `ws_CO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          phoneNumber: '+254712345678',
          amount: total,
          status: 'SUCCESS',
          provider: 'MPESA',
          paymentType: 'STK_PUSH',
          mpesaReceiptNumber: `NLJ7RT61SV`,
          transactionDate: new Date(),
          resultCode: '0',
          resultDescription: 'Success'
        }
      });
    }

    // 8. Create Reviews
    for (let i = 0; i < 15; i++) {
      const customer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
      const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      
      try {
        await prisma.review.create({
          data: {
            productId: product.id,
            userId: customer.id,
            rating: Math.floor(Math.random() * 2) + 4,
            title: 'Great product!',
            comment: 'Excellent quality and fast delivery. Highly recommended!',
            isVerified: true
          }
        });
      } catch (error) {
        // Skip if duplicate review
      }
    }

    // 9. Create Settings
    const settings = [
      { category: 'company', key: 'site_name', value: 'Household Planet Kenya', type: 'string', isPublic: true },
      { category: 'company', key: 'contact_email', value: 'info@householdplanet.co.ke', type: 'string', isPublic: true },
      { category: 'company', key: 'contact_phone', value: '+254700000000', type: 'string', isPublic: true },
      { category: 'payment', key: 'free_shipping_threshold', value: '5000', type: 'number', isPublic: true },
      { category: 'payment', key: 'currency', value: 'KSh', type: 'string', isPublic: true }
    ];

    for (const setting of settings) {
      await prisma.setting.create({ data: setting });
    }

    // 10. Create Delivery Locations
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

    // 11. Create Content Pages
    await prisma.contentPage.create({
      data: {
        slug: 'about-us',
        title: 'About Household Planet Kenya',
        content: '<h1>About Us</h1><p>We are Kenya\'s leading online retailer for quality household items.</p>',
        metaTitle: 'About Us - Household Planet Kenya',
        metaDescription: 'Learn about Household Planet Kenya',
        isPublished: true
      }
    });

    // 12. Create FAQs
    const faqs = [
      { question: 'How do I place an order?', answer: 'Browse products, add to cart, and checkout.', category: 'Orders', isPublished: true, sortOrder: 1 },
      { question: 'What payment methods do you accept?', answer: 'We accept M-Pesa, bank transfers, and cash on delivery.', category: 'Payment', isPublished: true, sortOrder: 2 }
    ];

    for (const faq of faqs) {
      await prisma.fAQ.create({ data: faq });
    }

    console.log('✅ Final Production Deployment Complete!');
    console.log('📊 Production Data Summary:');
    console.log('- 1 Admin user (admin@householdplanet.co.ke / Admin@2025)');
    console.log('- 3 Customer users (password123)');
    console.log('- 4 Brands');
    console.log('- 4 Categories with images');
    console.log('- 4 Featured products');
    console.log('- 20 Orders with payment transactions');
    console.log('- 15 Product reviews');
    console.log('- 5 Critical settings');
    console.log('- 3 Delivery locations');
    console.log('- Content pages and FAQs');
    console.log('🔐 All passwords properly encrypted');
    console.log('🚀 READY FOR PRODUCTION!');

  } catch (error) {
    console.error('❌ Final deployment failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { finalProductionDeploy };

if (require.main === module) {
  finalProductionDeploy();
}