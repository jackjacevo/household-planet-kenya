import { ApiVersioningService } from './api-versioning.service';
import { ApiDocumentationService } from './api-documentation.service';
import { CorsConfigService } from './cors-config.service';
export declare class ApiSecurityController {
    private readonly apiVersioning;
    private readonly apiDocumentation;
    private readonly corsConfig;
    constructor(apiVersioning: ApiVersioningService, apiDocumentation: ApiDocumentationService, corsConfig: CorsConfigService);
    getVersionInfo(): {
        current: string;
        supported: string[];
        deprecated: Array<{
            version: string;
            deprecationDate: string;
        }>;
    };
    getSecurityDocumentation(): {
        guidelines: {
            authentication: any;
            authorization: any;
            rateLimiting: any;
            fileUpload: any;
            dataValidation: any;
            errorHandling: any;
        };
        endpoints: any;
        bestPractices: string[];
    };
    getCorsConfiguration(): {
        corsOptions: import("@nestjs/common/interfaces/external/cors-options.interface").CorsOptions;
        securityHeaders: Record<string, string>;
    };
    getHealthStatus(): {
        status: string;
        timestamp: string;
        version: string;
        environment: string;
        security: {
            httpsEnabled: boolean;
            rateLimitingEnabled: boolean;
            corsEnabled: boolean;
            authenticationRequired: boolean;
        };
    };
}
