'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, Clock, MapPin, Package, Info, Calculator } from 'lucide-react';

interface DeliveryInfoProps {
  productId: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  category: string;
  price: number;
}

interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  estimatedDays: string;
  cost: number;
  icon: React.ReactNode;
  available: boolean;
}

export function DeliveryInfo({ productId, weight, dimensions, category, price }: DeliveryInfoProps) {
  const [selectedLocation, setSelectedLocation] = useState('nairobi');
  const [showCalculator, setShowCalculator] = useState(false);

  // Calculate delivery options based on product characteristics
  const getDeliveryOptions = (): DeliveryOption[] => {
    const baseOptions: DeliveryOption[] = [
      {
        id: 'standard',
        name: 'Standard Delivery',
        description: 'Regular delivery to your doorstep',
        estimatedDays: '3-5 business days',
        cost: price >= 2000 ? 0 : 200,
        icon: <Truck className="h-5 w-5" />,
        available: true
      },
      {
        id: 'express',
        name: 'Express Delivery',
        description: 'Faster delivery for urgent orders',
        estimatedDays: '1-2 business days',
        cost: 500,
        icon: <Clock className="h-5 w-5" />,
        available: selectedLocation === 'nairobi' || selectedLocation === 'mombasa'
      },
      {
        id: 'same-day',
        name: 'Same Day Delivery',
        description: 'Order before 2 PM for same day delivery',
        estimatedDays: 'Same day',
        cost: 800,
        icon: <Package className="h-5 w-5" />,
        available: selectedLocation === 'nairobi' && price >= 1000
      }
    ];

    // Adjust costs based on product characteristics
    if (weight && weight > 5) {
      baseOptions.forEach(option => {
        if (option.id !== 'standard' || price < 2000) {
          option.cost += Math.ceil((weight - 5) * 50);
        }
      });
    }

    return baseOptions;
  };

  const deliveryOptions = getDeliveryOptions();

  const locations = [
    { value: 'nairobi', label: 'Nairobi' },
    { value: 'mombasa', label: 'Mombasa' },
    { value: 'kisumu', label: 'Kisumu' },
    { value: 'nakuru', label: 'Nakuru' },
    { value: 'eldoret', label: 'Eldoret' },
    { value: 'other', label: 'Other Location' }
  ];

  const getSpecialHandling = () => {
    const handling = [];
    
    if (category === 'electronics') {
      handling.push('Fragile item handling');
      handling.push('Anti-static packaging');
    }
    
    if (category === 'kitchen-dining' && (weight || 0) > 3) {
      handling.push('Heavy item surcharge may apply');
    }
    
    if (dimensions && (dimensions.length > 100 || dimensions.width > 100 || dimensions.height > 100)) {
      handling.push('Oversized item - special delivery required');
    }

    return handling;
  };

  const specialHandling = getSpecialHandling();

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-600 rounded-xl p-2">
          <Truck className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Delivery Information</h3>
          <p className="text-gray-600">Choose your delivery option</p>
        </div>
      </div>

      {/* Location Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="h-4 w-4 inline mr-1" />
          Delivery Location
        </label>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {locations.map((location) => (
            <option key={location.value} value={location.value}>
              {location.label}
            </option>
          ))}
        </select>
      </div>

      {/* Delivery Options */}
      <div className="space-y-3 mb-6">
        {deliveryOptions.map((option) => (
          <motion.div
            key={option.id}
            className={`p-4 rounded-xl border-2 transition-all ${
              option.available
                ? 'border-gray-200 hover:border-blue-300 bg-white'
                : 'border-gray-100 bg-gray-50 opacity-60'
            }`}
            whileHover={option.available ? { scale: 1.02 } : {}}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  option.available ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {option.icon}
                </div>
                <div>
                  <h4 className={`font-semibold ${
                    option.available ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {option.name}
                  </h4>
                  <p className={`text-sm ${
                    option.available ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {option.description}
                  </p>
                  <p className={`text-sm font-medium ${
                    option.available ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {option.estimatedDays}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${
                  option.available ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {option.cost === 0 ? 'FREE' : `KSh ${option.cost.toLocaleString()}`}
                </p>
                {!option.available && (
                  <p className="text-xs text-red-500">Not available</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Special Handling */}
      {specialHandling.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="h-4 w-4 text-amber-600" />
            <h4 className="font-semibold text-amber-800">Special Handling</h4>
          </div>
          <ul className="space-y-1">
            {specialHandling.map((item, index) => (
              <li key={index} className="text-sm text-amber-700 flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Delivery Calculator */}
      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={() => setShowCalculator(!showCalculator)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <Calculator className="h-4 w-4" />
          <span>Calculate exact delivery cost</span>
        </button>

        {showCalculator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-white rounded-xl border border-gray-200"
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Product Weight:</span>
                <span className="font-medium ml-2">{weight || 'N/A'} kg</span>
              </div>
              <div>
                <span className="text-gray-600">Dimensions:</span>
                <span className="font-medium ml-2">
                  {dimensions 
                    ? `${dimensions.length}×${dimensions.width}×${dimensions.height}cm`
                    : 'N/A'
                  }
                </span>
              </div>
              <div>
                <span className="text-gray-600">Category:</span>
                <span className="font-medium ml-2 capitalize">{category.replace('-', ' ')}</span>
              </div>
              <div>
                <span className="text-gray-600">Free Shipping:</span>
                <span className="font-medium ml-2">
                  {price >= 2000 ? 'Eligible' : `Spend KSh ${(2000 - price).toLocaleString()} more`}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Additional Info */}
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>• Delivery times are estimates and may vary based on location and weather conditions</p>
        <p>• Free shipping applies to orders over KSh 2,000 within major cities</p>
        <p>• Same day delivery available for orders placed before 2:00 PM</p>
      </div>
    </div>
  );
}