'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Clock, X, Check, ChevronRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface DeliveryLocation {
  id: string;
  name: string;
  price: number;
  tier: number;
  estimatedDays: number;
  description?: string;
}

interface MobileDeliverySelectorProps {
  locations: DeliveryLocation[];
  selectedLocation: string;
  onLocationChange: (locationId: string) => void;
  loading?: boolean;
}

const TIER_INFO = {
  1: { label: 'Same Day', color: 'bg-green-100 text-green-800', icon: '🚀' },
  2: { label: 'Next Day', color: 'bg-blue-100 text-blue-800', icon: '⚡' },
  3: { label: 'Standard', color: 'bg-yellow-100 text-yellow-800', icon: '📦' },
  4: { label: 'Extended', color: 'bg-red-100 text-red-800', icon: '🚛' }
};

export function MobileDeliverySelector({ 
  locations, 
  selectedLocation, 
  onLocationChange, 
  loading = false 
}: MobileDeliverySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  const selectedLocationData = locations.find(loc => loc.id === selectedLocation);

  // Group locations by tier
  const groupedLocations = locations.reduce((acc, location) => {
    if (!acc[location.tier]) {
      acc[location.tier] = [];
    }
    acc[location.tier].push(location);
    return acc;
  }, {} as Record<number, DeliveryLocation[]>);

  // Filter locations based on search and tier
  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = selectedTier === null || location.tier === selectedTier;
    return matchesSearch && matchesTier;
  });

  const handleSelect = (location: DeliveryLocation) => {
    onLocationChange(location.id);
    setIsOpen(false);
    setSearchTerm('');
    setSelectedTier(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTier(null);
  };

  if (loading) {
    return (
      <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex items-center">
          <MapPin className="h-5 w-5 text-gray-400 mr-3" />
          <span className="text-gray-500">Loading locations...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full p-3 text-left border border-gray-200 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-orange-500"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0">
            <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
            {selectedLocationData ? (
              <div className="flex items-center space-x-2 min-w-0">
                <span className="text-sm text-gray-900 truncate">{selectedLocationData.name}</span>
                <span className="text-xs font-medium text-orange-600">{formatPrice(selectedLocationData.price)}</span>
              </div>
            ) : (
              <span className="text-sm text-gray-500">Choose delivery location</span>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </div>
      </button>

      {/* Mobile Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-xl max-h-[75vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Select Location</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Locations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredLocations.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-gray-500">No locations found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredLocations.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => handleSelect(location)}
                      className="w-full p-3 text-left hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-900 truncate">{location.name}</span>
                            {selectedLocation === location.id && (
                              <Check className="h-3 w-3 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs font-medium text-orange-600">
                              {formatPrice(location.price)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {location.estimatedDays}d
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>


          </div>
        </div>
      )}
    </>
  );
}