'use client';

import { useState } from 'react';
import { CurrencyDollarIcon, TruckIcon, ClockIcon } from '@heroicons/react/24/outline';
import { DeliveryLocationSelector } from '@/components/common/DeliveryLocationSelector';
import { useDeliveryLocations } from '@/hooks/useDeliveryLocations';

interface ShippingResult {
  cost: number;
  freeShipping: boolean;
  bulkDiscount: number;
  finalCost: number;
}

export default function ShippingCalculator() {
  const { getLocationByName } = useDeliveryLocations();
  const [location, setLocation] = useState('');
  const [orderValue, setOrderValue] = useState('');
  const [isExpress, setIsExpress] = useState(false);
  const [result, setResult] = useState<ShippingResult | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateShipping = async () => {
    if (!location || !orderValue) return;

    setLoading(true);
    try {
      const locationData = getLocationByName(location);
      if (!locationData) {
        console.error('Location not found');
        return;
      }

      const orderVal = parseFloat(orderValue);
      let baseCost = isExpress && locationData.expressAvailable ? locationData.expressPrice || locationData.price : locationData.price;
      
      // Apply free shipping for orders over 5000
      const freeShipping = orderVal >= 5000;
      const finalCost = freeShipping ? 0 : baseCost;
      
      setResult({
        cost: baseCost,
        freeShipping,
        bulkDiscount: 0,
        finalCost
      });
    } catch (error) {
      console.error('Error calculating shipping:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Calculator</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Location
          </label>
          <DeliveryLocationSelector
            value={location}
            onChange={(locationName) => setLocation(locationName)}
            placeholder="Select delivery location"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order Value (Ksh)
          </label>
          <input
            type="number"
            value={orderValue}
            onChange={(e) => setOrderValue(e.target.value)}
            placeholder="e.g., 2500"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="express"
            checked={isExpress}
            onChange={(e) => setIsExpress(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="express" className="ml-2 text-sm text-gray-700">
            Express Delivery (where available)
          </label>
        </div>

        <button
          onClick={calculateShipping}
          disabled={loading || !location || !orderValue}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Calculating...' : 'Calculate Shipping'}
        </button>
      </div>

      {result && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Shipping Details</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Base Shipping Cost:</span>
              <span>Ksh {result.cost}</span>
            </div>
            
            {result.freeShipping && (
              <div className="flex justify-between text-green-600">
                <span>Free Shipping Applied:</span>
                <span>-Ksh {result.cost}</span>
              </div>
            )}
            
            {result.bulkDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Bulk Discount:</span>
                <span>-Ksh {result.bulkDiscount}</span>
              </div>
            )}
            
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Final Shipping Cost:</span>
              <span>Ksh {result.finalCost}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center space-x-4 text-xs text-gray-600">
            <div className="flex items-center">
              <TruckIcon className="h-4 w-4 mr-1" />
              <span>Standard: 2-3 days</span>
            </div>
            {isExpress && (
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span>Express: Next day</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}