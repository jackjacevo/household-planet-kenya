import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';
import { LoyaltyService } from '../customers/loyalty.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin/loyalty')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
export class AdminLoyaltyController {
  constructor(
    private loyaltyService: LoyaltyService,
    private prisma: PrismaService
  ) {}

  @Get('stats')
  async getLoyaltyStats() {
    const [totalCustomers, pointsStats, activeRewards] = await Promise.all([
      this.prisma.customerProfile.count(),
      this.prisma.loyaltyTransaction.aggregate({
        _sum: { points: true },
        where: { type: { in: ['EARNED', 'REDEEMED'] } }
      }),
      this.prisma.loyaltyReward.count({ where: { isActive: true } })
    ]);

    const earnedPoints = await this.prisma.loyaltyTransaction.aggregate({
      _sum: { points: true },
      where: { type: 'EARNED' }
    });

    const redeemedPoints = await this.prisma.loyaltyTransaction.aggregate({
      _sum: { points: true },
      where: { type: 'REDEEMED' }
    });

    return {
      totalCustomers,
      totalPointsIssued: earnedPoints._sum.points || 0,
      totalPointsRedeemed: Math.abs(redeemedPoints._sum.points || 0),
      activeRewards
    };
  }

  @Get('rewards')
  async getRewards() {
    return this.prisma.loyaltyReward.findMany({
      include: { program: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Post('rewards')
  async createReward(@Body() rewardData: any) {
    const program = await this.prisma.loyaltyProgram.findFirst({
      where: { isActive: true }
    });

    return this.prisma.loyaltyReward.create({
      data: {
        ...rewardData,
        programId: program.id
      }
    });
  }

  @Get('customers')
  async getTopCustomers() {
    return this.prisma.customerProfile.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { loyaltyPoints: 'desc' },
      take: 50
    });
  }

  @Post('adjust-points')
  async adjustPoints(@Body() { userId, points, reason }: any) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new Error('Customer profile not found');
    }

    const program = await this.prisma.loyaltyProgram.findFirst({
      where: { isActive: true }
    });

    await Promise.all([
      this.prisma.loyaltyTransaction.create({
        data: {
          profileId: profile.id,
          programId: program.id,
          type: points > 0 ? 'EARNED' : 'REDEEMED',
          points,
          description: `Admin adjustment: ${reason}`
        }
      }),
      this.prisma.customerProfile.update({
        where: { id: profile.id },
        data: {
          loyaltyPoints: {
            increment: points
          }
        }
      })
    ]);

    return { success: true };
  }
}