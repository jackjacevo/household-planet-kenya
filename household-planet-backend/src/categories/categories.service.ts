import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: createCategoryDto,
      include: { parent: true, children: true }
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: { parent: true, children: true },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async findOne(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: { parent: true, children: true, products: true }
    });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      include: { parent: true, children: true }
    });
  }

  async remove(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }

  async seedCategories() {
    const categories = [
      { name: 'Kitchen and Dining', slug: 'kitchen-dining', description: 'Cookware, Utensils, Dinnerware, Appliances, Storage', sortOrder: 1 },
      { name: 'Bathroom Accessories', slug: 'bathroom-accessories', description: 'Towels, Mats, Organizers, Fixtures, Decor', sortOrder: 2 },
      { name: 'Cleaning and Laundry', slug: 'cleaning-laundry', description: 'Cleaning Supplies, Tools, Laundry Accessories', sortOrder: 3 },
      { name: 'Beddings and Bedroom Accessories', slug: 'beddings-bedroom', description: 'Sheets, Comforters, Pillows, Mattress Protectors', sortOrder: 4 },
      { name: 'Storage and Organization', slug: 'storage-organization', description: 'Containers, Shelving, Closet Organizers, Baskets', sortOrder: 5 },
      { name: 'Home Decor and Accessories', slug: 'home-decor', description: 'Wall Art, Decorative Items, Rugs, Curtains', sortOrder: 6 },
      { name: 'Jewelry', slug: 'jewelry', description: 'Fashion Jewelry, Jewelry Boxes, Accessories', sortOrder: 7 },
      { name: 'Humidifier, Candles and Aromatherapy', slug: 'aromatherapy', description: 'Essential Oils, Diffusers, Scented Candles', sortOrder: 8 },
      { name: 'Beauty and Cosmetics', slug: 'beauty-cosmetics', description: 'Skincare, Makeup, Tools, Mirrors', sortOrder: 9 },
      { name: 'Home Appliances', slug: 'home-appliances', description: 'Small Appliances, Kitchen Gadgets, Electronics', sortOrder: 10 },
      { name: 'Furniture', slug: 'furniture', description: 'Living Room, Bedroom, Dining, Office Furniture', sortOrder: 11 },
      { name: 'Outdoor and Garden', slug: 'outdoor-garden', description: 'Patio Furniture, Garden Tools, Planters', sortOrder: 12 },
      { name: 'Lighting and Electrical', slug: 'lighting-electrical', description: 'Lamps, Fixtures, Bulbs, Extension Cords', sortOrder: 13 }
    ];

    for (const category of categories) {
      await this.prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: category
      });
    }

    return { message: 'Categories seeded successfully' };
  }
}