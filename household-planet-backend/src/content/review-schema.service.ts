import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewSchemaService {
  constructor(private prisma: PrismaService) {}

  async generateReviewSchema(productId: number) {
    const reviews = await this.prisma.review.findMany({
      where: { productId },
      include: { user: { select: { name: true } } }
    });

    if (reviews.length === 0) return null;

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    return {
      "@context": "https://schema.org/",
      "@type": "AggregateRating",
      "ratingValue": avgRating.toFixed(1),
      "reviewCount": reviews.length,
      "bestRating": "5",
      "worstRating": "1"
    };
  }

  async generateProductReviewMarkup(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        reviews: {
          include: { user: { select: { name: true } } },
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product || product.reviews.length === 0) return null;

    return {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "review": product.reviews.map(review => ({
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": review.rating,
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": review.user.name
        },
        "reviewBody": review.comment
      }))
    };
  }
}