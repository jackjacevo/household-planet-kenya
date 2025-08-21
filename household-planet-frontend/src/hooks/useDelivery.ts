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
        
        // Enhanced fallback data with more locations
        const fallbackLocations = [
          { id: '1', name: 'Nairobi CBD', tier: 1, price: 200, description: 'Orders within CBD only', estimatedDays: 1, expressAvailable: true, expressPrice: 300 },
          { id: '2', name: 'Westlands', tier: 1, price: 250, description: 'Westlands area', estimatedDays: 1, expressAvailable: true, expressPrice: 350 },
          { id: '3', name: 'Karen', tier: 1, price: 300, description: 'Karen area', estimatedDays: 2, expressAvailable: true, expressPrice: 400 },
          { id: '4', name: 'Kiambu', tier: 2, price: 400, description: 'Kiambu County', estimatedDays: 2, expressAvailable: false },
          { id: '5', name: 'Thika', tier: 2, price: 500, description: 'Via Super Metrol', estimatedDays: 3, expressAvailable: false },
          { id: '6', name: 'Nakuru', tier: 3, price: 800, description: 'Nakuru County', estimatedDays: 4, expressAvailable: false },
          { id: '7', name: 'Mombasa', tier: 4, price: 1000, description: 'Mombasa County', estimatedDays: 5, expressAvailable: false },
          { id: '8', name: 'Kisumu', tier: 4, price: 900, description: 'Kisumu County', estimatedDays: 5, expressAvailable: false },
          { id: '9', name: 'Eldoret', tier: 4, price: 850, description: 'Eldoret area', estimatedDays: 4, expressAvailable: false },
          { id: '10', name: 'Kitengela', tier: 2, price: 350, description: 'Via Shuttle', estimatedDays: 2, expressAvailable: false },
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