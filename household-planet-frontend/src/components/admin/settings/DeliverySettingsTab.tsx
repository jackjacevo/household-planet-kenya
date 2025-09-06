'use client';

import { Truck } from 'lucide-react';

interface DeliverySettingsTabProps {
  settings: any;
  onSettingsChange: () => void;
}

export function DeliverySettingsTab({ settings, onSettingsChange }: DeliverySettingsTabProps) {
  return (
    <div className="text-center py-12">
      <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Delivery Settings</h3>
      <p className="text-gray-500">Delivery configuration coming soon.</p>
    </div>
  );
}