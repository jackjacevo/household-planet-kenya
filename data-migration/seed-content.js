const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const contentPages = [
  {
    slug: 'about-us',
    title: 'About Household Planet Kenya',
    content: `
      <h1>About Household Planet Kenya</h1>
      <p>Welcome to Household Planet Kenya, your premier destination for quality household items and home essentials. Since our establishment, we have been committed to providing Kenyan families with affordable, high-quality products that make everyday living more comfortable and convenient.</p>
      
      <h2>Our Mission</h2>
      <p>To be Kenya's leading online marketplace for household essentials, offering exceptional value, quality products, and outstanding customer service to every home across the country.</p>
      
      <h2>What We Offer</h2>
      <ul>
        <li>Kitchen & Dining essentials</li>
        <li>Cleaning supplies and tools</li>
        <li>Home decor and furniture</li>
        <li>Storage and organization solutions</li>
        <li>Electronics and appliances</li>
        <li>And much more!</li>
      </ul>
      
      <h2>Why Choose Us</h2>
      <ul>
        <li>Quality guaranteed products</li>
        <li>Competitive prices</li>
        <li>Fast delivery across Kenya</li>
        <li>Secure payment options including M-Pesa</li>
        <li>Excellent customer support</li>
      </ul>
    `,
    metaTitle: 'About Us - Household Planet Kenya',
    metaDescription: 'Learn about Household Planet Kenya, your trusted source for quality household items and home essentials across Kenya.',
    isPublished: true
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    content: `
      <h1>Privacy Policy</h1>
      <p>Last updated: ${new Date().toLocaleDateString()}</p>
      
      <h2>Information We Collect</h2>
      <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.</p>
      
      <h2>How We Use Your Information</h2>
      <ul>
        <li>Process and fulfill your orders</li>
        <li>Communicate with you about your account or orders</li>
        <li>Provide customer support</li>
        <li>Improve our services</li>
      </ul>
      
      <h2>Information Sharing</h2>
      <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
      
      <h2>Data Security</h2>
      <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
      
      <h2>Contact Us</h2>
      <p>If you have questions about this Privacy Policy, please contact us at privacy@householdplanetkenya.co.ke</p>
    `,
    metaTitle: 'Privacy Policy - Household Planet Kenya',
    metaDescription: 'Read our privacy policy to understand how we collect, use, and protect your personal information.',
    isPublished: true
  },
  {
    slug: 'terms-of-service',
    title: 'Terms of Service',
    content: `
      <h1>Terms of Service</h1>
      <p>Last updated: ${new Date().toLocaleDateString()}</p>
      
      <h2>Acceptance of Terms</h2>
      <p>By accessing and using Household Planet Kenya, you accept and agree to be bound by the terms and provision of this agreement.</p>
      
      <h2>Products and Services</h2>
      <p>All products and services are subject to availability. We reserve the right to discontinue any product at any time.</p>
      
      <h2>Pricing and Payment</h2>
      <p>All prices are in Kenyan Shillings (KES) and include applicable taxes. Payment is due at the time of purchase.</p>
      
      <h2>Shipping and Delivery</h2>
      <p>We offer delivery services across Kenya. Delivery times and fees vary by location.</p>
      
      <h2>Returns and Refunds</h2>
      <p>We accept returns within 7 days of delivery for unused items in original packaging.</p>
      
      <h2>Contact Information</h2>
      <p>For questions about these Terms, contact us at legal@householdplanetkenya.co.ke</p>
    `,
    metaTitle: 'Terms of Service - Household Planet Kenya',
    metaDescription: 'Read our terms of service to understand the rules and regulations for using our platform.',
    isPublished: true
  }
];

async function seedContent() {
  console.log('📄 Creating content pages...');

  for (const page of contentPages) {
    await prisma.contentPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: page
    });
  }

  console.log('✅ Content pages created');
}

seedContent()
  .catch(console.error)
  .finally(() => prisma.$disconnect());