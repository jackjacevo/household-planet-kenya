export declare class ApiVersioningService {
    private readonly supportedVersions;
    private readonly deprecatedVersions;
    validateVersion(version: string): boolean;
    isVersionDeprecated(version: string): boolean;
    getDeprecationDate(version: string): Date | null;
    getVersionFromRequest(req: any): string;
    addDeprecationHeaders(res: any, version: string): void;
    getApiVersionInfo(): {
        current: string;
        supported: string[];
        deprecated: Array<{
            version: string;
            deprecationDate: string;
        }>;
    };
    transformResponseForVersion(data: any, version: string): any;
    private transformToV1;
    private transformItemToV1;
}
