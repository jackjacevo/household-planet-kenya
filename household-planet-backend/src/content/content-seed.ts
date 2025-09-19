import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedContentData() {
  // Seed Content Pages
  await prisma.contentPage.createMany({
    data: [
      {
        slug: 'about-us',
        title: 'About Household Planet Kenya',
        content: `
          <h2>Welcome to Household Planet Kenya</h2>
          <p>Your trusted partner for quality household items across Kenya. We are committed to providing you with the best products at competitive prices, delivered right to your doorstep.</p>
          
          <h3>Our Mission</h3>
          <p>To make quality household items accessible to every Kenyan family through convenient online shopping and reliable delivery services.</p>
          
          <h3>Why Choose Us?</h3>
          <ul>
            <li>Wide range of quality products</li>
            <li>Competitive prices</li>
            <li>Fast and reliable delivery</li>
            <li>Excellent customer service</li>
            <li>Secure payment options</li>
          </ul>
        `,
        metaTitle: 'About Us - Household Planet Kenya',
        metaDescription: 'Learn about Household Planet Kenya, your trusted partner for quality household items with fast delivery across Kenya.',
        isPublished: true,
      },
      {
        slug: 'privacy-policy',
        title: 'Privacy Policy',
        content: `
          <h2>Privacy Policy</h2>
          <p>Last updated: ${new Date().toLocaleDateString()}</p>
          
          <h3>Information We Collect</h3>
          <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us.</p>
          
          <h3>How We Use Your Information</h3>
          <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
          
          <h3>Information Sharing</h3>
          <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
        `,
        metaTitle: 'Privacy Policy - Household Planet Kenya',
        metaDescription: 'Read our privacy policy to understand how we collect, use, and protect your personal information.',
        isPublished: true,
      },
      {
        slug: 'terms-of-service',
        title: 'Terms of Service',
        content: `
          <h2>Terms of Service</h2>
          <p>Last updated: ${new Date().toLocaleDateString()}</p>
          
          <h3>Acceptance of Terms</h3>
          <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
          
          <h3>Use License</h3>
          <p>Permission is granted to temporarily download one copy of the materials on Household Planet Kenya's website for personal, non-commercial transitory viewing only.</p>
          
          <h3>Disclaimer</h3>
          <p>The materials on Household Planet Kenya's website are provided on an 'as is' basis. Household Planet Kenya makes no warranties, expressed or implied.</p>
        `,
        metaTitle: 'Terms of Service - Household Planet Kenya',
        metaDescription: 'Read our terms of service to understand the rules and regulations for using our website and services.',
        isPublished: true,
      },
    ],
  });

  // Seed Banners
  await prisma.banner.createMany({
    data: [
      {
        title: 'Welcome to Household Planet Kenya',
        subtitle: 'Quality household items delivered to your doorstep',
        image: '/images/banners/hero-banner.jpg',
        link: '/products',
        buttonText: 'Shop Now',
        position: 'HERO',
        isActive: true,
        sortOrder: 1,
      },
      {
        title: 'Free Delivery',
        subtitle: 'On orders above KSh 2,000',
        image: '/images/banners/free-delivery.jpg',
        position: 'SECONDARY',
        isActive: true,
        sortOrder: 2,
      },
    ],
  });

  // Seed Email Templates
  await prisma.emailTemplate.createMany({
    data: [
      {
        name: 'welcome',
        subject: 'Welcome to Household Planet Kenya!',
        htmlContent: `
          <h2>Welcome {{customerName}}!</h2>
          <p>Thank you for joining Household Planet Kenya. We're excited to have you as part of our family.</p>
          <p>Start shopping for quality household items with fast delivery across Kenya.</p>
          <a href="{{shopUrl}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Shopping</a>
        `,
        textContent: 'Welcome {{customerName}}! Thank you for joining Household Planet Kenya.',
        variables: JSON.stringify({ customerName: 'string', shopUrl: 'string' }),
        isActive: true,
      },
      {
        name: 'order-confirmation',
        subject: 'Order Confirmation - {{orderNumber}}',
        htmlContent: `
          <h2>Order Confirmed!</h2>
          <p>Hi {{customerName}},</p>
          <p>Your order {{orderNumber}} has been confirmed and is being processed.</p>
          <p><strong>Order Total:</strong> KSh {{orderTotal}}</p>
          <p>We'll send you another email when your order ships.</p>
        `,
        textContent: 'Hi {{customerName}}, your order {{orderNumber}} has been confirmed.',
        variables: JSON.stringify({ customerName: 'string', orderNumber: 'string', orderTotal: 'number' }),
        isActive: true,
      },
      {
        name: 'order-shipped',
        subject: 'Your Order Has Shipped - {{orderNumber}}',
        htmlContent: `
          <h2>Your Order is on the Way!</h2>
          <p>Hi {{customerName}},</p>
          <p>Great news! Your order {{orderNumber}} has been shipped.</p>
          <p><strong>Tracking Number:</strong> {{trackingNumber}}</p>
          <p>Expected delivery: {{expectedDelivery}}</p>
        `,
        textContent: 'Hi {{customerName}}, your order {{orderNumber}} has been shipped. Tracking: {{trackingNumber}}',
        variables: JSON.stringify({ customerName: 'string', orderNumber: 'string', trackingNumber: 'string', expectedDelivery: 'string' }),
        isActive: true,
      },
    ],
  });

  // Seed FAQs
  await prisma.fAQ.createMany({
    data: [
      {
        question: 'What are your delivery areas?',
        answer: 'We deliver to all major towns and cities across Kenya including Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, and many more.',
        category: 'Delivery',
        isPublished: true,
        sortOrder: 1,
      },
      {
        question: 'How long does delivery take?',
        answer: 'Delivery typically takes 1-3 business days within Nairobi and 2-5 business days for other areas, depending on your location.',
        category: 'Delivery',
        isPublished: true,
        sortOrder: 2,
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept M-Pesa, cash on delivery, and bank transfers. M-Pesa is our most popular and convenient payment method.',
        category: 'Payment',
        isPublished: true,
        sortOrder: 3,
      },
      {
        question: 'Can I return items if I\'m not satisfied?',
        answer: 'Yes, we have a 7-day return policy for unused items in their original packaging. Contact our customer service for return instructions.',
        category: 'Returns',
        isPublished: true,
        sortOrder: 4,
      },
      {
        question: 'Do you offer bulk discounts?',
        answer: 'Yes, we offer special pricing for bulk orders. Contact our sales team for a custom quote on large quantity purchases.',
        category: 'Pricing',
        isPublished: true,
        sortOrder: 5,
      },
      {
        question: 'How can I track my order?',
        answer: 'Once your order ships, you\'ll receive a tracking number via SMS and email. You can also check your order status in your account dashboard.',
        category: 'Orders',
        isPublished: true,
        sortOrder: 6,
      },
    ],
  });

  // Seed Blog Posts
  await prisma.blogPost.createMany({
    data: [
      {
        slug: 'essential-kitchen-items-every-kenyan-home',
        title: '10 Essential Kitchen Items Every Kenyan Home Needs',
        excerpt: 'Discover the must-have kitchen items that will make cooking easier and more enjoyable in your Kenyan home.',
        content: `
          <p>The kitchen is the heart of every Kenyan home, where families gather to prepare and share meals. Having the right kitchen items can make cooking more efficient and enjoyable.</p>
          
          <h3>1. Quality Cooking Pots</h3>
          <p>Invest in durable, non-stick cooking pots that distribute heat evenly. Stainless steel and ceramic-coated options are excellent choices.</p>
          
          <h3>2. Sharp Kitchen Knives</h3>
          <p>A good set of sharp knives is essential for food preparation. Include a chef's knife, paring knife, and serrated knife.</p>
          
          <h3>3. Cutting Boards</h3>
          <p>Have separate cutting boards for meat, vegetables, and fruits to maintain hygiene and prevent cross-contamination.</p>
          
          <p>Continue reading to discover the remaining 7 essential items...</p>
        `,
        featuredImage: '/images/blog/kitchen-essentials.jpg',
        author: 'Household Planet Team',
        tags: 'kitchen, cooking, home essentials',
        metaTitle: '10 Essential Kitchen Items Every Kenyan Home Needs',
        metaDescription: 'Discover the must-have kitchen items for your Kenyan home. From quality pots to sharp knives, get everything you need.',
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        slug: 'organizing-your-home-kenyan-style',
        title: 'Organizing Your Home the Kenyan Way: Tips and Tricks',
        excerpt: 'Learn practical home organization tips that work perfectly for Kenyan households and lifestyles.',
        content: `
          <p>A well-organized home creates a peaceful environment and makes daily life more efficient. Here are practical tips for organizing your Kenyan home.</p>
          
          <h3>Start with Decluttering</h3>
          <p>Begin by removing items you no longer need. Donate clothes, books, and household items to local charities.</p>
          
          <h3>Use Local Storage Solutions</h3>
          <p>Incorporate traditional Kenyan storage methods like woven baskets and wooden boxes alongside modern organizers.</p>
          
          <p>Read more for detailed organization strategies...</p>
        `,
        featuredImage: '/images/blog/home-organization.jpg',
        author: 'Household Planet Team',
        tags: 'organization, home improvement, lifestyle',
        metaTitle: 'Home Organization Tips for Kenyan Households',
        metaDescription: 'Practical home organization tips and tricks that work perfectly for Kenyan households and lifestyles.',
        isPublished: true,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
    ],
  });

  console.log('Content management seed data created successfully!');
}

if (require.main === module) {
  seedContentData()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
