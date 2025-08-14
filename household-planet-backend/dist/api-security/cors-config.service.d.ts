import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
export declare class CorsConfigService {
    private readonly allowedOrigins;
    private readonly allowedMethods;
    private readonly allowedHeaders;
    getCorsOptions(): CorsOptions;
    private getAllowedOrigins;
    private getEnvironmentOrigins;
    private isOriginAllowed;
    validateOrigin(origin: string): boolean;
    getSecurityHeaders(): Record<string, string>;
}
