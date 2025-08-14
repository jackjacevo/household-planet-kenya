"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiVersioningService = void 0;
const common_1 = require("@nestjs/common");
let ApiVersioningService = class ApiVersioningService {
    constructor() {
        this.supportedVersions = ['v1', 'v2'];
        this.deprecatedVersions = new Map([
            ['v1', new Date('2024-12-31')],
        ]);
    }
    validateVersion(version) {
        if (!this.supportedVersions.includes(version)) {
            throw new common_1.BadRequestException(`API version ${version} is not supported. Supported versions: ${this.supportedVersions.join(', ')}`);
        }
        return true;
    }
    isVersionDeprecated(version) {
        return this.deprecatedVersions.has(version);
    }
    getDeprecationDate(version) {
        return this.deprecatedVersions.get(version) || null;
    }
    getVersionFromRequest(req) {
        const headerVersion = req.headers['api-version'];
        if (headerVersion) {
            return headerVersion;
        }
        const pathMatch = req.url.match(/^\/api\/(v\d+)\//);
        if (pathMatch) {
            return pathMatch[1];
        }
        return 'v2';
    }
    addDeprecationHeaders(res, version) {
        if (this.isVersionDeprecated(version)) {
            const deprecationDate = this.getDeprecationDate(version);
            res.setHeader('Deprecation', 'true');
            res.setHeader('Sunset', deprecationDate?.toISOString());
            res.setHeader('Link', '</api/v2>; rel="successor-version"');
        }
    }
    getApiVersionInfo() {
        const deprecated = Array.from(this.deprecatedVersions.entries()).map(([version, date]) => ({
            version,
            deprecationDate: date.toISOString(),
        }));
        return {
            current: 'v2',
            supported: this.supportedVersions,
            deprecated,
        };
    }
    transformResponseForVersion(data, version) {
        switch (version) {
            case 'v1':
                return this.transformToV1(data);
            case 'v2':
                return data;
            default:
                return data;
        }
    }
    transformToV1(data) {
        if (Array.isArray(data)) {
            return data.map(item => this.transformItemToV1(item));
        }
        return this.transformItemToV1(data);
    }
    transformItemToV1(item) {
        if (!item || typeof item !== 'object') {
            return item;
        }
        const v1Item = { ...item };
        delete v1Item.metadata;
        delete v1Item.createdBy;
        delete v1Item.updatedBy;
        if (v1Item.createdAt) {
            v1Item.created_at = v1Item.createdAt;
            delete v1Item.createdAt;
        }
        if (v1Item.updatedAt) {
            v1Item.updated_at = v1Item.updatedAt;
            delete v1Item.updatedAt;
        }
        return v1Item;
    }
};
exports.ApiVersioningService = ApiVersioningService;
exports.ApiVersioningService = ApiVersioningService = __decorate([
    (0, common_1.Injectable)()
], ApiVersioningService);
//# sourceMappingURL=api-versioning.service.js.map