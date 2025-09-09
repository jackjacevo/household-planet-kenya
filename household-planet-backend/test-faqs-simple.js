const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFaqs() {
  try {
    console.log('Testing FAQ functionality...\n');

    const allFaqs = await prisma.fAQ.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' }
    });
    console.log(`✅ Found ${allFaqs.length} published FAQs`);

    const categories = await prisma.fAQ.findMany({
      where: { isPublished: true, category: { not: null } },
      select: { category: true },
      distinct: ['category'],
    });
    const categoryList = categories.map(c => c.category);
    console.log(`✅ Categories:`, categoryList);

    console.log('\n📋 Sample FAQs:');
    allFaqs.slice(0, 3).forEach((faq, index) => {
      console.log(`${index + 1}. [${faq.category}] ${faq.question}`);
    });

    console.log('\n✅ FAQ system is working correctly!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFaqs();