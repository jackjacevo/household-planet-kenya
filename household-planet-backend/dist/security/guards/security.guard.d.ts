import { CanActivate, ExecutionContext } from '@nestjs/common';
import { SecurityService } from '../security.service';
import { ValidationService } from '../validation.service';
export declare class SecurityGuard implements CanActivate {
    private securityService;
    private validationService;
    constructor(securityService: SecurityService, validationService: ValidationService);
    canActivate(context: ExecutionContext): boolean;
    private checkSQLInjection;
    private checkXSS;
    private sanitizeRequest;
    private checkSuspiciousActivity;
}
