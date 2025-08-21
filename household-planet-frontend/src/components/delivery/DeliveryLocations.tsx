'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { MagnifyingGlassIcon, TruckIcon, ClockIcon, CurrencyDollarIcon, MapIcon } from '@heroicons/react/24/outline';
import DeliveryMap from './DeliveryMap';

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

interface TierInfo {
  tier1: { range: string; count: number };
  tier2: { range: string; count: number };
  tier3: { range: string; count: number };
  tier4: { range: string; count: number };
}

export default function DeliveryLocations() {
  const [locations, setLocations] = useState<DeliveryLocation[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<DeliveryLocation[]>([]);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierInfo, setTierInfo] = useState<TierInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locationsRes, tierInfoRes] = await Promise.all([
          api.getDeliveryLocations(),
          api.get('/delivery/tiers')
        ]);
        
        const locationsData = locationsRes.data || [];
        setLocations(locationsData);
        setFilteredLocations(locationsData);
        setTierInfo(tierInfoRes.data.data);
      } catch (error) {
        console.error('Error fetching delivery data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = locations;

    if (selectedTier) {
      filtered = filtered.filter(location => location.tier === selectedTier);
    }

    if (searchQuery) {
      filtered = filtered.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLocations(filtered);
  }, [locations, selectedTier, searchQuery]);

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'bg-green-100 text-green-800 border-green-200';
      case 2: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 4: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTierRange = (tier: number) => {
    if (!tierInfo) return '';
    switch (tier) {
      case 1: return tierInfo.tier1.range;
      case 2: return tierInfo.tier2.range;
      case 3: return tierInfo.tier3.range;
      case 4: return tierInfo.tier4.range;
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Kenya Delivery Locations</h1>
        <p className="text-gray-600">We deliver to {locations.length} locations across Kenya with competitive pricing.</p>
      </div>

      {/* Tier Summary */}
      {tierInfo && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(tier => (
            <div
              key={tier}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedTier === tier ? 'ring-2 ring-blue-500' : ''
              } ${getTierColor(tier)}`}
              onClick={() => setSelectedTier(selectedTier === tier ? null : tier)}
            >
              <div className="text-sm font-medium">Tier {tier}</div>
              <div className="text-lg font-bold">{getTierRange(tier)}</div>
              <div className="text-sm">{tierInfo[`tier${tier}` as keyof TierInfo].count} locations</div>
            </div>
          ))}
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowMap(!showMap)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
            showMap 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <MapIcon className="h-4 w-4" />
          {showMap ? 'Show List' : 'Show Map'}
        </button>
        <button
          onClick={() => {
            setSelectedTier(null);
            setSearchQuery('');
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Clear Filters
        </button>
      </div>

      {/* Results Count */}
      {!showMap && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredLocations.length} of {locations.length} locations
          </p>
        </div>
      )}

      {/* Map or Locations Grid */}
      {showMap ? (
        <DeliveryMap />
      ) : (
        <>
          {/* Locations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((location) => (
              <div key={location.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTierColor(location.tier)}`}>
                    Tier {location.tier}
                  </span>
                </div>

                {location.description && (
                  <p className="text-sm text-gray-600 mb-3">{location.description}</p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    <span className="font-medium">Ksh {location.price}</span>
                    {location.expressAvailable && location.expressPrice && (
                      <span className="ml-2 text-blue-600">
                        (Express: Ksh {location.expressPrice})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span>{location.estimatedDays} day{location.estimatedDays > 1 ? 's' : ''}</span>
                    {location.expressAvailable && (
                      <span className="ml-2 text-blue-600">(Express available)</span>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <TruckIcon className="h-4 w-4 mr-2" />
                    <span>Standard delivery</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredLocations.length === 0 && (
            <div className="text-center py-12">
              <TruckIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}