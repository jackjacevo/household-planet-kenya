import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SecurityTrainingService {
  constructor(private prisma: PrismaService) {}

  async getTrainingModules() {
    return [
      {
        id: 1,
        title: 'Password Security',
        description: 'Learn about creating and managing secure passwords',
        duration: '15 minutes',
        mandatory: true,
        topics: [
          'Password complexity requirements',
          'Two-factor authentication',
          'Password managers',
          'Common password attacks',
        ],
        quiz: [
          {
            question: 'What is the minimum recommended password length?',
            options: ['6 characters', '8 characters', '12 characters', '16 characters'],
            correct: 2,
          },
          {
            question: 'Which of these is a strong password?',
            options: ['password123', 'P@ssw0rd!2024', '12345678', 'admin'],
            correct: 1,
          },
        ],
      },
      {
        id: 2,
        title: 'Phishing Awareness',
        description: 'Identify and avoid phishing attacks',
        duration: '20 minutes',
        mandatory: true,
        topics: [
          'Types of phishing attacks',
          'Identifying suspicious emails',
          'Safe link and attachment handling',
          'Reporting procedures',
        ],
        quiz: [
          {
            question: 'What should you do if you receive a suspicious email?',
            options: ['Click links to verify', 'Forward to colleagues', 'Report to IT security', 'Delete immediately'],
            correct: 2,
          },
        ],
      },
      {
        id: 3,
        title: 'Data Protection',
        description: 'Understand data handling and privacy requirements',
        duration: '25 minutes',
        mandatory: true,
        topics: [
          'Data classification',
          'GDPR compliance',
          'Secure data storage',
          'Data breach procedures',
        ],
      },
      {
        id: 4,
        title: 'Social Engineering',
        description: 'Recognize and defend against social engineering attacks',
        duration: '18 minutes',
        mandatory: false,
        topics: [
          'Common social engineering tactics',
          'Verification procedures',
          'Information sharing policies',
          'Physical security awareness',
        ],
      },
      {
        id: 5,
        title: 'Incident Response',
        description: 'Know how to respond to security incidents',
        duration: '22 minutes',
        mandatory: true,
        topics: [
          'Incident identification',
          'Reporting procedures',
          'Containment actions',
          'Recovery processes',
        ],
      },
    ];
  }

  async recordTrainingCompletion(userId: string, moduleId: string, score?: number) {
    const completion = await this.prisma.securityTraining.create({
      data: {
        userId,
        moduleId,
        score,
      },
    });

    // Check if all mandatory training is complete
    await this.checkComplianceStatus(userId);

    return completion;
  }

  async getTrainingStatus(userId: string) {
    const completions = await this.prisma.securityTraining.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
    });

    const modules = await this.getTrainingModules();
    const mandatoryModules = modules.filter(m => m.mandatory);
    const completedMandatory = completions.filter(c => 
      mandatoryModules.some(m => m.id.toString() === c.moduleId)
    );

    return {
      totalModules: modules.length,
      mandatoryModules: mandatoryModules.length,
      completedModules: completions.length,
      completedMandatory: completedMandatory.length,
      isCompliant: completedMandatory.length === mandatoryModules.length,
      completions,
      nextDueDate: this.calculateNextDueDate(completions),
    };
  }

  async generateTrainingReport(startDate?: Date, endDate?: Date) {
    const whereClause: any = {};
    
    if (startDate || endDate) {
      whereClause.completedAt = {};
      if (startDate) whereClause.completedAt.gte = startDate;
      if (endDate) whereClause.completedAt.lte = endDate;
    }

    const completions = await this.prisma.securityTraining.findMany({
      where: whereClause,

    });

    const modules = await this.getTrainingModules();
    
    return {
      period: { startDate, endDate },
      totalCompletions: completions.length,
      averageScore: this.calculateAverageScore(completions),
      completionsByModule: this.groupCompletionsByModule(completions, modules),
      complianceRate: this.calculateComplianceRate(completions, modules),
      topPerformers: this.getTopPerformers(completions),
      needsAttention: await this.getUsersNeedingTraining(),
    };
  }

  async scheduleTrainingReminders() {
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, email: true },
    });

    for (const user of users) {
      const status = await this.getTrainingStatus(user.id);
      
      if (!status.isCompliant) {
        await this.sendTrainingReminder(user.id, user.email);
      } else if (status.nextDueDate && status.nextDueDate <= new Date()) {
        await this.sendRefresherReminder(user.id, user.email);
      }
    }
  }

  async createCustomTraining(trainingData: any) {
    return {
      id: Date.now(),
      title: trainingData.title,
      description: trainingData.description,
      duration: trainingData.duration,
      mandatory: trainingData.mandatory || false,
      topics: trainingData.topics || [],
      quiz: trainingData.quiz || [],
      createdAt: new Date(),
    };
  }

  private async checkComplianceStatus(userId: string) {
    const status = await this.getTrainingStatus(userId);
    
    // Update user compliance status if needed
    console.log(`User ${userId} training compliance: ${status.isCompliant}`);
  }

  private calculateNextDueDate(completions: any[]): Date | null {
    if (completions.length === 0) return null;
    
    const latestCompletion = completions[0]; // Already ordered by completedAt desc
    const nextDue = new Date(latestCompletion.completedAt);
    nextDue.setFullYear(nextDue.getFullYear() + 1); // Annual refresh
    
    return nextDue;
  }

  private calculateAverageScore(completions: any[]): number {
    const withScores = completions.filter(c => c.score !== null);
    if (withScores.length === 0) return 0;
    
    const total = withScores.reduce((sum, c) => sum + c.score, 0);
    return Math.round(total / withScores.length);
  }

  private groupCompletionsByModule(completions: any[], modules: any[]) {
    const moduleMap = modules.reduce((map, module) => {
      map[module.id] = { ...module, completions: 0, averageScore: 0 };
      return map;
    }, {});

    completions.forEach(completion => {
      if (moduleMap[completion.moduleId]) {
        moduleMap[completion.moduleId].completions++;
      }
    });

    return Object.values(moduleMap);
  }

  private calculateComplianceRate(completions: any[], modules: any[]): number {
    const mandatoryModules = modules.filter(m => m.mandatory);
    const users = [...new Set(completions.map(c => c.userId))];
    
    if (users.length === 0) return 0;
    
    let compliantUsers = 0;
    
    users.forEach(userId => {
      const userCompletions = completions.filter(c => c.userId === userId);
      const completedMandatory = userCompletions.filter(c => 
        mandatoryModules.some(m => m.id.toString() === c.moduleId)
      );
      
      if (completedMandatory.length === mandatoryModules.length) {
        compliantUsers++;
      }
    });
    
    return Math.round((compliantUsers / users.length) * 100);
  }

  private getTopPerformers(completions: any[]) {
    const userScores = {};
    
    completions.forEach(completion => {
      if (completion.score) {
        if (!userScores[completion.userId]) {
          userScores[completion.userId] = { scores: [], user: completion.user };
        }
        userScores[completion.userId].scores.push(completion.score);
      }
    });

    const performers = Object.entries(userScores).map(([userId, data]: [string, any]) => ({
      userId: parseInt(userId),
      email: data.user.email,
      averageScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
      completions: data.scores.length,
    }));

    return performers
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5);
  }

  private async getUsersNeedingTraining() {
    const users = await this.prisma.user.findMany({
      where: { 
        isActive: true,
      },
      select: { id: true, email: true, role: true },
    });

    return users;
  }

  private async sendTrainingReminder(userId: string, email: string) {
    console.log(`Sending training reminder to ${email}`);
    // Implementation for sending email reminder
  }

  private async sendRefresherReminder(userId: string, email: string) {
    console.log(`Sending refresher training reminder to ${email}`);
    // Implementation for sending refresher reminder
  }
}