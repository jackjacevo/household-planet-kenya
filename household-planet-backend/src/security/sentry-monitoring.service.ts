import { Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryMonitoringService {
  constructor() {
    this.initializeSentry();
  }

  private initializeSentry() {
    Sentry.init({
      dsn: process.env.SENTRY_DSN || 'https://your-sentry-dsn@sentry.io/project-id',
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 1.0,
      // integrations: [
      //   new Sentry.Integrations.Http({ tracing: true }),
      //   new Sentry.Integrations.Express({ app: null }),
      // ],
    });
  }

  captureException(error: Error, context?: any) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext('additional_info', context);
      }
      Sentry.captureException(error);
    });
  }

  captureSecurityEvent(event: string, details: any, userId?: string) {
    Sentry.withScope((scope) => {
      scope.setTag('event_type', 'security');
      scope.setTag('security_event', event);
      
      if (userId) {
        scope.setUser({ id: userId });
      }
      
      scope.setContext('security_details', details);
      
      Sentry.captureMessage(`Security Event: ${event}`, 'warning');
    });
  }

  capturePerformanceMetric(operation: string, duration: number, metadata?: any) {
    // Performance metric capture
    console.log(`Performance: ${operation} - ${duration}ms`, metadata);
  }

  setUserContext(userId: string, email?: string) {
    Sentry.setUser({
      id: userId,
      email: email,
    });
  }

  addBreadcrumb(message: string, category: string, level: 'info' | 'warning' | 'error' = 'info') {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      timestamp: Date.now() / 1000,
    });
  }

  captureAPIError(endpoint: string, method: string, statusCode: number, error: any) {
    Sentry.withScope((scope) => {
      scope.setTag('api_endpoint', endpoint);
      scope.setTag('http_method', method);
      scope.setTag('status_code', statusCode);
      
      scope.setContext('api_error', {
        endpoint,
        method,
        statusCode,
        error: error.message || error,
      });
      
      Sentry.captureException(error);
    });
  }

  captureBusinessLogicError(operation: string, error: any, businessContext?: any) {
    Sentry.withScope((scope) => {
      scope.setTag('error_type', 'business_logic');
      scope.setTag('operation', operation);
      
      if (businessContext) {
        scope.setContext('business_context', businessContext);
      }
      
      Sentry.captureException(error);
    });
  }

  startTransaction(name: string, operation: string) {
    // Transaction tracking
    console.log(`Starting transaction: ${name} (${operation})`);
    return null;
  }

  configureScope(callback: (scope: any) => void) {
    // Scope configuration
    console.log('Configuring Sentry scope');
  }
}