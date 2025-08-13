import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async submitFeedback(orderId: string, rating: number, comment?: string) {
    return this.prisma.deliveryFeedback.create({
      data: { orderId, rating, comment }
    });
  }

  async getFeedback(orderId: string) {
    return this.prisma.deliveryFeedback.findUnique({
      where: { orderId }
    });
  }

  async getAverageRating() {
    const result = await this.prisma.deliveryFeedback.aggregate({
      _avg: { rating: true },
      _count: { rating: true }
    });
    
    return {
      averageRating: result._avg.rating || 0,
      totalFeedbacks: result._count.rating
    };
  }

  async getFeedbackStats() {
    const ratings = await this.prisma.deliveryFeedback.groupBy({
      by: ['rating'],
      _count: { rating: true }
    });

    return ratings.map(r => ({
      rating: r.rating,
      count: r._count.rating
    }));
  }
}