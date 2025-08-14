import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ApiVersioningService {
  private readonly supportedVersions = ['v1', 'v2'];
  private readonly deprecatedVersions = new Map([
    ['v1', new Date('2024-12-31')], // v1 deprecated on Dec 31, 2024
  ]);

  validateVersion(version: string): boolean {
    if (!this.supportedVersions.includes(version)) {
      throw new BadRequestException(`API version ${version} is not supported. Supported versions: ${this.supportedVersions.join(', ')}`);
    }

    return true;
  }

  isVersionDeprecated(version: string): boolean {
    return this.deprecatedVersions.has(version);
  }

  getDeprecationDate(version: string): Date | null {
    return this.deprecatedVersions.get(version) || null;
  }

  getVersionFromRequest(req: any): string {
    // Check header first
    const headerVersion = req.headers['api-version'];
    if (headerVersion) {
      return headerVersion;
    }

    // Check URL path
    const pathMatch = req.url.match(/^\/api\/(v\d+)\//);
    if (pathMatch) {
      return pathMatch[1];
    }

    // Default to latest version
    return 'v2';
  }

  addDeprecationHeaders(res: any, version: string): void {
    if (this.isVersionDeprecated(version)) {
      const deprecationDate = this.getDeprecationDate(version);
      res.setHeader('Deprecation', 'true');
      res.setHeader('Sunset', deprecationDate?.toISOString());
      res.setHeader('Link', '</api/v2>; rel="successor-version"');
    }
  }

  getApiVersionInfo(): {
    current: string;
    supported: string[];
    deprecated: Array<{ version: string; deprecationDate: string }>;
  } {
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

  transformResponseForVersion(data: any, version: string): any {
    switch (version) {
      case 'v1':
        return this.transformToV1(data);
      case 'v2':
        return data; // Current format
      default:
        return data;
    }
  }

  private transformToV1(data: any): any {
    // Transform v2 response format to v1 for backward compatibility
    if (Array.isArray(data)) {
      return data.map(item => this.transformItemToV1(item));
    }
    return this.transformItemToV1(data);
  }

  private transformItemToV1(item: any): any {
    if (!item || typeof item !== 'object') {
      return item;
    }

    // Example transformations for backward compatibility
    const v1Item = { ...item };

    // Remove new fields that didn't exist in v1
    delete v1Item.metadata;
    delete v1Item.createdBy;
    delete v1Item.updatedBy;

    // Rename fields that changed between versions
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
}