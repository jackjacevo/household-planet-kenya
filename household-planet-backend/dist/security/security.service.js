"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
let SecurityService = class SecurityService {
    constructor() {
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32;
        this.ivLength = 16;
        this.tagLength = 16;
    }
    generateSecureToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }
    generateSecurePassword(length = 16) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(crypto.randomInt(0, charset.length));
        }
        return password;
    }
    hashSensitiveData(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
    verifyHash(data, hash) {
        const dataHash = this.hashSensitiveData(data);
        return crypto.timingSafeEqual(Buffer.from(dataHash), Buffer.from(hash));
    }
    generateCSRFToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    validateCSRFToken(token, sessionToken) {
        if (!token || !sessionToken)
            return false;
        return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(sessionToken));
    }
    sanitizeInput(input) {
        return input
            .replace(/[<>]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .trim();
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    isValidPhone(phone) {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }
    checkPasswordStrength(password) {
        const feedback = [];
        let score = 0;
        if (password.length >= 8)
            score += 1;
        else
            feedback.push('Password should be at least 8 characters long');
        if (/[a-z]/.test(password))
            score += 1;
        else
            feedback.push('Password should contain lowercase letters');
        if (/[A-Z]/.test(password))
            score += 1;
        else
            feedback.push('Password should contain uppercase letters');
        if (/\d/.test(password))
            score += 1;
        else
            feedback.push('Password should contain numbers');
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password))
            score += 1;
        else
            feedback.push('Password should contain special characters');
        return { score, feedback };
    }
    detectSQLInjection(input) {
        const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
            /('|\(|;|\||\*|%|<|>|\^|\[|\]|\{|\}|\(|\))/g,
            /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/i,
            /((\%3C)|<)((\%69)|i|(\%49))((\%6D)|m|(\%4D))((\%67)|g|(\%47))[^\n]+((\%3E)|>)/i
        ];
        return sqlPatterns.some(pattern => pattern.test(input));
    }
    detectXSS(input) {
        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe/gi,
            /<object/gi,
            /<embed/gi,
            /<link/gi,
            /<meta/gi
        ];
        return xssPatterns.some(pattern => pattern.test(input));
    }
    logSecurityEvent(event, details, userId) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event,
            details,
            userId,
            severity: this.getEventSeverity(event)
        };
        console.log('SECURITY EVENT:', JSON.stringify(logEntry));
    }
    getEventSeverity(event) {
        const highSeverityEvents = ['SQL_INJECTION_ATTEMPT', 'XSS_ATTEMPT', 'BRUTE_FORCE_ATTACK'];
        const mediumSeverityEvents = ['INVALID_TOKEN', 'RATE_LIMIT_EXCEEDED', 'SUSPICIOUS_LOGIN'];
        if (highSeverityEvents.includes(event))
            return 'HIGH';
        if (mediumSeverityEvents.includes(event))
            return 'MEDIUM';
        return 'LOW';
    }
};
exports.SecurityService = SecurityService;
exports.SecurityService = SecurityService = __decorate([
    (0, common_1.Injectable)()
], SecurityService);
//# sourceMappingURL=security.service.js.map