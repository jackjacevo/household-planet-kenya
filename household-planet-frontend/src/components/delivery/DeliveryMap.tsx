'use client';

import { useState, useEffect } from 'react';
import GoogleMap from '@/components/ui/GoogleMap';
import { api } from '@/lib/api';
import { MapPinIcon, TruckIcon } from '@heroicons/react/24/outline';

interface DeliveryLocation {
  id: string;
  name: string;
  tier: number;
  price: number;
  description?: string;
  estimatedDays: number;
  coordinates?: { lat: number; lng: number };
}

export default function DeliveryMap() {
  const [locations, setLocations] = useState<DeliveryLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<DeliveryLocation | null>(null);
  const [loading, setLoading] = useState(true);

  // Kenya center coordinates
  const kenyaCenter = { lat: -1.2921, lng: 36.8219 };

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await api.getDeliveryLocations();
        const locationsData = response.data || [];
        
        // Add sample coordinates for major Kenyan cities
        const locationsWithCoords = locationsData.map((location: DeliveryLocation) => ({
          ...location,
          coordinates: getLocationCoordinates(location.name)
        }));
        
        setLocations(locationsWithCoords);
      } catch (error) {
        console.error('Error fetching delivery locations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const getLocationCoordinates = (locationName: string) => {
    // Sample coordinates for major Kenyan cities/towns
    const coordinates: { [key: string]: { lat: number; lng: number } } = {
      'Nairobi': { lat: -1.2921, lng: 36.8219 },
      'Mombasa': { lat: -4.0435, lng: 39.6682 },
      'Kisumu': { lat: -0.0917, lng: 34.7680 },
      'Nakuru': { lat: -0.3031, lng: 36.0800 },
      'Eldoret': { lat: 0.5143, lng: 35.2698 },
      'Thika': { lat: -1.0332, lng: 37.0692 },
      'Machakos': { lat: -1.5177, lng: 37.2634 },
      'Meru': { lat: 0.0467, lng: 37.6556 },
      'Nyeri': { lat: -0.4167, lng: 36.9500 },
      'Kitale': { lat: 1.0167, lng: 35.0000 }
    };

    // Try to find exact match first
    const exactMatch = Object.keys(coordinates).find(city => 
      locationName.toLowerCase().includes(city.toLowerCase())
    );
    
    if (exactMatch) {
      return coordinates[exactMatch];
    }

    // Return random coordinates within Kenya bounds if no match
    return {
      lat: -1.2921 + (Math.random() - 0.5) * 6,
      lng: 36.8219 + (Math.random() - 0.5) * 8
    };
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return '#10b981'; // green
      case 2: return '#3b82f6'; // blue
      case 3: return '#f59e0b'; // yellow
      case 4: return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  const mapMarkers = locations
    .filter(location => location.coordinates)
    .map(location => ({
      position: location.coordinates!,
      title: location.name,
      info: `
        <div>
          <strong>${location.name}</strong><br/>
          Tier ${location.tier} - Ksh ${location.price}<br/>
          ${location.estimatedDays} day${location.estimatedDays > 1 ? 's' : ''} delivery
        </div>
      `
    }));

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
        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
          <MapPinIcon className="h-8 w-8 mr-3 text-blue-600" />
          Delivery Coverage Map
        </h2>
        <p className="text-gray-600">
          Interactive map showing our delivery locations across Kenya
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <GoogleMap
              center={kenyaCenter}
              zoom={6}
              markers={mapMarkers}
              height="500px"
              className="border border-gray-200"
            />
          </div>
        </div>

        {/* Legend and Info */}
        <div className="space-y-6">
          {/* Tier Legend */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Tiers</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4].map(tier => (
                <div key={tier} className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getTierColor(tier) }}
                  />
                  <span className="text-sm text-gray-700">
                    Tier {tier} - {tier === 1 ? 'Nairobi' : tier === 2 ? 'Major Cities' : tier === 3 ? 'Towns' : 'Remote Areas'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TruckIcon className="h-5 w-5 mr-2" />
              Coverage Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Locations:</span>
                <span className="font-semibold">{locations.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Counties Covered:</span>
                <span className="font-semibold">47</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Delivery:</span>
                <span className="font-semibold">2-3 days</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Use</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click on map markers for location details</li>
              <li>• Zoom in/out to explore different areas</li>
              <li>• Colors indicate delivery tier pricing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}