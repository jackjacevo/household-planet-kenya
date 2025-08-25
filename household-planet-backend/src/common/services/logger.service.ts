import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppLogger extends Logger {
  error(message: string, trace?: string, context?: string) {
    super.error(message, trace, context || this.context);
  }

  warn(message: string, context?: string) {
    super.warn(message, context || this.context);
  }

  log(message: string, context?: string) {
    super.log(message, context || this.context);
  }

  debug(message: string, context?: string) {
    super.debug(message, context || this.context);
  }

  logDatabaseOperation(operation: string, table: string, duration?: number) {
    const message = duration 
      ? `${operation} on ${table} completed in ${duration}ms`
      : `${operation} on ${table}`;
    this.log(message, 'Database');
  }

  logFileOperation(operation: string, filename: string, success: boolean) {
    const status = success ? 'SUCCESS' : 'FAILED';
    this.log(`File ${operation} ${status}: ${filename}`, 'FileSystem');
  }

  logSecurityEvent(event: string, details: any) {
    this.warn(`Security Event: ${event} - ${JSON.stringify(details)}`, 'Security');
  }
}