import { PrismaService } from '../prisma/prisma.service';
export declare class DisputeResolutionService {
    private prisma;
    constructor(prisma: PrismaService);
    initiateDispute(userId: number, disputeData: any): Promise<{
        id: string;
        description: string;
        userId: string;
        type: string;
        status: string;
        initiatedAt: Date;
        escalatedAt: Date | null;
        escalationReason: string | null;
        assignedDepartment: string | null;
    }>;
    getDisputeResolutionProcess(): Promise<{
        steps: {
            step: number;
            title: string;
            description: string;
            timeframe: string;
        }[];
        totalTimeframe: string;
        escalationOptions: string[];
    }>;
    updateDisputeStatus(disputeId: number, status: string, resolution?: string): Promise<{
        id: string;
        description: string;
        userId: string;
        type: string;
        status: string;
        initiatedAt: Date;
        escalatedAt: Date | null;
        escalationReason: string | null;
        assignedDepartment: string | null;
    }>;
    getDisputeHistory(userId: number): Promise<{
        id: string;
        description: string;
        userId: string;
        type: string;
        status: string;
        initiatedAt: Date;
        escalatedAt: Date | null;
        escalationReason: string | null;
        assignedDepartment: string | null;
    }[]>;
    escalateDispute(disputeId: number, reason: string): Promise<void>;
    private calculatePriority;
    private calculateResolutionDate;
    private assignDispute;
    private getDepartmentForDispute;
    private notifyEscalation;
}
