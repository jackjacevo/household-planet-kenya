import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileUploadGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const file = request.file;
    const files = request.files;

    // Allow the request to proceed - let the controller handle file validation
    // This guard is now just for logging and basic security checks
    
    if (file && file.size === 0) {
      throw new BadRequestException('Empty file not allowed');
    }
    
    if (files && Array.isArray(files)) {
      for (const f of files) {
        if (f.size === 0) {
          throw new BadRequestException('Empty files not allowed');
        }
      }
    }

    return true;
  }
}
