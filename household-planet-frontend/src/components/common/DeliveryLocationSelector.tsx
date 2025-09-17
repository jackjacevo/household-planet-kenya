'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useDeliveryLocations } from '@/hooks/useDeliveryLocations';

interface DeliveryLocationSelectorProps {
  value?: string;
  onChange: (location: string, price: number) => void;
  placeholder?: string;
  className?: string;
  showPrice?: boolean;
}

const TIER_COLORS = {
  1: 'text-green-600',
  2: 'text-blue-600', 
  3: 'text-yellow-600',
  4: 'text-red-600'
};

export function DeliveryLocationSelector({
  value,
  onChange,
  placeholder = 'Select delivery location',
  className = '',
  showPrice = true
}: DeliveryLocationSelectorProps) {
  const { locations, loading, reload } = useDeliveryLocations();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Listen for location updates and force refresh
  useEffect(() => {
    const { eventBus, EVENTS } = require('@/lib/events');
    const handleLocationUpdate = () => {
      console.log('DeliveryLocationSelector: Received location update event');
      reload();
    };

    eventBus.on(EVENTS.DELIVERY_LOCATIONS_UPDATED, handleLocationUpdate);
    
    // Also reload when component mounts to ensure fresh data
    reload();
    
    return () => eventBus.off(EVENTS.DELIVERY_LOCATIONS_UPDATED, handleLocationUpdate);
  }, [reload]);

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLocation = locations.find(loc => loc.name === value);

  const handleSelect = (location: any) => {
    console.log('Selected delivery location:', location.name, 'Price:', location.price);
    onChange(location.name, location.price);
    setIsOpen(false);
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
          <div className="flex items-center">
            <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-500">Loading locations...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
            {selectedLocation ? (
              <div className="flex items-center">
                <span className="text-gray-900">{selectedLocation.name}</span>
                {showPrice && (
                  <span className={`ml-2 text-sm font-medium ${TIER_COLORS[selectedLocation.tier as keyof typeof TIER_COLORS]}`}>
                    Ksh {selectedLocation.price}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredLocations.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No locations found</div>
            ) : (
              filteredLocations.map((location) => (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => handleSelect(location)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{location.name}</div>
                      {location.description && (
                        <div className="text-xs text-gray-500">{location.description}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${TIER_COLORS[location.tier as keyof typeof TIER_COLORS]}`}>
                        Ksh {location.price}
                      </div>
                      <div className="text-xs text-gray-500">
                        Tier {location.tier} • {location.estimatedDays}d
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
