import { RecommendationsService } from './recommendations.service';
export declare class TaskSchedulerService {
    private recommendationsService;
    constructor(recommendationsService: RecommendationsService);
    generateDailyRecommendations(): Promise<void>;
}
