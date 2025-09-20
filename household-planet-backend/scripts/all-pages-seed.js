const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAllPages() {
  try {
    console.log('🌐 Seeding all pages data...');

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
        permissions: JSON.stringify(['admin:read', 'admin:write', 'admin:delete'])
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

    // 4. Create Products
    const products = [
      { name: 'Samsung Frying Pan Set', slug: 'samsung-frying-pan-set', sku: 'SAM-PAN-001', description: '3-piece Samsung non-stick frying pan set', price: 2500, comparePrice: 3000, categoryId: createdCategories[0].id, brandId: createdBrands[0].id, stock: 45, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500']), tags: JSON.stringify(['kitchen', 'cookware']), totalSales: 156, viewCount: 1240, averageRating: 4.8, totalReviews: 45 },
      { name: 'LG Electric Kettle', slug: 'lg-electric-kettle', sku: 'LG-KET-002', description: 'LG 1.7L stainless steel electric kettle', price: 2200, comparePrice: 2800, categoryId: createdCategories[3].id, brandId: createdBrands[1].id, stock: 33, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500']), tags: JSON.stringify(['appliances']), totalSales: 89, viewCount: 567, averageRating: 4.7, totalReviews: 34 },
      { name: 'Cotton Bath Towel Set', slug: 'cotton-bath-towel-set', sku: 'BAT-TOW-003', description: '6-piece premium cotton bath towel set', price: 1800, comparePrice: 2200, categoryId: createdCategories[1].id, stock: 35, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=500']), tags: JSON.stringify(['bathroom']), totalSales: 134, viewCount: 789, averageRating: 4.6, totalReviews: 41 },
      { name: 'All-Purpose Cleaner', slug: 'all-purpose-cleaner', sku: 'CLN-APC-004', description: 'Multi-surface cleaning solution 500ml', price: 350, comparePrice: 450, categoryId: createdCategories[2].id, stock: 89, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500']), tags: JSON.stringify(['cleaning']), totalSales: 267, viewCount: 1456, averageRating: 4.4, totalReviews: 78 }
    ];

    const createdProducts = [];
    for (const product of products) {
      const created = await prisma.product.create({ data: product });
      createdProducts.push(created);
    }

    // 5. Create Orders
    for (let i = 0; i < 15; i++) {
      const customer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
      const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const quantity = Math.floor(Math.random() * 2) + 1;
      const total = product.price * quantity + 200;

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
    }

    // 6. Create Content Pages
    const contentPages = [
      {
        slug: 'about-us',
        title: 'About Household Planet Kenya',
        content: '<h1>About Us</h1><p>We are Kenya\'s leading online retailer for quality household items.</p>',
        metaTitle: 'About Us - Household Planet Kenya',
        metaDescription: 'Learn about Household Planet Kenya, your trusted partner for household items.',
        isPublished: true
      },
      {
        slug: 'privacy-policy',
        title: 'Privacy Policy',
        content: '<h1>Privacy Policy</h1><p>We protect your personal information and privacy.</p>',
        metaTitle: 'Privacy Policy - Household Planet Kenya',
        metaDescription: 'Read our privacy policy to understand how we protect your data.',
        isPublished: true
      },
      {
        slug: 'terms-of-service',
        title: 'Terms of Service',
        content: '<h1>Terms of Service</h1><p>Terms and conditions for using our services.</p>',
        metaTitle: 'Terms of Service - Household Planet Kenya',
        metaDescription: 'Read our terms of service for using our website.',
        isPublished: true
      },
      {
        slug: 'shipping-returns',
        title: 'Shipping & Returns',
        content: '<h1>Shipping & Returns</h1><p>Information about shipping and return policies.</p>',
        metaTitle: 'Shipping & Returns - Household Planet Kenya',
        metaDescription: 'Learn about our shipping and return policies.',
        isPublished: true
      }
    ];

    for (const page of contentPages) {
      await prisma.contentPage.create({ data: page });
    }

    // 7. Create FAQs
    const faqs = [
      {
        question: 'How do I place an order?',
        answer: 'Browse products, add to cart, and checkout.',
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
      },
      {
        question: 'How long does delivery take?',
        answer: 'Delivery takes 1-3 days depending on location.',
        category: 'Delivery',
        isPublished: true,
        sortOrder: 3
      }
    ];

    for (const faq of faqs) {
      await prisma.fAQ.create({ data: faq });
    }

    // 8. Create Blog Posts
    const blogPosts = [
      {
        slug: 'kitchen-essentials-2024',
        title: 'Top Kitchen Essentials for 2024',
        excerpt: 'Discover must-have kitchen items for your home.',
        content: '<h1>Kitchen Essentials</h1><p>Essential items every kitchen needs.</p>',
        featuredImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
        author: 'Household Planet Team',
        tags: 'kitchen,essentials',
        isPublished: true,
        publishedAt: new Date()
      }
    ];

    for (const post of blogPosts) {
      await prisma.blogPost.create({ data: post });
    }

    // 9. Create Settings
    const settings = [
      { category: 'company', key: 'site_name', value: 'Household Planet Kenya', type: 'string', isPublic: true },
      { category: 'company', key: 'contact_email', value: 'info@householdplanet.co.ke', type: 'string', isPublic: true },
      { category: 'payment', key: 'free_shipping_threshold', value: '5000', type: 'number', isPublic: true }
    ];

    for (const setting of settings) {
      await prisma.setting.create({ data: setting });
    }

    // 10. Create Delivery Locations
    const deliveryLocations = [
      { name: 'Nairobi CBD', tier: 1, price: 100, estimatedDays: 1, expressAvailable: true },
      { name: 'Westlands', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true },
      { name: 'Karen', tier: 3, price: 650, estimatedDays: 3, expressAvailable: true }
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

    console.log('✅ All pages seeding completed!');
    console.log('📊 Summary:');
    console.log('- 1 Admin user');
    console.log('- 3 Customers');
    console.log('- 4 Brands');
    console.log('- 4 Categories');
    console.log('- 4 Products');
    console.log('- 15 Orders');
    console.log('- 4 Content pages');
    console.log('- 3 FAQs');
    console.log('- 1 Blog post');
    console.log('- 3 Settings');
    console.log('- 3 Delivery locations');

  } catch (error) {
    console.error('❌ All pages seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { seedAllPages };

if (require.main === module) {
  seedAllPages();
}