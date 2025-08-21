import { Injectable } from '@nestjs/common';

export interface DeliveryLocation {
  id: string;
  name: string;
  tier: number;
  price: number;
  description?: string;
  estimatedDays: number;
  expressAvailable: boolean;
  expressPrice?: number;
}

@Injectable()
export class DeliveryService {
  private readonly locations: DeliveryLocation[] = [
    // Tier 1 - Ksh 100-200
    { id: '1', name: 'Nairobi CBD', tier: 1, price: 100, description: 'Orders within CBD only', estimatedDays: 1, expressAvailable: true, expressPrice: 200 },
    { id: '2', name: 'Kajiado (Naekana)', tier: 1, price: 150, description: 'Via Naekana', estimatedDays: 2, expressAvailable: false },
    { id: '3', name: 'Kitengela (Via Shuttle)', tier: 1, price: 150, description: 'Via Shuttle', estimatedDays: 2, expressAvailable: false },
    { id: '4', name: 'Thika (Super Metrol)', tier: 1, price: 150, description: 'Via Super Metrol', estimatedDays: 2, expressAvailable: false },
    { id: '5', name: 'Juja (Via Super Metrol)', tier: 1, price: 200, description: 'Via Super Metrol', estimatedDays: 3, expressAvailable: false },
    { id: '6', name: 'Kikuyu Town (Super Metrol)', tier: 1, price: 200, description: 'Via Super Metrol', estimatedDays: 3, expressAvailable: false },

    // Tier 2 - Ksh 250-300
    { id: '7', name: 'Pangani', tier: 2, price: 250, estimatedDays: 2, expressAvailable: true, expressPrice: 400 },
    { id: '8', name: 'Upperhill', tier: 2, price: 250, estimatedDays: 2, expressAvailable: true, expressPrice: 400 },
    { id: '9', name: 'Bomet (Easycoach)', tier: 2, price: 300, description: 'Via Easycoach', estimatedDays: 3, expressAvailable: false },
    { id: '10', name: 'Eastleigh', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
    { id: '11', name: 'Hurlingham (Ngong Rd) - Rider', tier: 2, price: 300, description: 'Via Rider', estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
    { id: '12', name: 'Industrial Area - Rider', tier: 2, price: 300, description: 'Via Rider', estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
    { id: '13', name: 'Kileleshwa', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
    { id: '14', name: 'Kilimani', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
    { id: '15', name: 'Machakos (Makos Sacco)', tier: 2, price: 300, description: 'Via Makos Sacco', estimatedDays: 3, expressAvailable: false },
    { id: '16', name: 'Madaraka (Mombasa Rd) - Rider', tier: 2, price: 300, description: 'Via Rider', estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
    { id: '17', name: 'Makadara (Jogoo Rd) - Rider', tier: 2, price: 300, description: 'Via Rider', estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
    { id: '18', name: 'Mbagathi Way (Langata Rd) - Rider', tier: 2, price: 300, description: 'Via Rider', estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
    { id: '19', name: 'Mpaka Road', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
    { id: '20', name: 'Naivasha (Via NNUS)', tier: 2, price: 300, description: 'Via NNUS', estimatedDays: 3, expressAvailable: false },
    { id: '21', name: 'Nanyuki (Nanyuki Cabs)', tier: 2, price: 300, description: 'Via Nanyuki Cabs', estimatedDays: 4, expressAvailable: false },
    { id: '22', name: 'Parklands', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
    { id: '23', name: 'Riverside', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
    { id: '24', name: 'South B', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
    { id: '25', name: 'South C', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
    { id: '26', name: 'Westlands', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },

    // Tier 3 - Ksh 350-400
    { id: '27', name: 'ABC (Waiyaki Way) - Rider', tier: 3, price: 350, description: 'Via Rider', estimatedDays: 2, expressAvailable: true, expressPrice: 500 },
    { id: '28', name: 'Allsops, Ruaraka', tier: 3, price: 350, estimatedDays: 3, expressAvailable: true, expressPrice: 500 },
    { id: '29', name: 'Bungoma (EasyCoach)', tier: 3, price: 350, description: 'Via EasyCoach', estimatedDays: 4, expressAvailable: false },
    { id: '30', name: 'Carnivore (Langata) - Rider', tier: 3, price: 350, description: 'Via Rider', estimatedDays: 2, expressAvailable: true, expressPrice: 500 },
    { id: '31', name: 'DCI (Kiambu Rd) - Rider', tier: 3, price: 350, description: 'Via Rider', estimatedDays: 2, expressAvailable: true, expressPrice: 500 },
    { id: '32', name: 'Eldoret (North-rift Shuttle)', tier: 3, price: 350, description: 'Via North-rift Shuttle', estimatedDays: 4, expressAvailable: false },
    { id: '33', name: 'Embu (Using Kukena)', tier: 3, price: 350, description: 'Via Kukena', estimatedDays: 4, expressAvailable: false },
    { id: '34', name: 'Homa Bay (Easy Coach)', tier: 3, price: 350, description: 'Via Easy Coach', estimatedDays: 5, expressAvailable: false },
    { id: '35', name: 'Imara Daima (Boda Rider)', tier: 3, price: 350, description: 'Via Boda Rider', estimatedDays: 3, expressAvailable: false },
    { id: '36', name: 'Jamhuri Estate', tier: 3, price: 350, estimatedDays: 3, expressAvailable: true, expressPrice: 500 },
    { id: '37', name: 'Kericho (Using EasyCoach)', tier: 3, price: 350, description: 'Via EasyCoach', estimatedDays: 4, expressAvailable: false },
    { id: '38', name: 'Kisii (Using Easycoach)', tier: 3, price: 350, description: 'Via Easycoach', estimatedDays: 5, expressAvailable: false },
    { id: '39', name: 'Kisumu (Easy Coach-United Mall)', tier: 3, price: 350, description: 'Via Easy Coach-United Mall', estimatedDays: 5, expressAvailable: false },
    { id: '40', name: 'Kitale (Northrift)', tier: 3, price: 350, description: 'Via Northrift', estimatedDays: 4, expressAvailable: false },
    { id: '41', name: 'Lavington', tier: 3, price: 350, estimatedDays: 2, expressAvailable: true, expressPrice: 500 },
    { id: '42', name: 'Mombasa (Dreamline Bus)', tier: 3, price: 350, description: 'Via Dreamline Bus', estimatedDays: 5, expressAvailable: false },
    { id: '43', name: 'Nextgen Mall, Mombasa Road', tier: 3, price: 350, estimatedDays: 2, expressAvailable: true, expressPrice: 500 },
    { id: '44', name: 'Roasters', tier: 3, price: 350, estimatedDays: 3, expressAvailable: true, expressPrice: 500 },
    { id: '45', name: 'Rongo (Using EasyCoach)', tier: 3, price: 350, description: 'Via EasyCoach', estimatedDays: 5, expressAvailable: false },
    { id: '46', name: 'Buruburu', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },
    { id: '47', name: 'Donholm', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },
    { id: '48', name: 'Kangemi', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },
    { id: '49', name: 'Kasarani', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },
    { id: '50', name: 'Kitisuru', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },
    { id: '51', name: 'Lucky Summer', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },
    { id: '52', name: 'Lumumba Drive', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },
    { id: '53', name: 'Muthaiga', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },
    { id: '54', name: 'Peponi Road', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },
    { id: '55', name: 'Roysambu', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },
    { id: '56', name: 'Thigiri', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },
    { id: '57', name: 'Village Market', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },

    // Tier 4 - Ksh 450-1000
    { id: '58', name: 'Kahawa Sukari', tier: 4, price: 550, estimatedDays: 4, expressAvailable: false },
    { id: '59', name: 'Kahawa Wendani', tier: 4, price: 550, estimatedDays: 4, expressAvailable: false },
    { id: '60', name: 'Karen', tier: 4, price: 650, estimatedDays: 3, expressAvailable: true, expressPrice: 800 },
    { id: '61', name: 'Kiambu', tier: 4, price: 650, estimatedDays: 4, expressAvailable: false },
    { id: '62', name: 'JKIA', tier: 4, price: 700, estimatedDays: 2, expressAvailable: true, expressPrice: 900 },
    { id: '63', name: 'Ngong Town', tier: 4, price: 1000, estimatedDays: 4, expressAvailable: false },
  ];

  getAllLocations(): DeliveryLocation[] {
    return this.locations;
  }

  getLocationsByTier(tier: number): DeliveryLocation[] {
    return this.locations.filter(location => location.tier === tier);
  }

  getLocationByName(name: string): DeliveryLocation | undefined {
    return this.locations.find(location => 
      location.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  getDeliveryPrice(locationName: string): { price: number; location: DeliveryLocation | null } {
    const location = this.getLocationByName(locationName);
    return {
      price: location?.price || 300, // Default price if location not found
      location: location || null
    };
  }

  getDeliveryEstimate(locationName: string): { 
    estimatedDays: number; 
    expressAvailable: boolean; 
    expressPrice?: number;
    location: DeliveryLocation | null;
  } {
    const location = this.getLocationByName(locationName);
    return {
      estimatedDays: location?.estimatedDays || 3,
      expressAvailable: location?.expressAvailable || false,
      expressPrice: location?.expressPrice,
      location: location || null
    };
  }

  calculateShippingCost(locationName: string, orderValue: number, isExpress = false): {
    cost: number;
    freeShipping: boolean;
    bulkDiscount: number;
    finalCost: number;
  } {
    const location = this.getLocationByName(locationName);
    let baseCost = location?.price || 300;
    
    if (isExpress && location?.expressPrice) {
      baseCost = location.expressPrice;
    }

    // Free shipping for orders over 5000
    const freeShipping = orderValue >= 5000;
    if (freeShipping) baseCost = 0;

    // Bulk discount for large orders
    let bulkDiscount = 0;
    if (orderValue >= 10000) bulkDiscount = baseCost * 0.2; // 20% discount
    else if (orderValue >= 20000) bulkDiscount = baseCost * 0.3; // 30% discount

    const finalCost = Math.max(0, baseCost - bulkDiscount);

    return { cost: baseCost, freeShipping, bulkDiscount, finalCost };
  }

  searchLocations(query: string): DeliveryLocation[] {
    const searchTerm = query.toLowerCase();
    return this.locations.filter(location =>
      location.name.toLowerCase().includes(searchTerm)
    );
  }

  getTierInfo() {
    return {
      tier1: { range: 'Ksh 100-200', count: this.getLocationsByTier(1).length },
      tier2: { range: 'Ksh 250-300', count: this.getLocationsByTier(2).length },
      tier3: { range: 'Ksh 350-400', count: this.getLocationsByTier(3).length },
      tier4: { range: 'Ksh 450-1000', count: this.getLocationsByTier(4).length },
    };
  }

  getTimeSlots(): { id: string; label: string; hours: string }[] {
    return [
      { id: 'MORNING', label: 'Morning Delivery', hours: '8:00 AM - 12:00 PM' },
      { id: 'AFTERNOON', label: 'Afternoon Delivery', hours: '12:00 PM - 5:00 PM' },
      { id: 'EVENING', label: 'Evening Delivery', hours: '5:00 PM - 8:00 PM' },
    ];
  }
}