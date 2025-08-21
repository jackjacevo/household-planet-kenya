import { Module, Global } from '@nestjs/common';
import { EncryptionService } from '../common/services/encryption.service';
import { AuditService } from '../common/services/audit.service';
import { SecurityController } from './security.controller';

@Global()
@Module({
  providers: [EncryptionService, AuditService],
  controllers: [SecurityController],
  exports: [EncryptionService, AuditService],
})
export class SecurityModule {}