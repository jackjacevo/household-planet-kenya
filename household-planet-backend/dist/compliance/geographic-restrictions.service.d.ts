import { PrismaService } from '../prisma/prisma.service';
export declare class GeographicRestrictionsService {
    private prisma;
    constructor(prisma: PrismaService);
    private readonly restrictedRegions;
    checkGeographicRestriction(productId: number, county: string, subcounty?: string): Promise<{
        allowed: boolean;
        reason: string;
    } | {
        allowed: boolean;
        reason?: undefined;
    }>;
    getAvailableRegions(productId: number): Promise<string[]>;
    logGeographicAccess(userId: number, productId: number, county: string, allowed: boolean): Promise<void>;
}
