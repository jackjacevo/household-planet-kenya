import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RecommendationsService } from './recommendations.service';

@Injectable()
export class TaskSchedulerService {
  constructor(private recommendationsService: RecommendationsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async generateDailyRecommendations() {
    console.log('Generating product recommendations...');
    await this.recommendationsService.generateRecommendations();
    console.log('Product recommendations generated successfully');
  }
}