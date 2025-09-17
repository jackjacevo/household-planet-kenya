const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedFAQs() {
  console.log('🌱 Seeding FAQ data...');
  
  try {
    // Clear existing FAQs
    await prisma.fAQ.deleteMany();
    console.log('✅ Cleared existing FAQs');
    
    // Create sample FAQs
    const faqs = [
      {
        question: 'What are your delivery charges?',
        answer: 'Delivery charges vary by location. Nairobi CBD is KSh 100, while other areas range from KSh 300-700. Free delivery on orders above KSh 5,000.',
        category: 'Delivery',
        sortOrder: 1,
        isPublished: true
      },
      {
        question: 'How long does delivery take?',
        answer: 'Standard delivery takes 1-3 business days depending on your location. Express delivery is available for same-day or next-day delivery.',
        category: 'Delivery',
        sortOrder: 2,
        isPublished: true
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept M-Pesa, bank transfers, and cash on delivery. M-Pesa is our preferred payment method for faster processing.',
        category: 'Payment',
        sortOrder: 1,
        isPublished: true
      },
      {
        question: 'Can I return or exchange items?',
        answer: 'Yes, we accept returns within 7 days of delivery for unused items in original packaging. Contact our support team to initiate a return.',
        category: 'Returns',
        sortOrder: 1,
        isPublished: true
      },
      {
        question: 'How do I track my order?',
        answer: 'Once your order is dispatched, you will receive a tracking number via SMS and email. You can also check your order status in your account dashboard.',
        category: 'Orders',
        sortOrder: 1,
        isPublished: true
      }
    ];
    
    for (const faq of faqs) {
      await prisma.fAQ.create({ data: faq });
    }
    
    console.log(`✅ Created ${faqs.length} FAQs`);
    
    // Verify the data
    const count = await prisma.fAQ.count();
    const categories = await prisma.fAQ.findMany({
      where: { isPublished: true },
      select: { category: true },
      distinct: ['category']
    });
    
    console.log(`📊 Total FAQs: ${count}`);
    console.log(`📂 Categories: ${categories.map(c => c.category).join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error seeding FAQs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedFAQs();