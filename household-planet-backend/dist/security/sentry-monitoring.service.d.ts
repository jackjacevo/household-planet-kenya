export declare class SentryMonitoringService {
    constructor();
    private initializeSentry;
    captureException(error: Error, context?: any): void;
    captureSecurityEvent(event: string, details: any, userId?: string): void;
    capturePerformanceMetric(operation: string, duration: number, metadata?: any): void;
    setUserContext(userId: string, email?: string): void;
    addBreadcrumb(message: string, category: string, level?: 'info' | 'warning' | 'error'): void;
    captureAPIError(endpoint: string, method: string, statusCode: number, error: any): void;
    captureBusinessLogicError(operation: string, error: any, businessContext?: any): void;
    startTransaction(name: string, operation: string): any;
    configureScope(callback: (scope: any) => void): void;
}
