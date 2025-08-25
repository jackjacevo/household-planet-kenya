'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface DeliveryLocation {
  id: string;
  name: string;
  tier: number;
  price: number;
  description?: string;
  estimatedDays: number;
  expressAvailable: boolean;
  expressPrice?: number;
}

interface DeliveryInfo {
  locations: DeliveryLocation[];
  tier1Locations: DeliveryLocation[];
  minDeliveryPrice: number;
  freeDeliveryThreshold: number;
  loading: boolean;
  error: string | null;
}

export function useDelivery(): DeliveryInfo & {
  calculateDeliveryCost: (locationId: string, orderValue: number) => Promise<number>;
  deliveryLocations: DeliveryLocation[];
  getLocationById: (id: string) => DeliveryLocation | undefined;
} {
  const [locations, setLocations] = useState<DeliveryLocation[]>([]);
  const [tier1Locations, setTier1Locations] = useState<DeliveryLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch from backend API first
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/delivery/locations`);
          if (response.ok) {
            const data = await response.json();
            const backendLocations = data.data || data;
            setLocations(backendLocations);
            setTier1Locations(backendLocations.filter((loc: DeliveryLocation) => loc.tier === 1));
            return;
          }
        } catch (apiError) {
          console.warn('Failed to fetch from API, using fallback locations');
        }
        
        // Fallback locations if API fails
        const fallbackLocations = [
          // Tier 1 (Ksh 100-200)
          { id: 'nairobi-cbd', name: 'Nairobi CBD', tier: 1, price: 100, description: 'Orders within CBD only', estimatedDays: 1, expressAvailable: true, expressPrice: 150 },
          { id: 'kajiado', name: 'Kajiado (Naekana)', tier: 1, price: 150, description: 'Kajiado area', estimatedDays: 1, expressAvailable: false },
          { id: 'kitengela', name: 'Kitengela (Via Shuttle)', tier: 1, price: 150, description: 'Via Shuttle', estimatedDays: 1, expressAvailable: false },
          { id: 'thika', name: 'Thika (Super Metrol)', tier: 1, price: 150, description: 'Via Super Metrol', estimatedDays: 2, expressAvailable: false },
          { id: 'juja', name: 'Juja (Via Super Metrol)', tier: 1, price: 200, description: 'Via Super Metrol', estimatedDays: 2, expressAvailable: false },
          { id: 'kikuyu', name: 'Kikuyu Town (Super Metrol)', tier: 1, price: 200, description: 'Via Super Metrol', estimatedDays: 2, expressAvailable: false },
          
          // Tier 2 (Ksh 250-300)
          { id: '7', name: 'Pangani', tier: 2, price: 250, description: 'Pangani area', estimatedDays: 2, expressAvailable: true, expressPrice: 400 },
          { id: 'upperhill', name: 'Upperhill', tier: 2, price: 250, description: 'Upperhill area', estimatedDays: 1, expressAvailable: false },
          { id: 'bomet', name: 'Bomet (Easycoach)', tier: 2, price: 300, description: 'Via Easycoach', estimatedDays: 3, expressAvailable: false },
          { id: 'eastleigh', name: 'Eastleigh', tier: 2, price: 300, description: 'Eastleigh area', estimatedDays: 1, expressAvailable: false },
          { id: 'hurlingham', name: 'Hurlingham (Ngong Rd) - Rider', tier: 2, price: 300, description: 'Via Rider', estimatedDays: 1, expressAvailable: false },
          { id: 'industrial-area', name: 'Industrial Area - Rider', tier: 2, price: 300, description: 'Via Rider', estimatedDays: 1, expressAvailable: false },
          { id: 'kileleshwa', name: 'Kileleshwa', tier: 2, price: 300, description: 'Kileleshwa area', estimatedDays: 1, expressAvailable: false },
          { id: 'kilimani', name: 'Kilimani', tier: 2, price: 300, description: 'Kilimani area', estimatedDays: 1, expressAvailable: false },
          { id: 'machakos', name: 'Machakos (Makos Sacco)', tier: 2, price: 300, description: 'Via Makos Sacco', estimatedDays: 2, expressAvailable: false },
          { id: 'madaraka', name: 'Madaraka (Mombasa Rd) - Rider', tier: 2, price: 300, description: 'Via Rider', estimatedDays: 1, expressAvailable: false },
          { id: 'makadara', name: 'Makadara (Jogoo Rd) - Rider', tier: 2, price: 300, description: 'Via Rider', estimatedDays: 1, expressAvailable: false },
          { id: 'mbagathi-way', name: 'Mbagathi Way (Langata Rd) - Rider', tier: 2, price: 300, description: 'Via Rider', estimatedDays: 1, expressAvailable: false },
          { id: 'mpaka-road', name: 'Mpaka Road', tier: 2, price: 300, description: 'Mpaka Road area', estimatedDays: 1, expressAvailable: false },
          { id: 'naivasha', name: 'Naivasha (Via NNUS)', tier: 2, price: 300, description: 'Via NNUS', estimatedDays: 2, expressAvailable: false },
          { id: 'nanyuki', name: 'Nanyuki (Nanyuki Cabs)', tier: 2, price: 300, description: 'Via Nanyuki Cabs', estimatedDays: 3, expressAvailable: false },
          { id: 'parklands', name: 'Parklands', tier: 2, price: 300, description: 'Parklands area', estimatedDays: 1, expressAvailable: false },
          { id: 'riverside', name: 'Riverside', tier: 2, price: 300, description: 'Riverside area', estimatedDays: 1, expressAvailable: false },
          { id: 'south-b', name: 'South B', tier: 2, price: 300, description: 'South B area', estimatedDays: 1, expressAvailable: false },
          { id: 'south-c', name: 'South C', tier: 2, price: 300, description: 'South C area', estimatedDays: 1, expressAvailable: false },
          { id: 'westlands', name: 'Westlands', tier: 2, price: 300, description: 'Westlands area', estimatedDays: 1, expressAvailable: true, expressPrice: 400 },
          
          // Tier 3 (Ksh 350-400)
          { id: 'abc-waiyaki', name: 'ABC (Waiyaki Way) - Rider', tier: 3, price: 350, description: 'Via Rider', estimatedDays: 1, expressAvailable: false },
          { id: 'allsops', name: 'Allsops, Ruaraka', tier: 3, price: 350, description: 'Ruaraka area', estimatedDays: 1, expressAvailable: false },
          { id: 'bungoma', name: 'Bungoma (EasyCoach)', tier: 3, price: 350, description: 'Via EasyCoach', estimatedDays: 4, expressAvailable: false },
          { id: 'carnivore', name: 'Carnivore (Langata) - Rider', tier: 3, price: 350, description: 'Via Rider', estimatedDays: 1, expressAvailable: false },
          { id: 'dci-kiambu', name: 'DCI (Kiambu Rd) - Rider', tier: 3, price: 350, description: 'Via Rider', estimatedDays: 1, expressAvailable: false },
          { id: 'eldoret', name: 'Eldoret (North-rift Shuttle)', tier: 3, price: 350, description: 'Via North-rift Shuttle', estimatedDays: 4, expressAvailable: false },
          { id: 'embu', name: 'Embu (Using Kukena)', tier: 3, price: 350, description: 'Via Kukena', estimatedDays: 3, expressAvailable: false },
          { id: 'homa-bay', name: 'Homa Bay (Easy Coach)', tier: 3, price: 350, description: 'Via Easy Coach', estimatedDays: 4, expressAvailable: false },
          { id: 'imara-daima', name: 'Imara Daima (Boda Rider)', tier: 3, price: 350, description: 'Via Boda Rider', estimatedDays: 1, expressAvailable: false },
          { id: 'jamhuri', name: 'Jamhuri Estate', tier: 3, price: 350, description: 'Jamhuri area', estimatedDays: 1, expressAvailable: false },
          { id: 'kericho', name: 'Kericho (Using EasyCoach)', tier: 3, price: 350, description: 'Via EasyCoach', estimatedDays: 3, expressAvailable: false },
          { id: 'kisii', name: 'Kisii (Using Easycoach)', tier: 3, price: 350, description: 'Via Easycoach', estimatedDays: 4, expressAvailable: false },
          { id: 'kisumu', name: 'Kisumu (Easy Coach-United Mall)', tier: 3, price: 350, description: 'Via Easy Coach', estimatedDays: 4, expressAvailable: false },
          { id: 'kitale', name: 'Kitale (Northrift)', tier: 3, price: 350, description: 'Via Northrift', estimatedDays: 4, expressAvailable: false },
          { id: 'lavington', name: 'Lavington', tier: 3, price: 350, description: 'Lavington area', estimatedDays: 1, expressAvailable: false },
          { id: 'mombasa', name: 'Mombasa (Dreamline Bus)', tier: 3, price: 350, description: 'Via Dreamline Bus', estimatedDays: 5, expressAvailable: false },
          { id: 'nextgen-mall', name: 'Nextgen Mall, Mombasa Road', tier: 3, price: 350, description: 'Mombasa Road area', estimatedDays: 1, expressAvailable: false },
          { id: 'roasters', name: 'Roasters', tier: 3, price: 350, description: 'Roasters area', estimatedDays: 1, expressAvailable: false },
          { id: 'rongo', name: 'Rongo (Using EasyCoach)', tier: 3, price: 350, description: 'Via EasyCoach', estimatedDays: 4, expressAvailable: false },
          { id: 'buruburu', name: 'Buruburu', tier: 3, price: 400, description: 'Buruburu area', estimatedDays: 1, expressAvailable: false },
          { id: 'donholm', name: 'Donholm', tier: 3, price: 400, description: 'Donholm area', estimatedDays: 1, expressAvailable: false },
          { id: 'kangemi', name: 'Kangemi', tier: 3, price: 400, description: 'Kangemi area', estimatedDays: 1, expressAvailable: false },
          { id: 'kasarani', name: 'Kasarani', tier: 3, price: 400, description: 'Kasarani area', estimatedDays: 1, expressAvailable: false },
          { id: 'kitisuru', name: 'Kitisuru', tier: 3, price: 400, description: 'Kitisuru area', estimatedDays: 1, expressAvailable: false },
          { id: 'lucky-summer', name: 'Lucky Summer', tier: 3, price: 400, description: 'Lucky Summer area', estimatedDays: 1, expressAvailable: false },
          { id: 'lumumba-drive', name: 'Lumumba Drive', tier: 3, price: 400, description: 'Lumumba Drive area', estimatedDays: 1, expressAvailable: false },
          { id: 'muthaiga', name: 'Muthaiga', tier: 3, price: 400, description: 'Muthaiga area', estimatedDays: 1, expressAvailable: false },
          { id: 'peponi-road', name: 'Peponi Road', tier: 3, price: 400, description: 'Peponi Road area', estimatedDays: 1, expressAvailable: false },
          { id: 'roysambu', name: 'Roysambu', tier: 3, price: 400, description: 'Roysambu area', estimatedDays: 1, expressAvailable: false },
          { id: 'thigiri', name: 'Thigiri', tier: 3, price: 400, description: 'Thigiri area', estimatedDays: 1, expressAvailable: false },
          { id: 'village-market', name: 'Village Market', tier: 3, price: 400, description: 'Village Market area', estimatedDays: 1, expressAvailable: false },
          
          // Tier 4 (Ksh 550-1,000)
          { id: 'kahawa-sukari', name: 'Kahawa Sukari', tier: 4, price: 550, description: 'Kahawa Sukari area', estimatedDays: 2, expressAvailable: false },
          { id: 'kahawa-wendani', name: 'Kahawa Wendani', tier: 4, price: 550, description: 'Kahawa Wendani area', estimatedDays: 2, expressAvailable: false },
          { id: 'karen', name: 'Karen', tier: 4, price: 650, description: 'Karen area', estimatedDays: 2, expressAvailable: true, expressPrice: 800 },
          { id: 'kiambu', name: 'Kiambu', tier: 4, price: 650, description: 'Kiambu County', estimatedDays: 2, expressAvailable: false },
          { id: 'jkia', name: 'JKIA', tier: 4, price: 700, description: 'Airport delivery', estimatedDays: 1, expressAvailable: true, expressPrice: 900 },
          { id: 'ngong-town', name: 'Ngong Town', tier: 4, price: 1000, description: 'Ngong Town area', estimatedDays: 3, expressAvailable: false },
        ];
        
        const tier1Data = fallbackLocations.filter(loc => loc.tier === 1);
        
        setLocations(fallbackLocations);
        setTier1Locations(tier1Data);
      } catch (err) {
        console.error('Error fetching delivery locations:', err);
        setError('Failed to load delivery locations');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const calculateDeliveryCost = async (locationId: string, orderValue: number): Promise<number> => {
    const location = locations.find(loc => loc.id === locationId);
    if (!location) return 0;
    
    let cost = location.price;
    
    // Apply free delivery for orders over threshold
    if (orderValue >= 5000) {
      cost = 0;
    } else if (orderValue >= 3000) {
      cost = Math.round(cost * 0.5); // 50% discount
    }
    
    return cost;
  };

  const getLocationById = (id: string) => {
    return locations.find(location => location.id === id);
  };

  // Calculate minimum delivery price from tier 1 locations
  const minDeliveryPrice = tier1Locations.length > 0 
    ? Math.min(...tier1Locations.map(loc => loc.price))
    : 100;

  // Set free delivery threshold based on actual data
  const freeDeliveryThreshold = 2000;

  return {
    locations,
    tier1Locations,
    deliveryLocations: locations,
    minDeliveryPrice,
    freeDeliveryThreshold,
    loading,
    error,
    calculateDeliveryCost,
    getLocationById
  };
}

export function useDeliveryPrice(location?: string) {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!location) return;

    const fetchPrice = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await api.getDeliveryPrice(location) as any;
        setPrice(result.price || result.data?.price);
      } catch (err) {
        console.error('Error fetching delivery price:', err);
        setError('Failed to get delivery price');
        setPrice(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
  }, [location]);

  return { price, loading, error };
}