"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleMonitoringService = void 0;
const common_1 = require("@nestjs/common");
let SimpleMonitoringService = class SimpleMonitoringService {
    logSecurityEvent(event, details) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event,
            details,
            severity: this.getEventSeverity(event)
        };
        console.log('🔒 SECURITY EVENT:', JSON.stringify(logEntry, null, 2));
    }
    detectThreat(input) {
        const threats = [
            /select.*from/i,
            /<script/i,
            /javascript:/i,
            /on\w+=/i
        ];
        return threats.some(pattern => pattern.test(input));
    }
    getEventSeverity(event) {
        const highEvents = ['SQL_INJECTION', 'XSS_ATTEMPT', 'BRUTE_FORCE'];
        const mediumEvents = ['FAILED_LOGIN', 'RATE_LIMIT'];
        if (highEvents.includes(event))
            return 'HIGH';
        if (mediumEvents.includes(event))
            return 'MEDIUM';
        return 'LOW';
    }
};
exports.SimpleMonitoringService = SimpleMonitoringService;
exports.SimpleMonitoringService = SimpleMonitoringService = __decorate([
    (0, common_1.Injectable)()
], SimpleMonitoringService);
//# sourceMappingURL=simple-monitoring.service.js.map