import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LoyaltyService } from '../customers/loyalty.service';

@Controller('loyalty')
@UseGuards(JwtAuthGuard)
export class LoyaltyController {
  constructor(private loyaltyService: LoyaltyService) {}

  @Get('profile')
  async getLoyaltyProfile(@Request() req) {
    try {
      const status = await this.loyaltyService.getCustomerLoyaltyStatus(req.user.userId);
      
      const points = status?.loyaltyPoints || 0;
      const transactions = status?.transactions || [];
      
      let tier = 'Bronze';
      let nextTier = 'Silver';
      let pointsToNextTier = 500;

      if (points >= 2000) {
        tier = 'Platinum';
        nextTier = null;
        pointsToNextTier = 0;
      } else if (points >= 1000) {
        tier = 'Gold';
        nextTier = 'Platinum';
        pointsToNextTier = 2000 - points;
      } else if (points >= 500) {
        tier = 'Silver';
        nextTier = 'Gold';
        pointsToNextTier = 1000 - points;
      }

      const totalEarned = transactions
        .filter(t => t.type === 'EARNED')
        .reduce((sum, t) => sum + t.points, 0);

      const totalRedeemed = Math.abs(transactions
        .filter(t => t.type === 'REDEEMED')
        .reduce((sum, t) => sum + t.points, 0));

      return {
        points,
        tier,
        nextTier,
        pointsToNextTier,
        totalEarned,
        totalRedeemed
      };
    } catch (error) {
      return {
        points: 0,
        tier: 'Bronze',
        nextTier: 'Silver',
        pointsToNextTier: 500,
        totalEarned: 0,
        totalRedeemed: 0
      };
    }
  }

  @Get('transactions')
  async getLoyaltyTransactions(@Request() req) {
    try {
      const status = await this.loyaltyService.getCustomerLoyaltyStatus(req.user.userId);
      return status?.transactions || [];
    } catch (error) {
      return [];
    }
  }

  @Get('rewards')
  async getAvailableRewards() {
    try {
      const programs = await this.loyaltyService.getActivePrograms();
      const rewards = programs?.flatMap(program => program.rewards) || [];
      return rewards;
    } catch (error) {
      return [];
    }
  }

  @Post('redeem/:rewardId')
  async redeemReward(@Request() req, @Param('rewardId') rewardId: string) {
    return this.loyaltyService.redeemPoints(req.user.userId, +rewardId);
  }
}