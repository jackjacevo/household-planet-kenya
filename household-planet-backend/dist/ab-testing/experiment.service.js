"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExperimentService = void 0;
const common_1 = require("@nestjs/common");
const ab_testing_service_1 = require("./ab-testing.service");
let ExperimentService = class ExperimentService {
    constructor(abTestingService) {
        this.abTestingService = abTestingService;
    }
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
    async getExperimentConfig(experimentType, userId, sessionId) {
        const experiments = await this.abTestingService.getActiveExperiments();
        const experiment = experiments.find(exp => exp.type === experimentType);
        if (!experiment) {
            return null;
        }
        return this.abTestingService.assignUserToVariant(experiment.id, userId, sessionId);
    }
    async trackPurchase(experimentId, userId, sessionId, orderValue) {
        return this.abTestingService.trackConversion({
            experimentId,
            userId,
            event: 'purchase',
            value: orderValue,
        });
    }
    async trackAddToCart(experimentId, userId, sessionId, productPrice) {
        return this.abTestingService.trackConversion({
            experimentId,
            userId,
            event: 'add_to_cart',
            value: productPrice,
        });
    }
    async trackSignup(experimentId, userId, sessionId) {
        return this.abTestingService.trackConversion({
            experimentId,
            userId,
            event: 'signup',
            value: 1,
        });
    }
    async trackPageView(experimentId, userId, sessionId, page) {
        return this.abTestingService.trackConversion({
            experimentId,
            userId,
            event: 'page_view',
        });
    }
    async getRecommendations(experimentId) {
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
};
exports.ExperimentService = ExperimentService;
exports.ExperimentService = ExperimentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ab_testing_service_1.AbTestingService])
], ExperimentService);
//# sourceMappingURL=experiment.service.js.map