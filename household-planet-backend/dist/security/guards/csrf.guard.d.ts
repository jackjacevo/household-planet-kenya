import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CsrfProtectionService } from '../csrf-protection.service';
import { SecureLoggerService } from '../secure-logger.service';
export declare class CsrfGuard implements CanActivate {
    private readonly csrfService;
    private readonly secureLogger;
    private readonly reflector;
    private readonly logger;
    constructor(csrfService: CsrfProtectionService, secureLogger: SecureLoggerService, reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
    private isApiEndpoint;
    private hasValidApiAuth;
    private validateOrigin;
    private getClientIp;
    private getSessionId;
    private getCsrfToken;
}
