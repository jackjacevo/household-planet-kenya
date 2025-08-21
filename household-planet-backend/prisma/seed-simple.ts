import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Kitchen & Dining',
        slug: 'kitchen-dining',
        description: 'Everything for your kitchen and dining needs',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Home Decor',
        slug: 'home-decor',
        description: 'Beautiful items to decorate your home',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Cleaning Supplies',
        slug: 'cleaning-supplies',
        description: 'Keep your home clean and fresh',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Storage & Organization',
        slug: 'storage-organization',
        description: 'Organize your space efficiently',
        isActive: true,
      },
    }),
  ])

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Non-Stick Cooking Pan Set',
        slug: 'non-stick-cooking-pan-set',
        description: 'Professional quality non-stick pans for all your cooking needs',
        price: 2500,
        comparePrice: 3000,
        sku: 'PAN-001',
        stock: 25,
        category: { connect: { id: categories[0].id } },
        isFeatured: true,
        images: JSON.stringify(['/images/products/pan-set-1.jpg', '/images/products/pan-set-2.jpg']),
        tags: JSON.stringify(['kitchen', 'cookware', 'non-stick']),
      },
    }),
    prisma.product.create({
      data: {
        name: 'Ceramic Dinner Plates Set',
        slug: 'ceramic-dinner-plates-set',
        description: 'Elegant ceramic dinner plates, set of 6',
        price: 1800,
        comparePrice: 2200,
        sku: 'PLATE-001',
        stock: 15,
        category: { connect: { id: categories[0].id } },
        isFeatured: true,
        images: JSON.stringify(['/images/products/plates-1.jpg']),
        tags: JSON.stringify(['kitchen', 'dining', 'ceramic']),
      },
    }),
    prisma.product.create({
      data: {
        name: 'Modern Wall Clock',
        slug: 'modern-wall-clock',
        description: 'Stylish modern wall clock for any room',
        price: 1200,
        sku: 'CLOCK-001',
        stock: 30,
        category: { connect: { id: categories[1].id } },
        isFeatured: true,
        images: JSON.stringify(['/images/products/clock-1.jpg']),
        tags: JSON.stringify(['decor', 'clock', 'modern']),
      },
    }),
    prisma.product.create({
      data: {
        name: 'All-Purpose Cleaner',
        slug: 'all-purpose-cleaner',
        description: 'Powerful all-purpose cleaner for every surface',
        price: 450,
        sku: 'CLEAN-001',
        stock: 50,
        category: { connect: { id: categories[2].id } },
        images: JSON.stringify(['/images/products/cleaner-1.jpg']),
        tags: JSON.stringify(['cleaning', 'household', 'cleaner']),
      },
    }),
  ])

  console.log('Database seeded successfully!')
  console.log(`Created ${categories.length} categories and ${products.length} products`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })