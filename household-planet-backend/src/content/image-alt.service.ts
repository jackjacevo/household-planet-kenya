import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ImageAltService {
  constructor(private prisma: PrismaService) {}

  async generateProductAltText(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { category: true, brand: true }
    });

    if (!product) return [];

    const images = JSON.parse(product.images || '[]');
    const baseAlt = `${product.name} - ${product.category?.name || 'Home Product'} Kenya`;
    
    return images.map((_, index) => 
      `${baseAlt} ${index + 1} - ${product.brand?.name || 'Quality'} Brand`
    );
  }

  async updateProductImageAlt(productId: number) {
    const altTexts = await this.generateProductAltText(productId);
    
    return this.prisma.product.update({
      where: { id: productId },
      data: { 
        imageAltTexts: JSON.stringify(altTexts)
      }
    });
  }

  async bulkUpdateImageAlt() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      select: { id: true }
    });

    for (const product of products) {
      await this.updateProductImageAlt(product.id);
    }

    return { updated: products.length };
  }
}