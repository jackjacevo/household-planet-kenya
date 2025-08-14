import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AbTestingService {
  constructor(private prisma: PrismaService) {}

  async createExperiment(data: {
    name: string;
    description: string;
  }) {
    return this.prisma.aBExperiment.create({
      data,
    });
  }

  async getActiveExperiments() {
    return this.prisma.aBExperiment.findMany({
      where: {
        status: 'ACTIVE',
      },
    });
  }

  async assignUserToVariant(experimentId: string, userId?: string, sessionId?: string) {
    const experiment = await this.prisma.aBExperiment.findUnique({
      where: { id: experimentId },
    });

    if (!experiment || experiment.status !== 'ACTIVE') {
      return null;
    }

    // Check if user already assigned
    const existingAssignment = await this.prisma.aBAssignment.findFirst({
      where: {
        experimentId,
        userId,
      },
    });

    if (existingAssignment) {
      return {
        experimentId,
        variant: existingAssignment.variant,
      };
    }

    // Simple variant assignment
    const variant = Math.random() < 0.5 ? 'A' : 'B';

    // Save assignment
    await this.prisma.aBAssignment.create({
      data: {
        experimentId,
        userId,
        variant,
      },
    });

    return {
      experimentId,
      variant,
    };
  }

  async trackConversion(data: {
    experimentId: string;
    userId?: string;
    event: string;
    value?: number;
  }) {
    return this.prisma.aBConversion.create({
      data: {
        experimentId: data.experimentId,
        userId: data.userId,
        variant: 'A',
        event: data.event,
        value: data.value,
      },
    });
  }

  async getExperimentResults(experimentId: string) {
    const experiment = await this.prisma.aBExperiment.findUnique({
      where: { id: experimentId },
    });

    if (!experiment) {
      throw new Error('Experiment not found');
    }

    const assignments = await this.prisma.aBAssignment.count({
      where: { experimentId },
    });

    const conversions = await this.prisma.aBConversion.count({
      where: { experimentId },
    });

    return {
      experiment,
      assignments,
      conversions,
      conversionRate: assignments > 0 ? (conversions / assignments) * 100 : 0,
    };
  }

  private determineWinner(results: any[]) {
    if (results.length < 2) return null;

    const sortedByConversionRate = [...results].sort((a, b) => b.conversionRate - a.conversionRate);
    const winner = sortedByConversionRate[0];
    const runner = sortedByConversionRate[1];

    // Simple statistical significance check (requires more sophisticated implementation)
    const isSignificant = winner.participants >= 100 && 
                         winner.conversionRate > runner.conversionRate * 1.1;

    return {
      variantName: winner.variantName,
      conversionRate: winner.conversionRate,
      isStatisticallySignificant: isSignificant,
      improvement: runner.conversionRate > 0 
        ? ((winner.conversionRate - runner.conversionRate) / runner.conversionRate) * 100 
        : 0,
    };
  }

  async updateExperimentStatus(experimentId: string, status: string) {
    return this.prisma.aBExperiment.update({
      where: { id: experimentId },
      data: { status },
    });
  }

  async getAllExperiments() {
    return this.prisma.aBExperiment.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}