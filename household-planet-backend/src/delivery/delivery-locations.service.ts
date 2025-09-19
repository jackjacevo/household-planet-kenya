import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DeliveryLocationData {
  id?: string;
  name: string;
  tier: number;
  price: number;
  description?: string;
  estimatedDays: number;
  expressAvailable: boolean;
  expressPrice?: number;
  isActive?: boolean;
}

@Injectable()
export class DeliveryLocationsService {
  constructor(private prisma: PrismaService) {}

  async getAllLocations(): Promise<DeliveryLocationData[]> {
    const settings = await this.prisma.setting.findMany({
      where: {
        category: 'delivery_locations',
        key: { startsWith: 'location_' }
      }
    });

    return settings.map(setting => {
      const data = JSON.parse(setting.value);
      return {
        id: setting.key.replace('location_', ''),
        ...data
      };
    }).filter(location => location.isActive !== false);
  }

  async getLocationById(id: string): Promise<DeliveryLocationData> {
    const setting = await this.prisma.setting.findUnique({
      where: {
        category_key: {
          category: 'delivery_locations',
          key: `location_${id}`
        }
      }
    });

    if (!setting) {
      throw new NotFoundException(`Delivery location with ID ${id} not found`);
    }

    const data = JSON.parse(setting.value);
    return {
      id,
      ...data
    };
  }

  async createLocation(locationData: Omit<DeliveryLocationData, 'id'>): Promise<DeliveryLocationData> {
    const id = Date.now().toString();
    const data = {
      ...locationData,
      isActive: true
    };

    await this.prisma.setting.create({
      data: {
        category: 'delivery_locations',
        key: `location_${id}`,
        value: JSON.stringify(data),
        type: 'json',
        description: `Delivery location: ${locationData.name}`,
        isPublic: true
      }
    });

    return { id, ...data };
  }

  async updateLocation(id: string, locationData: Partial<DeliveryLocationData>): Promise<DeliveryLocationData> {
    const existing = await this.getLocationById(id);
    const updatedData = { ...existing, ...locationData };
    delete updatedData.id;

    await this.prisma.setting.update({
      where: {
        category_key: {
          category: 'delivery_locations',
          key: `location_${id}`
        }
      },
      data: {
        value: JSON.stringify(updatedData),
        description: `Delivery location: ${updatedData.name}`,
        updatedAt: new Date()
      }
    });

    return { id, ...updatedData };
  }

  async deleteLocation(id: string): Promise<void> {
    await this.prisma.setting.delete({
      where: {
        category_key: {
          category: 'delivery_locations',
          key: `location_${id}`
        }
      }
    });
  }

  async getLocationsByTier(tier: number): Promise<DeliveryLocationData[]> {
    const allLocations = await this.getAllLocations();
    return allLocations.filter(location => location.tier === tier);
  }

  async searchLocations(query: string): Promise<DeliveryLocationData[]> {
    const allLocations = await this.getAllLocations();
    const searchTerm = query.toLowerCase();
    return allLocations.filter(location =>
      location.name.toLowerCase().includes(searchTerm)
    );
  }

  async getLocationByName(name: string): Promise<DeliveryLocationData | null> {
    const allLocations = await this.getAllLocations();
    return allLocations.find(location => 
      location.name.toLowerCase().includes(name.toLowerCase())
    ) || null;
  }

  async seedDefaultLocations(): Promise<void> {
    const defaultLocations: Omit<DeliveryLocationData, 'id'>[] = [
      // Tier 1 - Ksh 100-200
      { name: 'Nairobi CBD', tier: 1, price: 100, description: 'Orders within CBD only', estimatedDays: 1, expressAvailable: true, expressPrice: 200 },
      { name: 'Kajiado (Naekana)', tier: 1, price: 150, description: 'Via Naekana', estimatedDays: 2, expressAvailable: false },
      { name: 'Kitengela (Via Shuttle)', tier: 1, price: 150, description: 'Via Shuttle', estimatedDays: 2, expressAvailable: false },
      { name: 'Thika (Super Metrol)', tier: 1, price: 150, description: 'Via Super Metrol', estimatedDays: 2, expressAvailable: false },
      { name: 'Juja (Via Super Metrol)', tier: 1, price: 200, description: 'Via Super Metrol', estimatedDays: 3, expressAvailable: false },
      { name: 'Kikuyu Town (Super Metrol)', tier: 1, price: 200, description: 'Via Super Metrol', estimatedDays: 3, expressAvailable: false },

      // Tier 2 - Ksh 250-300
      { name: 'Pangani', tier: 2, price: 250, estimatedDays: 2, expressAvailable: true, expressPrice: 400 },
      { name: 'Upperhill', tier: 2, price: 250, estimatedDays: 2, expressAvailable: true, expressPrice: 400 },
      { name: 'Eastleigh', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
      { name: 'Westlands', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },

      // Tier 3 - Ksh 350-400
      { name: 'Karen', tier: 3, price: 350, estimatedDays: 3, expressAvailable: true, expressPrice: 500 },
      { name: 'Lavington', tier: 3, price: 350, estimatedDays: 2, expressAvailable: true, expressPrice: 500 },
      { name: 'Kilimani', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },

      // Tier 4 - Ksh 450-1000
      { name: 'JKIA', tier: 4, price: 700, estimatedDays: 2, expressAvailable: true, expressPrice: 900 },
      { name: 'Ngong Town', tier: 4, price: 1000, estimatedDays: 4, expressAvailable: false },
    ];

    for (const location of defaultLocations) {
      try {
        await this.createLocation(location);
      } catch (error) {
        // Skip if already exists
        console.log(`Skipping existing location: ${location.name}`);
      }
    }
  }
}
