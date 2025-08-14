import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DisputeResolutionService {
  constructor(private prisma: PrismaService) {}

  async initiateDispute(userId: number, disputeData: any) {
    const dispute = await this.prisma.dispute.create({
      data: {
        userId: userId.toString(),
        type: disputeData.type,
        description: disputeData.description,
        status: 'OPEN',
        initiatedAt: new Date(),
      },
    });

    // Auto-assign to appropriate department
    await this.assignDispute(dispute.id, disputeData.type);
    
    return dispute;
  }

  async getDisputeResolutionProcess() {
    return {
      steps: [
        {
          step: 1,
          title: 'Submit Dispute',
          description: 'File your dispute with detailed information',
          timeframe: 'Immediate',
        },
        {
          step: 2,
          title: 'Initial Review',
          description: 'Our team reviews your dispute',
          timeframe: '1-2 business days',
        },
        {
          step: 3,
          title: 'Investigation',
          description: 'Thorough investigation of the issue',
          timeframe: '3-5 business days',
        },
        {
          step: 4,
          title: 'Resolution Proposal',
          description: 'We propose a resolution',
          timeframe: '1-2 business days',
        },
        {
          step: 5,
          title: 'Final Resolution',
          description: 'Implementation of agreed solution',
          timeframe: '1-3 business days',
        },
      ],
      totalTimeframe: '7-14 business days',
      escalationOptions: [
        'Internal escalation to senior management',
        'External mediation through Consumer Federation of Kenya',
        'Legal action through small claims court',
      ],
    };
  }

  async updateDisputeStatus(disputeId: number, status: string, resolution?: string) {
    return this.prisma.dispute.update({
      where: { id: disputeId.toString() },
      data: {
        status,
      },
    });
  }

  async getDisputeHistory(userId: number) {
    return this.prisma.dispute.findMany({
      where: { userId: userId.toString() },
      orderBy: { initiatedAt: 'desc' },
    });
  }

  async escalateDispute(disputeId: number, reason: string) {
    await this.prisma.dispute.update({
      where: { id: disputeId.toString() },
      data: {
        status: 'ESCALATED',
        escalationReason: reason,
      },
    });

    // Notify senior management
    await this.notifyEscalation(disputeId);
  }

  private calculatePriority(disputeData: any): string {
    if (disputeData.amount > 10000) return 'HIGH';
    if (disputeData.type === 'SAFETY_CONCERN') return 'HIGH';
    if (disputeData.type === 'FRAUD') return 'HIGH';
    return 'MEDIUM';
  }

  private calculateResolutionDate(disputeType: string): Date {
    const baseDays = disputeType === 'REFUND' ? 7 : 14;
    return new Date(Date.now() + baseDays * 24 * 60 * 60 * 1000);
  }

  private async assignDispute(disputeId: string, disputeType: string) {
    const department = this.getDepartmentForDispute(disputeType);
    
    await this.prisma.dispute.update({
      where: { id: disputeId },
      data: { assignedDepartment: department },
    });
  }

  private getDepartmentForDispute(disputeType: string): string {
    const departmentMap = {
      'REFUND': 'FINANCE',
      'PRODUCT_QUALITY': 'QUALITY_ASSURANCE',
      'DELIVERY': 'LOGISTICS',
      'FRAUD': 'SECURITY',
      'BILLING': 'FINANCE',
      'TECHNICAL': 'TECHNICAL_SUPPORT',
    };
    
    return departmentMap[disputeType] || 'CUSTOMER_SERVICE';
  }

  private async notifyEscalation(disputeId: number) {
    // Implementation for notifying management
    console.log(`Dispute ${disputeId} escalated to senior management`);
  }
}