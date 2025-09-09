const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFaqs() {
  try {
    console.log('Testing FAQ functionality...\n');

    // Test 1: Get all FAQs
    const allFaqs = await prisma.fAQ.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' }
    });
    console.log(`✅ Found ${allFaqs.length} published FAQs`);

    // Test 2: Get FAQ categories
    const categories = await prisma.fAQ.findMany({
      where: { isPublished: true, category: { not: null } },
      select: { category: true },
      distinct: ['category'],
    });
    const categoryList = categories.map(c => c.category);
    console.log(`✅ Found ${categoryList.length} categories:`, categoryList);

    // Test 3: Get FAQs by category
    if (categoryList.length > 0) {
      const categoryFaqs = await prisma.fAQ.findMany({
        where: { 
          isPublished: true,
          category: categoryList[0]
        },
        orderBy: { sortOrder: 'asc' }
      });
      console.log(`✅ Found ${categoryFaqs.length} FAQs in "${categoryList[0]}" category`);
    }

    // Display first few FAQs
    console.log('\n📋 Sample FAQs:');
    allFaqs.slice(0, 3).forEach((faq, index) => {
      console.log(`${index + 1}. [${faq.category}] ${faq.question}`);
      console.log(`   ${faq.answer.substring(0, 100)}...\n`);
    });

    console.log('✅ FAQ system is working correctly!');
  } catch (error) {
    console.error('❌ Error testing FAQs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFaqs();