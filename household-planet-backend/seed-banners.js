const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedBanners() {
  try {
    // Clear existing banners
    await prisma.banner.deleteMany({});
    
    // Seed new banners
    await prisma.banner.createMany({
      data: [
        {
          title: 'Transforming Your Home',
          subtitle: 'Quality household items delivered to your doorstep across Kenya',
          image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
          link: '/products',
          buttonText: 'Shop Now',
          position: 'HERO',
          isActive: true,
          sortOrder: 1,
        },
        {
          title: 'Kitchen Essentials Collection',
          subtitle: 'Everything you need for your perfect kitchen',
          image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
          link: '/categories/kitchen',
          buttonText: 'Explore Kitchen',
          position: 'HERO',
          isActive: true,
          sortOrder: 2,
        },
        {
          title: 'Home Decor & Accessories',
          subtitle: 'Beautiful pieces to make your house a home',
          image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
          link: '/categories/home-decor',
          buttonText: 'Browse Decor',
          position: 'HERO',
          isActive: true,
          sortOrder: 3,
        },
        {
          title: 'Free Delivery',
          subtitle: 'On orders above KSh 2,000 within Nairobi',
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
          position: 'SECONDARY',
          isActive: true,
          sortOrder: 4,
        },
      ],
    });

    console.log('Banners seeded successfully!');
  } catch (error) {
    console.error('Error seeding banners:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedBanners();