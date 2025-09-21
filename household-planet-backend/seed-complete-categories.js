const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const categoriesData = [
  {
    name: 'Kitchen and Dining',
    slug: 'kitchen-and-dining',
    description: 'Everything for your kitchen and dining needs',
    subcategories: ['Cookware', 'Utensils', 'Dinnerware', 'Appliances', 'Storage']
  },
  {
    name: 'Bathroom Accessories',
    slug: 'bathroom-accessories',
    description: 'Complete bathroom essentials and accessories',
    subcategories: ['Towels', 'Mats', 'Organizers', 'Fixtures', 'Decor']
  },
  {
    name: 'Cleaning and Laundry',
    slug: 'cleaning-and-laundry',
    description: 'Cleaning supplies and laundry essentials',
    subcategories: ['Cleaning Supplies', 'Tools', 'Laundry Accessories']
  },
  {
    name: 'Beddings and Bedroom Accessories',
    slug: 'beddings-and-bedroom-accessories',
    description: 'Comfortable bedding and bedroom essentials',
    subcategories: ['Sheets', 'Comforters', 'Pillows', 'Mattress Protectors']
  },
  {
    name: 'Storage and Organization',
    slug: 'storage-and-organization',
    description: 'Organize your home with smart storage solutions',
    subcategories: ['Containers', 'Shelving', 'Closet Organizers', 'Baskets']
  },
  {
    name: 'Home Decor and Accessories',
    slug: 'home-decor-and-accessories',
    description: 'Beautiful decor to enhance your living space',
    subcategories: ['Wall Art', 'Decorative Items', 'Rugs', 'Curtains']
  },
  {
    name: 'Jewelry',
    slug: 'jewelry',
    description: 'Fashion jewelry and accessories',
    subcategories: ['Fashion Jewelry', 'Jewelry Boxes', 'Accessories']
  },
  {
    name: 'Humidifier, Candles and Aromatherapy',
    slug: 'humidifier-candles-and-aromatherapy',
    description: 'Create a relaxing atmosphere with aromatherapy products',
    subcategories: ['Essential Oils', 'Diffusers', 'Scented Candles']
  },
  {
    name: 'Beauty and Cosmetics',
    slug: 'beauty-and-cosmetics',
    description: 'Beauty products and cosmetic essentials',
    subcategories: ['Skincare', 'Makeup', 'Tools', 'Mirrors']
  },
  {
    name: 'Home Appliances',
    slug: 'home-appliances',
    description: 'Essential home appliances and gadgets',
    subcategories: ['Small Appliances', 'Kitchen Gadgets', 'Electronics']
  },
  {
    name: 'Furniture',
    slug: 'furniture',
    description: 'Quality furniture for every room',
    subcategories: ['Living Room', 'Bedroom', 'Dining', 'Office Furniture']
  },
  {
    name: 'Outdoor and Garden',
    slug: 'outdoor-and-garden',
    description: 'Outdoor living and gardening essentials',
    subcategories: ['Patio Furniture', 'Garden Tools', 'Planters']
  },
  {
    name: 'Lighting and Electrical',
    slug: 'lighting-and-electrical',
    description: 'Lighting solutions and electrical accessories',
    subcategories: ['Lamps', 'Fixtures', 'Bulbs', 'Extension Cords']
  },
  {
    name: 'Bags and Belts',
    slug: 'bags-and-belts',
    description: 'Stylish bags and belts for every occasion',
    subcategories: ['Handbags', 'Backpacks', 'Belts', 'Travel Bags']
  }
];

async function seedCompleteCategories() {
  console.log('🏷️ Seeding Complete Categories (14 parent + subcategories)...');

  try {
    // Get existing categories
    const existingCategories = await prisma.category.findMany();
    console.log(`📋 Found ${existingCategories.length} existing categories`);

    let totalCreated = 0;
    let totalUpdated = 0;

    for (const categoryData of categoriesData) {
      try {
        // Check if parent category exists
        let parentCategory = await prisma.category.findFirst({
          where: { slug: categoryData.slug }
        });

        if (parentCategory) {
          // Update existing parent category
          parentCategory = await prisma.category.update({
            where: { id: parentCategory.id },
            data: {
              name: categoryData.name,
              description: categoryData.description,
              isActive: true
            }
          });
          console.log(`🔄 Updated parent category: ${parentCategory.name}`);
          totalUpdated++;
        } else {
          // Create new parent category
          parentCategory = await prisma.category.create({
            data: {
              name: categoryData.name,
              slug: categoryData.slug,
              description: categoryData.description,
              isActive: true,
              sortOrder: totalCreated + 1
            }
          });
          console.log(`✅ Created parent category: ${parentCategory.name}`);
          totalCreated++;
        }

        // Create/update subcategories
        for (let i = 0; i < categoryData.subcategories.length; i++) {
          const subCategoryName = categoryData.subcategories[i];
          const subCategorySlug = subCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

          let subCategory = await prisma.category.findFirst({
            where: { 
              slug: subCategorySlug,
              parentId: parentCategory.id
            }
          });

          if (subCategory) {
            subCategory = await prisma.category.update({
              where: { id: subCategory.id },
              data: {
                name: subCategoryName,
                description: `${subCategoryName} in ${categoryData.name}`,
                isActive: true,
                sortOrder: i + 1
              }
            });
            console.log(`  🔄 Updated subcategory: ${subCategory.name}`);
            totalUpdated++;
          } else {
            subCategory = await prisma.category.create({
              data: {
                name: subCategoryName,
                slug: subCategorySlug,
                description: `${subCategoryName} in ${categoryData.name}`,
                parentId: parentCategory.id,
                isActive: true,
                sortOrder: i + 1
              }
            });
            console.log(`  ↳ Created subcategory: ${subCategory.name}`);
            totalCreated++;
          }
        }
      } catch (error) {
        console.error(`❌ Failed to create category ${categoryData.name}:`, error.message);
      }
    }

    console.log(`\n🎉 Successfully processed: ${totalCreated} created, ${totalUpdated} updated!`);

    // Verify final count
    const finalCategories = await prisma.category.findMany({
      include: {
        children: true,
        _count: {
          select: { products: true }
        }
      }
    });

    const parentCategories = finalCategories.filter(cat => !cat.parentId);
    const subCategories = finalCategories.filter(cat => cat.parentId);

    console.log(`📊 Final count: ${parentCategories.length} parent categories, ${subCategories.length} subcategories`);
    console.log(`📋 Total categories: ${finalCategories.length}`);

  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCompleteCategories();