const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const enhancedFaqs = [
  {
    question: 'What products do you sell?',
    answer: 'We offer a wide range of household items including kitchen appliances, home decor, cleaning supplies, storage solutions, bedding, and much more. All products are carefully selected for quality and value.',
    category: 'Products',
    isPublished: true,
    sortOrder: 1,
  },
  {
    question: 'What are your delivery areas?',
    answer: 'We deliver across Kenya with 4 pricing tiers: Tier 1 (KSh 100-200) includes Nairobi CBD, Kajiado, Kitengela. Tier 2 (KSh 250-300) includes Westlands, Kilimani, Machakos. Tier 3 (KSh 350-650) includes Karen, Mombasa, Kisumu. Tier 4 (KSh 550-1,000) includes JKIA, Ngong, and remote areas.',
    category: 'Delivery',
    isPublished: true,
    sortOrder: 2,
  },
  {
    question: 'How long does delivery take?',
    answer: 'Delivery takes 1 day for Nairobi areas (CBD, Westlands, Kilimani), 2-3 days for nearby towns (Thika, Machakos, Kiambu), and 3-5 days for upcountry locations (Mombasa, Kisumu, Eldoret). Express delivery available for select locations.',
    category: 'Delivery',
    isPublished: true,
    sortOrder: 3,
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept M-Pesa (most popular), Airtel Money, bank transfers, and cash on delivery. M-Pesa payments are processed instantly for faster order processing.',
    category: 'Payment',
    isPublished: true,
    sortOrder: 4,
  },
  {
    question: 'Is cash on delivery available?',
    answer: 'Yes, cash on delivery is available for most areas. A small COD fee may apply depending on your location and order value.',
    category: 'Payment',
    isPublished: true,
    sortOrder: 5,
  },
  {
    question: 'Can I return or exchange items?',
    answer: 'Yes, we have a 7-day return policy for unused items in original packaging. Items must be in resalable condition. Contact customer service to initiate a return.',
    category: 'Returns',
    isPublished: true,
    sortOrder: 6,
  },
  {
    question: 'How do I track my order?',
    answer: 'After your order ships, you\'ll receive a tracking number via SMS and email. You can track your order using our <a href="/track-order" class="text-orange-600 hover:text-orange-700 underline">Order Tracking page</a> or in your account dashboard.',
    category: 'Orders',
    isPublished: true,
    sortOrder: 7,
  },
  {
    question: 'Do you offer bulk discounts?',
    answer: 'Yes, we offer special pricing for bulk orders and wholesale purchases. Contact our sales team for custom quotes on large quantity orders.',
    category: 'Pricing',
    isPublished: true,
    sortOrder: 8,
  },
  {
    question: 'How do I create an account?',
    answer: 'Click "Register" at the top of the page, fill in your details, and verify your phone number. You can also create an account during checkout.',
    category: 'Account',
    isPublished: true,
    sortOrder: 9,
  },
  {
    question: 'Is my personal information secure?',
    answer: 'Yes, we use industry-standard security measures to protect your data. We never share your personal information with third parties without consent.',
    category: 'Security',
    isPublished: true,
    sortOrder: 10,
  },
  {
    question: 'What if an item is out of stock?',
    answer: 'If an item becomes unavailable after ordering, we\'ll contact you immediately with alternatives or offer a full refund. You can also request to be notified when items are back in stock.',
    category: 'Products',
    isPublished: true,
    sortOrder: 11,
  },
  {
    question: 'Do you have a physical store?',
    answer: 'We are primarily an online store, but we have a showroom in Nairobi where you can view select products. Contact us to schedule a visit.',
    category: 'Store',
    isPublished: true,
    sortOrder: 12,
  },
  {
    question: 'What are your delivery charges?',
    answer: 'Delivery charges vary by location: Nairobi (KSh 200), major towns (KSh 300-500), remote areas (KSh 500-800). Free delivery on orders above KSh 2,000 within Nairobi.',
    category: 'Delivery',
    isPublished: true,
    sortOrder: 13,
  },
  {
    question: 'How do I cancel my order?',
    answer: 'You can cancel your order within 2 hours of placing it by contacting customer service. After processing begins, cancellation may not be possible.',
    category: 'Orders',
    isPublished: true,
    sortOrder: 14,
  },
  {
    question: 'Do you offer warranties on products?',
    answer: 'Yes, most of our products come with manufacturer warranties. Warranty periods vary by product type and are clearly stated on product pages.',
    category: 'Products',
    isPublished: true,
    sortOrder: 15,
  },
  {
    question: 'What are your delivery charges?',
    answer: 'Delivery charges are tiered: Tier 1 (KSh 100-200), Tier 2 (KSh 250-300), Tier 3 (KSh 350-650), Tier 4 (KSh 550-1,000). FREE shipping on orders above KSh 5,000. 50% OFF delivery on orders above KSh 3,000.',
    category: 'Delivery',
    isPublished: true,
    sortOrder: 13,
  },
  {
    question: 'Do you offer promo codes?',
    answer: 'Yes! We regularly offer promo codes for discounts. Try codes like SAVE10, WELCOME20, or HOUSEHOLD15. You can apply promo codes during checkout in your cart.',
    category: 'Pricing',
    isPublished: true,
    sortOrder: 14,
  },
  {
    question: 'Where is your physical location?',
    answer: 'Our showroom is located at Moi Avenue, Iconic Business Plaza, Basement Shop B10, Nairobi. Visit us Mon-Sat: 8AM-6PM or contact us at +254790 227 760.',
    category: 'Store',
    isPublished: true,
    sortOrder: 15,
  },
  {
    question: 'How can I contact customer service?',
    answer: 'Contact us via phone (+254790 227 760), WhatsApp, email (householdplanet819@gmail.com), or through our contact form. We respond within 24 hours during business hours.',
    category: 'Support',
    isPublished: true,
    sortOrder: 16,
  }
];

async function seedEnhancedFaqs() {
  try {
    console.log('Clearing existing FAQs...');
    await prisma.fAQ.deleteMany({});

    console.log('Seeding enhanced FAQs...');
    await prisma.fAQ.createMany({
      data: enhancedFaqs,
    });

    console.log(`✅ Successfully seeded ${enhancedFaqs.length} enhanced FAQs`);
  } catch (error) {
    console.error('❌ Error seeding enhanced FAQs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedEnhancedFaqs();
}

module.exports = { seedEnhancedFaqs };