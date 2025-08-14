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
exports.InputSanitizationInterceptor = void 0;
const common_1 = require("@nestjs/common");
const input_sanitizer_service_1 = require("../input-sanitizer.service");
let InputSanitizationInterceptor = class InputSanitizationInterceptor {
    constructor(sanitizer) {
        this.sanitizer = sanitizer;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        if (request.body && typeof request.body === 'object') {
            request.body = this.sanitizer.sanitizeUserInput(request.body);
        }
        if (request.query && typeof request.query === 'object') {
            request.query = this.sanitizer.sanitizeUserInput(request.query);
        }
        if (request.params && typeof request.params === 'object') {
            request.params = this.sanitizer.sanitizeUserInput(request.params);
        }
        return next.handle();
    }
};
exports.InputSanitizationInterceptor = InputSanitizationInterceptor;
exports.InputSanitizationInterceptor = InputSanitizationInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [input_sanitizer_service_1.InputSanitizerService])
], InputSanitizationInterceptor);
//# sourceMappingURL=input-sanitization.interceptor.js.map