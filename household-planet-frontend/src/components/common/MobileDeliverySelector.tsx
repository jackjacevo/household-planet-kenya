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
        className="w-full p-4 text-left border border-gray-200 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1 min-w-0">
            <MapPin className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
            {selectedLocationData ? (
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 truncate">{selectedLocationData.name}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${TIER_INFO[selectedLocationData.tier as keyof typeof TIER_INFO].color}`}>
                    {TIER_INFO[selectedLocationData.tier as keyof typeof TIER_INFO].icon} {TIER_INFO[selectedLocationData.tier as keyof typeof TIER_INFO].label}
                  </span>
                </div>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-sm font-semibold text-orange-600">{formatPrice(selectedLocationData.price)}</span>
                  <span className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {selectedLocationData.estimatedDays} day{selectedLocationData.estimatedDays > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-gray-500">Choose your delivery location</span>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
        </div>
      </button>

      {/* Mobile Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Select Delivery Location</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-100 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Tier Filters */}
              <div className="flex space-x-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedTier(null)}
                  className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedTier === null 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All Areas
                </button>
                {Object.entries(TIER_INFO).map(([tier, info]) => (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(parseInt(tier))}
                    className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedTier === parseInt(tier)
                        ? info.color
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {info.icon} {info.label}
                  </button>
                ))}
              </div>

              {/* Clear Filters */}
              {(searchTerm || selectedTier !== null) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Locations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredLocations.length === 0 ? (
                <div className="p-8 text-center">
                  <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No locations found</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {Object.entries(groupedLocations)
                    .filter(([tier]) => selectedTier === null || parseInt(tier) === selectedTier)
                    .map(([tier, tierLocations]) => {
                      const filteredTierLocations = tierLocations.filter(location =>
                        location.name.toLowerCase().includes(searchTerm.toLowerCase())
                      );
                      
                      if (filteredTierLocations.length === 0) return null;

                      return (
                        <div key={tier}>
                          {/* Tier Header */}
                          {selectedTier === null && (
                            <div className="px-4 py-3 bg-gray-50">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${TIER_INFO[parseInt(tier) as keyof typeof TIER_INFO].color}`}>
                                  {TIER_INFO[parseInt(tier) as keyof typeof TIER_INFO].icon} {TIER_INFO[parseInt(tier) as keyof typeof TIER_INFO].label}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {filteredTierLocations.length} location{filteredTierLocations.length > 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* Locations */}
                          {filteredTierLocations.map((location) => (
                            <button
                              key={location.id}
                              onClick={() => handleSelect(location)}
                              className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-medium text-gray-900 truncate">{location.name}</span>
                                    {selectedLocation === location.id && (
                                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <span className="text-sm font-semibold text-orange-600">
                                      {formatPrice(location.price)}
                                    </span>
                                    <span className="text-xs text-gray-500 flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {location.estimatedDays} day{location.estimatedDays > 1 ? 's' : ''}
                                    </span>
                                  </div>
                                  {location.description && (
                                    <p className="text-xs text-gray-500 mt-1 truncate">{location.description}</p>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                💡 Delivery times are estimates and may vary based on location and availability
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}