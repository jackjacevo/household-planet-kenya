const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function finalAdminSeed() {
  try {
    console.log('🌱 Seeding final admin dashboard data...');

    // Clear existing content data
    await prisma.blogPost.deleteMany({});
    await prisma.fAQ.deleteMany({});
    await prisma.emailTemplate.deleteMany({});
    await prisma.contentPage.deleteMany({});
    await prisma.banner.deleteMany({});

    // Create Banners
    const banners = [
      {
        title: 'Summer Sale 2024',
        subtitle: 'Up to 50% off on kitchen appliances',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200',
        link: '/products?category=kitchen-dining',
        buttonText: 'Shop Now',
        position: 'HERO',
        isActive: true,
        sortOrder: 1,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'New Arrivals',
        subtitle: 'Fresh household items just arrived',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200',
        link: '/products?featured=true',
        buttonText: 'Explore',
        position: 'SECONDARY',
        isActive: true,
        sortOrder: 2
      },
      {
        title: 'Free Delivery',
        subtitle: 'On orders above KSh 5,000',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
        link: '/delivery',
        buttonText: 'Learn More',
        position: 'PROMO',
        isActive: true,
        sortOrder: 3
      }
    ];

    const createdBanners = [];
    for (const banner of banners) {
      const created = await prisma.banner.create({ data: banner });
      createdBanners.push(created);
    }

    // Create Content Pages
    const contentPages = [
      {
        slug: 'about-us',
        title: 'About Household Planet Kenya',
        content: `<h1>About Household Planet Kenya</h1>
        <p>We are Kenya's leading online retailer for quality household items, kitchen appliances, and home decor. Founded in 2020, we've been serving customers across Kenya with fast delivery and competitive prices.</p>
        <h2>Our Mission</h2>
        <p>To make quality household products accessible to every Kenyan home through convenient online shopping and reliable delivery services.</p>
        <h2>Why Choose Us</h2>
        <ul>
        <li>Quality guaranteed products</li>
        <li>Fast delivery across Kenya</li>
        <li>Competitive prices</li>
        <li>Excellent customer service</li>
        </ul>`,
        metaTitle: 'About Us - Household Planet Kenya',
        metaDescription: 'Learn about Household Planet Kenya, your trusted partner for quality household items and kitchen appliances.',
        isPublished: true
      },
      {
        slug: 'privacy-policy',
        title: 'Privacy Policy',
        content: `<h1>Privacy Policy</h1>
        <p>Last updated: ${new Date().toLocaleDateString()}</p>
        <h2>Information We Collect</h2>
        <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us.</p>
        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to provide, maintain, and improve our services.</p>
        <h2>Information Sharing</h2>
        <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.</p>`,
        metaTitle: 'Privacy Policy - Household Planet Kenya',
        metaDescription: 'Read our privacy policy to understand how we collect, use, and protect your personal information.',
        isPublished: true
      },
      {
        slug: 'terms-of-service',
        title: 'Terms of Service',
        content: `<h1>Terms of Service</h1>
        <p>Last updated: ${new Date().toLocaleDateString()}</p>
        <h2>Acceptance of Terms</h2>
        <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
        <h2>Products and Services</h2>
        <p>All products are subject to availability. We reserve the right to discontinue any product at any time.</p>`,
        metaTitle: 'Terms of Service - Household Planet Kenya',
        metaDescription: 'Read our terms of service for using Household Planet Kenya website and services.',
        isPublished: true
      },
      {
        slug: 'shipping-returns',
        title: 'Shipping & Returns',
        content: `<h1>Shipping & Returns</h1>
        <h2>Shipping Information</h2>
        <p>We offer delivery across Kenya with varying delivery times based on location.</p>
        <ul>
        <li>Nairobi: 1-2 business days</li>
        <li>Major towns: 2-3 business days</li>
        <li>Remote areas: 3-5 business days</li>
        </ul>
        <h2>Return Policy</h2>
        <p>We accept returns within 7 days of delivery for unused items in original packaging.</p>`,
        metaTitle: 'Shipping & Returns - Household Planet Kenya',
        metaDescription: 'Learn about our shipping options and return policy for your orders.',
        isPublished: true
      }
    ];

    const createdPages = [];
    for (const page of contentPages) {
      const created = await prisma.contentPage.create({ data: page });
      createdPages.push(created);
    }

    // Create Email Templates
    const emailTemplates = [
      {
        name: 'welcome_email',
        subject: 'Welcome to Household Planet Kenya!',
        htmlContent: `
        <h1>Welcome to Household Planet Kenya!</h1>
        <p>Dear {{customer_name}},</p>
        <p>Thank you for joining Household Planet Kenya. We're excited to have you as part of our family!</p>
        <p>Start shopping now and enjoy:</p>
        <ul>
        <li>Quality household products</li>
        <li>Fast delivery across Kenya</li>
        <li>Competitive prices</li>
        </ul>
        <a href="{{shop_url}}" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Start Shopping</a>
        `,
        textContent: 'Welcome to Household Planet Kenya! Thank you for joining us.',
        variables: JSON.stringify(['customer_name', 'shop_url']),
        isActive: true
      },
      {
        name: 'order_confirmation',
        subject: 'Order Confirmation - {{order_number}}',
        htmlContent: `
        <h1>Order Confirmation</h1>
        <p>Dear {{customer_name}},</p>
        <p>Thank you for your order! Your order #{{order_number}} has been confirmed.</p>
        <h2>Order Details:</h2>
        <p>Total: {{order_total}}</p>
        <p>Delivery Address: {{delivery_address}}</p>
        <p>Expected delivery: {{delivery_date}}</p>
        `,
        textContent: 'Your order has been confirmed. Order number: {{order_number}}',
        variables: JSON.stringify(['customer_name', 'order_number', 'order_total', 'delivery_address', 'delivery_date']),
        isActive: true
      },
      {
        name: 'order_shipped',
        subject: 'Your Order is on the Way! - {{order_number}}',
        htmlContent: `
        <h1>Your Order is Shipped!</h1>
        <p>Dear {{customer_name}},</p>
        <p>Great news! Your order #{{order_number}} has been shipped and is on its way to you.</p>
        <p>Tracking Number: {{tracking_number}}</p>
        <p>Expected delivery: {{delivery_date}}</p>
        `,
        textContent: 'Your order has been shipped. Tracking: {{tracking_number}}',
        variables: JSON.stringify(['customer_name', 'order_number', 'tracking_number', 'delivery_date']),
        isActive: true
      },
      {
        name: 'password_reset',
        subject: 'Reset Your Password - Household Planet Kenya',
        htmlContent: `
        <h1>Password Reset Request</h1>
        <p>Dear {{customer_name}},</p>
        <p>You requested to reset your password. Click the link below to create a new password:</p>
        <a href="{{reset_link}}" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        `,
        textContent: 'Reset your password using this link: {{reset_link}}',
        variables: JSON.stringify(['customer_name', 'reset_link']),
        isActive: true
      }
    ];

    const createdTemplates = [];
    for (const template of emailTemplates) {
      const created = await prisma.emailTemplate.create({ data: template });
      createdTemplates.push(created);
    }

    // Create FAQs
    const faqs = [
      {
        question: 'How do I place an order?',
        answer: 'You can place an order by browsing our products, adding items to your cart, and proceeding to checkout. Create an account or checkout as a guest.',
        category: 'Orders',
        isPublished: true,
        sortOrder: 1
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept M-Pesa, bank transfers, and cash on delivery for your convenience.',
        category: 'Payment',
        isPublished: true,
        sortOrder: 2
      },
      {
        question: 'How long does delivery take?',
        answer: 'Delivery times vary by location: Nairobi (1-2 days), major towns (2-3 days), remote areas (3-5 days).',
        category: 'Delivery',
        isPublished: true,
        sortOrder: 3
      },
      {
        question: 'Can I return items?',
        answer: 'Yes, we accept returns within 7 days of delivery for unused items in original packaging.',
        category: 'Returns',
        isPublished: true,
        sortOrder: 4
      },
      {
        question: 'Do you offer free delivery?',
        answer: 'Yes, we offer free delivery on orders above KSh 5,000 within Nairobi and major towns.',
        category: 'Delivery',
        isPublished: true,
        sortOrder: 5
      },
      {
        question: 'How can I track my order?',
        answer: 'Once your order is shipped, you will receive a tracking number via SMS and email to track your package.',
        category: 'Orders',
        isPublished: true,
        sortOrder: 6
      },
      {
        question: 'Are your products genuine?',
        answer: 'Yes, all our products are 100% genuine and sourced directly from authorized distributors and manufacturers.',
        category: 'Products',
        isPublished: true,
        sortOrder: 7
      },
      {
        question: 'Can I change or cancel my order?',
        answer: 'You can change or cancel your order within 1 hour of placing it. Contact our customer service for assistance.',
        category: 'Orders',
        isPublished: true,
        sortOrder: 8
      }
    ];

    const createdFAQs = [];
    for (const faq of faqs) {
      const created = await prisma.fAQ.create({ data: faq });
      createdFAQs.push(created);
    }

    // Create Blog Posts
    const blogPosts = [
      {
        slug: 'top-10-kitchen-essentials-2024',
        title: 'Top 10 Kitchen Essentials Every Kenyan Home Needs in 2024',
        excerpt: 'Discover the must-have kitchen items that will transform your cooking experience and make meal preparation easier.',
        content: `
        <h1>Top 10 Kitchen Essentials Every Kenyan Home Needs in 2024</h1>
        <p>The kitchen is the heart of every home, and having the right tools can make cooking more enjoyable and efficient. Here are the top 10 kitchen essentials every Kenyan home should have:</p>
        
        <h2>1. Non-Stick Cookware Set</h2>
        <p>A good non-stick cookware set is essential for healthy cooking with less oil and easy cleanup.</p>
        
        <h2>2. Sharp Kitchen Knives</h2>
        <p>Quality knives make food preparation faster and safer. Invest in a good chef's knife and paring knife.</p>
        
        <h2>3. Cutting Boards</h2>
        <p>Have separate cutting boards for meat, vegetables, and fruits to maintain hygiene.</p>
        
        <h2>4. Storage Containers</h2>
        <p>Airtight containers keep your food fresh longer and help organize your pantry.</p>
        
        <h2>5. Electric Kettle</h2>
        <p>Perfect for making tea, coffee, and boiling water quickly and efficiently.</p>
        `,
        featuredImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
        author: 'Household Planet Team',
        tags: 'kitchen,essentials,cooking,home',
        metaTitle: 'Top 10 Kitchen Essentials for Kenyan Homes 2024',
        metaDescription: 'Discover the must-have kitchen items that every Kenyan home needs for efficient cooking and meal preparation.',
        isPublished: true,
        publishedAt: new Date()
      },
      {
        slug: 'home-organization-tips-small-spaces',
        title: 'Smart Home Organization Tips for Small Spaces in Kenya',
        excerpt: 'Maximize your living space with these clever organization tips and storage solutions perfect for Kenyan homes.',
        content: `
        <h1>Smart Home Organization Tips for Small Spaces in Kenya</h1>
        <p>Living in a small space doesn't mean you have to compromise on organization. Here are practical tips to maximize your space:</p>
        
        <h2>Vertical Storage Solutions</h2>
        <p>Use wall-mounted shelves and tall storage units to make use of vertical space.</p>
        
        <h2>Multi-Purpose Furniture</h2>
        <p>Choose furniture that serves multiple functions, like storage ottomans or beds with built-in drawers.</p>
        
        <h2>Declutter Regularly</h2>
        <p>Keep only what you need and use regularly. Donate or sell items you no longer need.</p>
        `,
        featuredImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        author: 'Home Organization Expert',
        tags: 'organization,storage,small spaces,home',
        metaTitle: 'Home Organization Tips for Small Spaces in Kenya',
        metaDescription: 'Learn how to organize and maximize small living spaces with these practical tips and storage solutions.',
        isPublished: true,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        slug: 'cleaning-hacks-kenyan-homes',
        title: '15 Cleaning Hacks Every Kenyan Household Should Know',
        excerpt: 'Save time and money with these effective cleaning tips using common household items available in Kenya.',
        content: `
        <h1>15 Cleaning Hacks Every Kenyan Household Should Know</h1>
        <p>Keeping your home clean doesn't have to be expensive or time-consuming. Here are practical cleaning hacks using items you already have:</p>
        
        <h2>Natural Cleaning Solutions</h2>
        <p>Use lemon, vinegar, and baking soda for effective, natural cleaning.</p>
        
        <h2>Time-Saving Tips</h2>
        <p>Clean as you go and establish daily cleaning routines to maintain a tidy home.</p>
        `,
        featuredImage: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800',
        author: 'Cleaning Expert',
        tags: 'cleaning,hacks,tips,household',
        metaTitle: '15 Cleaning Hacks for Kenyan Households',
        metaDescription: 'Discover effective cleaning hacks and tips to keep your Kenyan home spotless using common household items.',
        isPublished: true,
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      }
    ];

    const createdBlogPosts = [];
    for (const post of blogPosts) {
      const created = await prisma.blogPost.create({ data: post });
      createdBlogPosts.push(created);
    }

    console.log('✅ Final admin dashboard seeding completed:');
    console.log(`- ${createdBanners.length} banners`);
    console.log(`- ${createdPages.length} content pages`);
    console.log(`- ${createdTemplates.length} email templates`);
    console.log(`- ${createdFAQs.length} FAQ items`);
    console.log(`- ${createdBlogPosts.length} blog posts`);

  } catch (error) {
    console.error('❌ Final admin seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { finalAdminSeed };

if (require.main === module) {
  finalAdminSeed();
}