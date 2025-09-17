'use client';

import { useState, useEffect } from 'react';
import { eventBus, EVENTS } from '@/lib/events';

export interface DeliveryLocation {
  id: string;
  name: string;
  tier: number;
  price: number;
  description?: string;
  estimatedDays: number;
  expressAvailable: boolean;
  expressPrice?: number;
  isActive?: boolean;
}

export function useDeliveryLocations() {
  const [locations, setLocations] = useState<DeliveryLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      loadLocations();
    };

    eventBus.on(EVENTS.DELIVERY_LOCATIONS_UPDATED, handleUpdate);
    return () => eventBus.off(EVENTS.DELIVERY_LOCATIONS_UPDATED, handleUpdate);
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const timestamp = Date.now();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/simple-delivery/locations?t=${timestamp}`, {
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        setLocations(data.data || []);
        setLastUpdated(timestamp);
        console.log('Delivery locations updated:', data.data?.length || 0, 'locations');
      } else {
        setError('Failed to load delivery locations');
      }
    } catch (err) {
      setError('Failed to load delivery locations');
      console.error('Error loading delivery locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLocationsByTier = (tier: number) => {
    return locations.filter(location => location.tier === tier);
  };

  const getLocationByName = (name: string) => {
    return locations.find(location => 
      location.name.toLowerCase().includes(name.toLowerCase())
    );
  };

  const getLocationPrice = (locationName: string) => {
    const location = getLocationByName(locationName);
    return location?.price || 0;
  };

  return {
    locations,
    loading,
    error,
    getLocationsByTier,
    getLocationByName,
    getLocationPrice,
    reload: loadLocations
  };
}
