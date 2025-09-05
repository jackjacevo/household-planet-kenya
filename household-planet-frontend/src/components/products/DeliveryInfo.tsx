'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

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



export function DeliveryInfo({ productId, weight, dimensions, category, price }: DeliveryInfoProps) {
  const [selectedLocation, setSelectedLocation] = useState('nairobi-cbd');

  const deliveryLocations = {
    'nairobi-cbd': { name: 'Nairobi CBD', cost: 100, days: '1-2 days' },
    'kajiado': { name: 'Kajiado (Naekana)', cost: 150, days: '2-3 days' },
    'kitengela': { name: 'Kitengela (Via Shuttle)', cost: 150, days: '2-3 days' },
    'thika': { name: 'Thika (Super Metrol)', cost: 150, days: '2-3 days' },
    'juja': { name: 'Juja (Via Super Metrol)', cost: 200, days: '2-3 days' },
    'kikuyu': { name: 'Kikuyu Town (Super Metrol)', cost: 200, days: '2-3 days' },
    'pangani': { name: 'Pangani', cost: 250, days: '2-3 days' },
    'upperhill': { name: 'Upperhill', cost: 250, days: '2-3 days' },
    'bomet': { name: 'Bomet (Easycoach)', cost: 300, days: '3-4 days' },
    'eastleigh': { name: 'Eastleigh', cost: 300, days: '2-3 days' },
    'hurlingham': { name: 'Hurlingham (Ngong Rd)', cost: 300, days: '2-3 days' },
    'industrial': { name: 'Industrial Area', cost: 300, days: '2-3 days' },
    'kileleshwa': { name: 'Kileleshwa', cost: 300, days: '2-3 days' },
    'kilimani': { name: 'Kilimani', cost: 300, days: '2-3 days' },
    'machakos': { name: 'Machakos (Makos Sacco)', cost: 300, days: '3-4 days' },
    'westlands': { name: 'Westlands', cost: 300, days: '2-3 days' },
    'eldoret': { name: 'Eldoret (North-rift Shuttle)', cost: 350, days: '4-5 days' },
    'kisumu': { name: 'Kisumu (Easy Coach)', cost: 350, days: '4-5 days' },
    'mombasa': { name: 'Mombasa (Dreamline Bus)', cost: 350, days: '4-5 days' },
    'lavington': { name: 'Lavington', cost: 350, days: '2-3 days' },
    'buruburu': { name: 'Buruburu', cost: 400, days: '2-3 days' },
    'kasarani': { name: 'Kasarani', cost: 400, days: '2-3 days' },
    'roysambu': { name: 'Roysambu', cost: 400, days: '2-3 days' },
    'kahawa-sukari': { name: 'Kahawa Sukari', cost: 550, days: '3-4 days' },
    'karen': { name: 'Karen', cost: 650, days: '3-4 days' },
    'kiambu': { name: 'Kiambu', cost: 650, days: '3-4 days' },
    'jkia': { name: 'JKIA', cost: 700, days: '2-3 days' },
    'ngong': { name: 'Ngong Town', cost: 1000, days: '4-5 days' }
  };

  const selectedLocationData = deliveryLocations[selectedLocation as keyof typeof deliveryLocations];
  const deliveryCost = selectedLocationData.cost;

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200 h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <Truck className="h-5 w-5 text-orange-600" />
        <h3 className="font-semibold text-gray-900">Delivery Calculator</h3>
      </div>

      <div className="mb-3">
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="w-full p-2 text-sm border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
        >
          <option value="nairobi-cbd">Nairobi CBD - KSh 100</option>
          <option value="kajiado">Kajiado (Naekana) - KSh 150</option>
          <option value="kitengela">Kitengela (Via Shuttle) - KSh 150</option>
          <option value="thika">Thika (Super Metrol) - KSh 150</option>
          <option value="juja">Juja (Via Super Metrol) - KSh 200</option>
          <option value="kikuyu">Kikuyu Town (Super Metrol) - KSh 200</option>
          <option value="pangani">Pangani - KSh 250</option>
          <option value="upperhill">Upperhill - KSh 250</option>
          <option value="bomet">Bomet (Easycoach) - KSh 300</option>
          <option value="eastleigh">Eastleigh - KSh 300</option>
          <option value="hurlingham">Hurlingham (Ngong Rd) - KSh 300</option>
          <option value="industrial">Industrial Area - KSh 300</option>
          <option value="kileleshwa">Kileleshwa - KSh 300</option>
          <option value="kilimani">Kilimani - KSh 300</option>
          <option value="machakos">Machakos (Makos Sacco) - KSh 300</option>
          <option value="westlands">Westlands - KSh 300</option>
          <option value="eldoret">Eldoret (North-rift Shuttle) - KSh 350</option>
          <option value="kisumu">Kisumu (Easy Coach) - KSh 350</option>
          <option value="mombasa">Mombasa (Dreamline Bus) - KSh 350</option>
          <option value="lavington">Lavington - KSh 350</option>
          <option value="buruburu">Buruburu - KSh 400</option>
          <option value="kasarani">Kasarani - KSh 400</option>
          <option value="roysambu">Roysambu - KSh 400</option>
          <option value="kahawa-sukari">Kahawa Sukari - KSh 550</option>
          <option value="karen">Karen - KSh 650</option>
          <option value="kiambu">Kiambu - KSh 650</option>
          <option value="jkia">JKIA - KSh 700</option>
          <option value="ngong">Ngong Town - KSh 1,000</option>
        </select>
      </div>

      <div className="flex-1 space-y-3">
        <div className="bg-white rounded-lg p-3 border border-orange-100">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <p className="font-medium text-sm text-gray-900">{selectedLocationData.name}</p>
              <p className="text-xs text-gray-600 mt-1">Delivery: {selectedLocationData.days}</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-orange-600">
                KSh {deliveryCost.toLocaleString()}
              </span>
            </div>
          </div>
          

          
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Product Price:</span>
              <span className="text-sm font-medium">KSh {price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Delivery Fee:</span>
              <span className="text-sm font-medium">KSh {deliveryCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-t border-orange-200 pt-2">
              <span className="text-lg font-bold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-orange-600">KSh {(price + deliveryCost).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}