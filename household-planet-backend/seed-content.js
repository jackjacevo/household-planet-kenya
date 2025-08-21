const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedContentData() {
  try {
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
          `,
          metaTitle: 'Privacy Policy - Household Planet Kenya',
          metaDescription: 'Read our privacy policy to understand how we collect, use, and protect your personal information.',
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
          variables: { customerName: 'string', shopUrl: 'string' },
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
          variables: { customerName: 'string', orderNumber: 'string', orderTotal: 'number' },
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
          `,
          featuredImage: '/images/blog/kitchen-essentials.jpg',
          author: 'Household Planet Team',
          tags: 'kitchen, cooking, home essentials',
          metaTitle: '10 Essential Kitchen Items Every Kenyan Home Needs',
          metaDescription: 'Discover the must-have kitchen items for your Kenyan home. From quality pots to sharp knives, get everything you need.',
          isPublished: true,
          publishedAt: new Date(),
        },
      ],
    });

    console.log('Content management seed data created successfully!');
  } catch (error) {
    console.error('Error seeding content data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedContentData();