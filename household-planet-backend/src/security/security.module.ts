import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { SecurityService } from './security.service';
import { EncryptionService } from './encryption.service';
import { ValidationService } from './validation.service';
import { CsrfService } from './csrf.service';
import { CsrfProtectionService } from './csrf-protection.service';
import { CsrfGuard } from './guards/csrf.guard';
import { SimpleMonitoringService } from './simple-monitoring.service';
import { SecurityController } from './security.controller';
import { CsrfController } from './csrf.controller';
import { SecureLoggerService } from './secure-logger.service';
import { LogSanitizerService } from './log-sanitizer.service';
import { InputSanitizerService } from './input-sanitizer.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100
      }
    ]),
  ],
  controllers: [SecurityController, CsrfController],
  providers: [
    SecurityService,
    EncryptionService,
    ValidationService,
    CsrfService,
    CsrfProtectionService,
    CsrfGuard,
    SimpleMonitoringService,
    SecureLoggerService,
    LogSanitizerService,
    InputSanitizerService,
    { provide: 'SentryMonitoringService', useClass: SimpleMonitoringService },
    { provide: 'VulnerabilityScanner', useValue: { scanDependencies: () => ({ status: 'ok' }), scanCodePatterns: () => ({ status: 'ok' }), scanConfiguration: () => ({ status: 'ok' }) } },
    { provide: 'IncidentResponseService', useValue: { reportSecurityIncident: () => ({ status: 'reported' }), getIncidentResponsePlan: () => ({ plan: 'basic' }), getSecurityAuditLog: () => ([]), generateSecurityReport: () => ({ report: 'basic' }) } },
    { provide: 'SecurityTrainingService', useValue: { getTrainingModules: () => ([]), recordTrainingCompletion: () => ({ status: 'completed' }), getTrainingStatus: () => ({ status: 'not_started' }), generateTrainingReport: () => ({ report: 'basic' }) } },
  ],
  exports: [
    SecurityService,
    EncryptionService,
    ValidationService,
    CsrfService,
    CsrfProtectionService,
    CsrfGuard,
    SimpleMonitoringService,
    SecureLoggerService,
    LogSanitizerService,
    InputSanitizerService,
  ],
})
export class SecurityModule {}