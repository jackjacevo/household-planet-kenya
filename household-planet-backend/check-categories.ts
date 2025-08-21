import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCategories() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true, parentId: true }
  });
  
  console.log('Available categories:');
  categories.forEach(cat => {
    console.log(`- ID: ${cat.id}, Name: "${cat.name}", Slug: "${cat.slug}", Parent: ${cat.parentId}`);
  });
}

checkCategories()
  .catch(console.error)
  .finally(() => prisma.$disconnect());