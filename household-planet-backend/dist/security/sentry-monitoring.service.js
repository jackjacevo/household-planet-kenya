"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentryMonitoringService = void 0;
const common_1 = require("@nestjs/common");
const Sentry = require("@sentry/node");
let SentryMonitoringService = class SentryMonitoringService {
    constructor() {
        this.initializeSentry();
    }
    initializeSentry() {
        Sentry.init({
            dsn: process.env.SENTRY_DSN || 'https://your-sentry-dsn@sentry.io/project-id',
            environment: process.env.NODE_ENV || 'development',
            tracesSampleRate: 1.0,
        });
    }
    captureException(error, context) {
        Sentry.withScope((scope) => {
            if (context) {
                scope.setContext('additional_info', context);
            }
            Sentry.captureException(error);
        });
    }
    captureSecurityEvent(event, details, userId) {
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
    capturePerformanceMetric(operation, duration, metadata) {
        console.log(`Performance: ${operation} - ${duration}ms`, metadata);
    }
    setUserContext(userId, email) {
        Sentry.setUser({
            id: userId,
            email: email,
        });
    }
    addBreadcrumb(message, category, level = 'info') {
        Sentry.addBreadcrumb({
            message,
            category,
            level,
            timestamp: Date.now() / 1000,
        });
    }
    captureAPIError(endpoint, method, statusCode, error) {
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
    captureBusinessLogicError(operation, error, businessContext) {
        Sentry.withScope((scope) => {
            scope.setTag('error_type', 'business_logic');
            scope.setTag('operation', operation);
            if (businessContext) {
                scope.setContext('business_context', businessContext);
            }
            Sentry.captureException(error);
        });
    }
    startTransaction(name, operation) {
        console.log(`Starting transaction: ${name} (${operation})`);
        return null;
    }
    configureScope(callback) {
        console.log('Configuring Sentry scope');
    }
};
exports.SentryMonitoringService = SentryMonitoringService;
exports.SentryMonitoringService = SentryMonitoringService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SentryMonitoringService);
//# sourceMappingURL=sentry-monitoring.service.js.map