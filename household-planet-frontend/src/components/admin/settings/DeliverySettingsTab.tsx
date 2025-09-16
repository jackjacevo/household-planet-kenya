'use client';

import { useState } from 'react';
import { Truck, MapPin, Settings } from 'lucide-react';
import { DeliveryLocationsTab } from './DeliveryLocationsTab';

interface DeliverySettingsTabProps {
  settings: any;
  onSettingsChange: () => void;
}

const DELIVERY_TABS = [
  { id: 'locations', label: 'Delivery Locations', icon: MapPin },
  { id: 'general', label: 'General Settings', icon: Settings },
];

export function DeliverySettingsTab({ settings, onSettingsChange }: DeliverySettingsTabProps) {
  const [activeTab, setActiveTab] = useState('locations');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'locations':
        return <DeliveryLocationsTab />;
      case 'general':
        return (
          <div className="text-center py-8 sm:py-12">
            <Settings className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">General Delivery Settings</h3>
            <p className="text-sm sm:text-base text-gray-500">General delivery configuration coming soon.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sub-tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
          {DELIVERY_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}