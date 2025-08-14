import { Request, Response } from 'express';
import { CsrfService } from './csrf.service';
import { SecurityService } from './security.service';
export declare class SecurityController {
    private csrfService;
    private securityService;
    private sentryService;
    private vulnerabilityScanner;
    private incidentResponseService;
    private securityTrainingService;
    constructor(csrfService: CsrfService, securityService: SecurityService, sentryService: any, vulnerabilityScanner: any, incidentResponseService: any, securityTrainingService: any);
    getCsrfToken(req: Request, res: Response): void;
    healthCheck(): {
        status: string;
        timestamp: string;
        security: {
            https: boolean;
            headers: string;
            rateLimit: string;
            validation: string;
        };
    };
    reportSecurityViolation(req: Request): {
        status: string;
    };
    reportSecurityIncident(incidentData: any, req: any): Promise<any>;
    getIncidentResponsePlan(): any;
    getSecurityAuditLog(startDate?: string, endDate?: string): Promise<any>;
    generateSecurityReport(period: 'daily' | 'weekly' | 'monthly'): Promise<any>;
    scanDependencies(): Promise<any>;
    scanCodePatterns(): Promise<any>;
    scanConfiguration(): Promise<any>;
    getTrainingModules(): Promise<any>;
    completeTraining(moduleId: string, body: any, req: any): Promise<any>;
    getTrainingStatus(req: any): Promise<any>;
    generateTrainingReport(startDate?: string, endDate?: string): Promise<any>;
}
