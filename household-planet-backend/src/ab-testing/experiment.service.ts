import { Injectable } from '@nestjs/common';
import { AbTestingService } from './ab-testing.service';

@Injectable()
export class ExperimentService {
  constructor(private abTestingService: AbTestingService) {}

  async createButtonColorExperiment() {
    return this.abTestingService.createExperiment({
      name: 'Add to Cart Button Color Test',
      description: 'Testing different button colors for add to cart conversion',
    });
  }

  async createCheckoutLayoutExperiment() {
    return this.abTestingService.createExperiment({
      name: 'Checkout Layout Optimization',
      description: 'Testing single-page vs multi-step checkout',
    });
  }

  async createPricingDisplayExperiment() {
    return this.abTestingService.createExperiment({
      name: 'Pricing Display Test',
      description: 'Testing different ways to display product pricing',
    });
  }

  async createProductPageLayoutExperiment() {
    return this.abTestingService.createExperiment({
      name: 'Product Page Layout Test',
      description: 'Testing different product page layouts for better engagement',
    });
  }

  async createContentExperiment() {
    return this.abTestingService.createExperiment({
      name: 'Homepage Hero Content Test',
      description: 'Testing different hero section content for better engagement',
    });
  }

  async getExperimentConfig(experimentType: string, userId?: string, sessionId?: string) {
    const experiments = await this.abTestingService.getActiveExperiments();
    const experiment = experiments.find(exp => exp.type === experimentType);

    if (!experiment) {
      return null;
    }

    return this.abTestingService.assignUserToVariant(experiment.id, userId, sessionId);
  }

  async trackPurchase(experimentId: string, userId?: string, sessionId?: string, orderValue?: number) {
    return this.abTestingService.trackConversion({
      experimentId,
      userId,
      event: 'purchase',
      value: orderValue,
    });
  }

  async trackAddToCart(experimentId: string, userId?: string, sessionId?: string, productPrice?: number) {
    return this.abTestingService.trackConversion({
      experimentId,
      userId,
      event: 'add_to_cart',
      value: productPrice,
    });
  }

  async trackSignup(experimentId: string, userId?: string, sessionId?: string) {
    return this.abTestingService.trackConversion({
      experimentId,
      userId,
      event: 'signup',
      value: 1,
    });
  }

  async trackPageView(experimentId: string, userId?: string, sessionId?: string, page?: string) {
    return this.abTestingService.trackConversion({
      experimentId,
      userId,
      event: 'page_view',
    });
  }

  async getRecommendations(experimentId: string) {
    const results = await this.abTestingService.getExperimentResults(experimentId);
    
    if (!results.conversionRate) {
      return {
        status: 'inconclusive',
        message: 'Not enough data to determine a winner. Continue running the experiment.',
        recommendations: [
          'Ensure sufficient traffic to each variant',
          'Run experiment for at least 2 weeks',
          'Monitor for seasonal effects',
        ],
      };
    }

    if (results.conversionRate < 0.05) {
      return {
        status: 'not_significant',
        message: 'Winner identified but not statistically significant.',
        recommendations: [
          'Continue running experiment for more data',
          'Consider increasing traffic allocation',
          'Review experiment design for potential issues',
        ],
      };
    }

    return {
      status: 'significant_winner',
      conversionRate: results.conversionRate,
      message: `Experiment shows ${results.conversionRate.toFixed(1)}% conversion rate.`,
      recommendations: [
        'Implement winning variant for all users',
        'Document learnings for future experiments',
        'Plan follow-up experiments based on insights',
      ],
    };
  }
}