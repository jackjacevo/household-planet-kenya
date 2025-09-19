import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: {
            product: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('findAll', () => {
    it('should return array of products', async () => {
      const mockProducts = [{
        id: 1,
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test description',
        isActive: true,
        shortDescription: 'Short desc',
        sku: 'TEST-001',
        price: 100,
        comparePrice: 0,
        weight: 0,
        dimensions: '',
        images: 'image1.jpg',
        imageAltTexts: null,
        categoryId: 1,
        brandId: null,
        isFeatured: false,
        seoTitle: null,
        seoDescription: null,
        tags: 'tag1,tag2',
        searchVector: null,
        averageRating: 0,
        totalReviews: 0,
        totalSales: 0,
        viewCount: 0,
        hasVariants: false,
        minPrice: null,
        maxPrice: null,
        stock: 10,
        lowStockThreshold: 5,
        trackStock: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }];
      jest.spyOn(prismaService.product, 'findMany').mockResolvedValue(mockProducts);

      const mockQuery = { page: 1, limit: 10 };
      const result = await service.findAll(mockQuery);
      expect(result).toEqual(mockProducts);
    });
  });

  describe('findOne', () => {
    it('should return a product', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test description',
        isActive: true,
        shortDescription: 'Short desc',
        sku: 'TEST-001',
        price: 100,
        comparePrice: 0,
        weight: 0,
        dimensions: '',
        images: 'image1.jpg',
        imageAltTexts: null,
        categoryId: 1,
        brandId: null,
        isFeatured: false,
        seoTitle: null,
        seoDescription: null,
        tags: 'tag1,tag2',
        searchVector: null,
        averageRating: 0,
        totalReviews: 0,
        totalSales: 0,
        viewCount: 0,
        hasVariants: false,
        minPrice: null,
        maxPrice: null,
        stock: 10,
        lowStockThreshold: 5,
        trackStock: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      jest.spyOn(prismaService.product, 'findUnique').mockResolvedValue(mockProduct);

      const result = await service.findOne(1);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('create', () => {
    it('should create and return a product', async () => {
      const createDto = {
        name: 'New Product',
        slug: 'new-product',
        sku: 'NEW-001',
        price: 150,
        images: JSON.stringify(['image1.jpg']),
        categoryId: 1,
        tags: 'tag1,tag2'
      };
      const mockProduct = {
        id: 1,
        name: 'New Product',
        slug: 'new-product',
        description: null,
        isActive: true,
        shortDescription: null,
        sku: 'NEW-001',
        price: 150,
        comparePrice: 0,
        weight: 0,
        dimensions: '',
        images: 'image1.jpg',
        imageAltTexts: null,
        categoryId: 1,
        brandId: null,
        isFeatured: false,
        seoTitle: null,
        seoDescription: null,
        tags: 'tag1,tag2',
        searchVector: null,
        averageRating: 0,
        totalReviews: 0,
        totalSales: 0,
        viewCount: 0,
        hasVariants: false,
        minPrice: null,
        maxPrice: null,
        stock: 10,
        lowStockThreshold: 5,
        trackStock: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      jest.spyOn(prismaService.product, 'create').mockResolvedValue(mockProduct);

      const result = await service.create(createDto);
      expect(result).toEqual(mockProduct);
    });
  });
});
