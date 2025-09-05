import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto, UpdateReviewDto, ReviewQueryDto } from './dto/review.dto';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createReviewDto: CreateReviewDto, images?: Express.Multer.File[]) {
    // Check if user has already reviewed this product
    const existingReview = await this.prisma.review.findUnique({
      where: {
        productId_userId: {
          productId: createReviewDto.productId,
          userId
        }
      }
    });

    if (existingReview) {
      throw new ForbiddenException('You have already reviewed this product');
    }

    // Check if user has purchased this product
    const hasPurchased = await this.prisma.orderItem.findFirst({
      where: {
        productId: createReviewDto.productId,
        order: { userId, status: 'DELIVERED' }
      }
    });

    // Handle image uploads
    let imageUrls: string[] = [];
    if (images && images.length > 0) {
      imageUrls = await this.saveReviewImages(images);
    }

    const review = await this.prisma.review.create({
      data: {
        ...createReviewDto,
        userId,
        isVerified: !!hasPurchased,
        images: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null
      },
      include: {
        user: { select: { name: true } },
        product: { select: { name: true } }
      }
    });

    // Update product rating stats
    await this.updateProductRatingStats(createReviewDto.productId);

    return review;
  }

  private async saveReviewImages(images: Express.Multer.File[]): Promise<string[]> {
    const uploadDir = path.join(process.cwd(), 'uploads', 'reviews');
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const imageUrls: string[] = [];

    for (const image of images) {
      const fileExtension = path.extname(image.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(uploadDir, fileName);
      
      // Save file
      fs.writeFileSync(filePath, image.buffer);
      
      // Store relative URL
      imageUrls.push(`/uploads/reviews/${fileName}`);
    }

    return imageUrls;
  }

  async findAll(query: ReviewQueryDto) {
    const { page = 1, limit = 10, productId, rating, isVerified } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (productId) where.productId = productId;
    if (rating) where.rating = rating;
    if (isVerified !== undefined) where.isVerified = isVerified;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          user: { select: { name: true } },
          product: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.review.count({ where })
    ]);

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findByProduct(productId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total, stats] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId },
        include: {
          user: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.review.count({ where: { productId } }),
      this.prisma.review.groupBy({
        by: ['rating'],
        where: { productId },
        _count: { rating: true }
      })
    ]);

    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: stats.find(s => s.rating === rating)?._count.rating || 0
    }));

    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution
      }
    };
  }

  async update(id: number, userId: number, updateReviewDto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId) throw new ForbiddenException('Cannot update other users reviews');

    const updatedReview = await this.prisma.review.update({
      where: { id },
      data: updateReviewDto,
      include: {
        user: { select: { name: true } },
        product: { select: { name: true } }
      }
    });

    // Update product rating stats
    await this.updateProductRatingStats(review.productId);

    return updatedReview;
  }

  async remove(id: number, userId: number, isAdmin = false) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    if (!isAdmin && review.userId !== userId) {
      throw new ForbiddenException('Cannot delete other users reviews');
    }

    const deletedReview = await this.prisma.review.delete({ where: { id } });

    // Update product rating stats
    await this.updateProductRatingStats(review.productId);

    return deletedReview;
  }

  async getProductRatingStats(productId: number) {
    const stats = await this.prisma.review.groupBy({
      by: ['rating'],
      where: { productId },
      _count: { rating: true },
      _avg: { rating: true }
    });

    const total = stats.reduce((sum, s) => sum + s._count.rating, 0);
    const average = stats.length > 0 ? stats[0]._avg.rating : 0;

    return {
      total,
      average: Math.round(average * 10) / 10,
      distribution: [1, 2, 3, 4, 5].map(rating => ({
        rating,
        count: stats.find(s => s.rating === rating)?._count.rating || 0,
        percentage: total > 0 ? Math.round((stats.find(s => s.rating === rating)?._count.rating || 0) / total * 100) : 0
      }))
    };
  }

  async markHelpful(reviewId: number) {
    return this.prisma.review.update({
      where: { id: reviewId },
      data: { isHelpful: { increment: 1 } }
    });
  }

  async reportReview(reviewId: number) {
    return this.prisma.review.update({
      where: { id: reviewId },
      data: { isReported: true }
    });
  }

  private async updateProductRatingStats(productId: number) {
    const stats = await this.prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true }
    });

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count.rating || 0
      }
    });
  }
}