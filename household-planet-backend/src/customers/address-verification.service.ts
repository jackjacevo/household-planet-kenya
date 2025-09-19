import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VerifyAddressDto } from './dto/address-verification.dto';

@Injectable()
export class AddressVerificationService {
  constructor(private prisma: PrismaService) {}

  async verifyAddress(addressId: number, verificationDto: VerifyAddressDto) {
    return this.prisma.addressVerification.upsert({
      where: { addressId },
      update: {
        status: verificationDto.status,
        verifiedBy: verificationDto.verifiedBy,
        verifiedAt: new Date(),
        notes: verificationDto.notes,
        coordinates: verificationDto.coordinates,
      },
      create: {
        addressId,
        status: verificationDto.status,
        verifiedBy: verificationDto.verifiedBy,
        verifiedAt: new Date(),
        notes: verificationDto.notes,
        coordinates: verificationDto.coordinates,
      },
    });
  }

  async getPendingVerifications() {
    return this.prisma.addressVerification.findMany({
      where: { status: 'PENDING' },
      include: {
        address: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getAddressVerificationStatus(addressId: number) {
    return this.prisma.addressVerification.findUnique({
      where: { addressId },
    });
  }

  async bulkVerifyAddresses(verifications: Array<{ addressId: number; status: 'VERIFIED' | 'FAILED' | 'REJECTED'; notes?: string }>) {
    const updates = verifications.map(({ addressId, status, notes }) =>
      this.prisma.addressVerification.upsert({
        where: { addressId },
        update: {
          status,
          verifiedAt: new Date(),
          notes,
        },
        create: {
          addressId,
          status,
          verifiedAt: new Date(),
          notes,
        },
      })
    );

    return Promise.all(updates);
  }

  async getVerificationStats() {
    const stats = await this.prisma.addressVerification.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    return stats.reduce((acc, stat) => {
      acc[stat.status.toLowerCase()] = stat._count.id;
      return acc;
    }, {} as Record<string, number>);
  }
}
