import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoyaltyProgramDto, CreateLoyaltyRewardDto } from './dto/loyalty.dto';

@Injectable()
export class LoyaltyService {
  constructor(private prisma: PrismaService) {}

  async createProgram(programDto: CreateLoyaltyProgramDto) {
    return this.prisma.loyaltyProgram.create({
      data: programDto,
    });
  }

  async getActivePrograms() {
    return this.prisma.loyaltyProgram.findMany({
      where: { isActive: true },
      include: {
        rewards: {
          where: { isActive: true },
        },
      },
    });
  }

  async earnPoints(userId: number, orderId: number, amount: number) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new Error('Customer profile not found');
    }

    const program = await this.prisma.loyaltyProgram.findFirst({
      where: { isActive: true },
    });

    if (!program) {
      return null;
    }

    const points = Math.floor(amount * Number(program.pointsPerKsh));

    await Promise.all([
      this.prisma.loyaltyTransaction.create({
        data: {
          profileId: profile.id,
          programId: program.id,
          orderId,
          type: 'EARNED',
          points,
          description: `Points earned from order #${orderId}`,
        },
      }),
      this.prisma.customerProfile.update({
        where: { id: profile.id },
        data: {
          loyaltyPoints: {
            increment: points,
          },
        },
      }),
    ]);

    return { points, totalPoints: profile.loyaltyPoints + points };
  }

  async redeemPoints(userId: number, rewardId: number) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId },
    });

    const reward = await this.prisma.loyaltyReward.findUnique({
      where: { id: rewardId },
    });

    if (!profile || !reward) {
      throw new Error('Profile or reward not found');
    }

    if (profile.loyaltyPoints < reward.pointsCost) {
      throw new Error('Insufficient points');
    }

    const [redemption] = await Promise.all([
      this.prisma.loyaltyRedemption.create({
        data: {
          profileId: profile.id,
          rewardId,
          status: 'REDEEMED',
        },
      }),
      this.prisma.loyaltyTransaction.create({
        data: {
          profileId: profile.id,
          programId: reward.programId,
          type: 'REDEEMED',
          points: -reward.pointsCost,
          description: `Redeemed: ${reward.name}`,
        },
      }),
      this.prisma.customerProfile.update({
        where: { id: profile.id },
        data: {
          loyaltyPoints: {
            decrement: reward.pointsCost,
          },
        },
      }),
    ]);

    return redemption;
  }

  async createReward(rewardDto: CreateLoyaltyRewardDto) {
    return this.prisma.loyaltyReward.create({
      data: rewardDto,
    });
  }

  async getCustomerLoyaltyStatus(userId: number) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId },
      include: {
        loyaltyTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    const redemptions = await this.prisma.loyaltyRedemption.findMany({
      where: { profileId: profile?.id },
      include: {
        reward: true,
      },
      orderBy: { redeemedAt: 'desc' },
      take: 5,
    });

    return {
      loyaltyPoints: profile?.loyaltyPoints || 0,
      transactions: profile?.loyaltyTransactions || [],
      redemptions,
    };
  }
}
