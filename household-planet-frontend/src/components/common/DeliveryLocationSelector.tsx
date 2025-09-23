'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useDeliveryLocations } from '@/hooks/useDeliveryLocations';
import { MobileDeliverySelector } from './MobileDeliverySelector';

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
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const handleMobileLocationChange = (locationId: string) => {
    const location = locations.find(loc => loc.id === locationId);
    if (location) {
      onChange(location.name, location.price);
    }
  };

  // Use mobile selector on small screens
  if (isMobile) {
    const selectedLocationId = locations.find(loc => loc.name === value)?.id || '';
    return (
      <div className={className}>
        <MobileDeliverySelector
          locations={locations}
          selectedLocation={selectedLocationId}
          onLocationChange={handleMobileLocationChange}
          loading={loading}
        />
      </div>
    );
  }

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

  // Desktop version continues below

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-orange-500"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0">
            <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
            {selectedLocation ? (
              <div className="flex items-center space-x-2 min-w-0">
                <span className="text-sm text-gray-900 truncate">{selectedLocation.name}</span>
                {showPrice && (
                  <span className="text-xs font-medium text-orange-600 flex-shrink-0">
                    Ksh {selectedLocation.price}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-sm text-gray-500">{placeholder}</span>
            )}
          </div>
          <ChevronDownIcon className={`h-4 w-4 text-gray-400 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
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
                  <span className="text-sm text-gray-900 truncate">{location.name}</span>
                  <span className="text-xs font-medium text-orange-600 ml-2">
                    Ksh {location.price}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
