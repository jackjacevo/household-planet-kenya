'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  MapPin, 
  Clock, 
  DollarSign,
  Zap,
  Save,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
// Simple toast implementation
const useToast = () => ({
  showToast: ({ type, message }: { type: 'success' | 'error'; message: string }) => {
    console.log(`${type === 'success' ? '✅' : '❌'} ${message}`);
    if (typeof window !== 'undefined') {
      const toastEl = document.createElement('div');
      toastEl.className = `fixed top-4 right-4 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-4 py-2 rounded shadow-lg z-50`;
      toastEl.textContent = message;
      document.body.appendChild(toastEl);
      setTimeout(() => toastEl.remove(), 3000);
    }
  }
});

interface DeliveryLocation {
  id?: string;
  name: string;
  tier: number;
  price: number;
  description?: string;
  estimatedDays: number;
  expressAvailable: boolean;
  expressPrice?: number;
  isActive?: boolean;
}

const TIER_COLORS = {
  1: 'bg-green-100 text-green-800',
  2: 'bg-blue-100 text-blue-800',
  3: 'bg-yellow-100 text-yellow-800',
  4: 'bg-red-100 text-red-800'
};

const TIER_RANGES = {
  1: 'Ksh 100-200',
  2: 'Ksh 250-300',
  3: 'Ksh 350-400',
  4: 'Ksh 450-1000'
};

export function DeliveryLocationsTab() {
  const { showToast } = useToast();
  const [locations, setLocations] = useState<DeliveryLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<DeliveryLocation | null>(null);
  const [formData, setFormData] = useState<DeliveryLocation>({
    name: '',
    tier: 1,
    price: 0,
    description: '',
    estimatedDays: 1,
    expressAvailable: false,
    expressPrice: 0
  });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/delivery-locations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLocations(data.data || []);
      } else {
        console.error('Failed to load locations:', response.statusText);
        showToast({ type: 'error', message: 'Failed to load delivery locations' });
      }
    } catch (error) {
      console.error('Failed to load delivery locations:', error);
      showToast({ type: 'error', message: 'Failed to load delivery locations' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingLocation 
        ? `/api/admin/delivery-locations/${editingLocation.id}`
        : '/api/admin/delivery-locations';
      
      const method = editingLocation ? 'PUT' : 'POST';
      const token = localStorage.getItem('token');
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadLocations();
        resetForm();
        showToast({ type: 'success', message: editingLocation ? 'Location updated successfully' : 'Location created successfully' });
        
        // Trigger refresh for all components using delivery locations
        if (typeof window !== 'undefined') {
          const { eventBus, EVENTS } = require('@/lib/events');
          eventBus.emit(EVENTS.DELIVERY_LOCATIONS_UPDATED);
          
          // Force refresh of all delivery location selectors
          setTimeout(() => {
            eventBus.emit(EVENTS.DELIVERY_LOCATIONS_UPDATED);
          }, 100);
        }
      } else {
        const errorData = await response.json();
        showToast({ type: 'error', message: errorData.message || 'Failed to save location' });
      }
    } catch (error) {
      console.error('Failed to save location:', error);
      showToast({ type: 'error', message: 'Failed to save location' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this delivery location?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/delivery-locations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await loadLocations();
        showToast({ type: 'success', message: 'Location deleted successfully' });
        
        // Trigger refresh for all components using delivery locations
        if (typeof window !== 'undefined') {
          const { eventBus, EVENTS } = require('@/lib/events');
          eventBus.emit(EVENTS.DELIVERY_LOCATIONS_UPDATED);
          
          // Force refresh of all delivery location selectors
          setTimeout(() => {
            eventBus.emit(EVENTS.DELIVERY_LOCATIONS_UPDATED);
          }, 100);
        }
      } else {
        const errorData = await response.json();
        showToast({ type: 'error', message: errorData.message || 'Failed to delete location' });
      }
    } catch (error) {
      console.error('Failed to delete location:', error);
      showToast({ type: 'error', message: 'Failed to delete location' });
    }
  };

  const handleEdit = (location: DeliveryLocation) => {
    setEditingLocation(location);
    setFormData(location);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      tier: 1,
      price: 0,
      description: '',
      estimatedDays: 1,
      expressAvailable: false,
      expressPrice: 0
    });
    setEditingLocation(null);
    setShowForm(false);
  };


  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = selectedTier === null || location.tier === selectedTier;
    return matchesSearch && matchesTier;
  });

  const tierCounts = locations.reduce((acc, location) => {
    acc[location.tier] = (acc[location.tier] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900">Delivery Locations ({locations.length})</h3>
          <p className="text-xs sm:text-sm text-gray-500">
            Manage delivery locations and pricing for your store
            {locations.length === 63 && <span className="text-green-600 font-medium"> ✓ All 63 locations loaded</span>}
            {locations.length > 0 && locations.length !== 63 && <span className="text-yellow-600 font-medium"> ⚠️ Expected 63 locations</span>}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center justify-center w-full sm:w-auto">
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Tier Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map(tier => (
          <div key={tier} className="bg-white border rounded-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900">Tier {tier}</p>
                <p className="text-xs text-gray-500 truncate">{TIER_RANGES[tier as keyof typeof TIER_RANGES]}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full self-start sm:self-auto ${TIER_COLORS[tier as keyof typeof TIER_COLORS]}`}>
                {tierCounts[tier] || 0}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 sm:pl-10 text-sm"
            />
          </div>
        </div>
        <select
          value={selectedTier || ''}
          onChange={(e) => setSelectedTier(e.target.value ? parseInt(e.target.value) : null)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Tiers</option>
          <option value="1">Tier 1</option>
          <option value="2">Tier 2</option>
          <option value="3">Tier 3</option>
          <option value="4">Tier 4</option>
        </select>
      </div>

      {/* Locations List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Mobile Card View */}
        <div className="block sm:hidden">
          {filteredLocations.map((location) => (
            <div key={location.id} className="border-b border-gray-200 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center flex-1 min-w-0">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{location.name}</h4>
                    {location.description && (
                      <p className="text-xs text-gray-500 truncate">{location.description}</p>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ml-2 ${TIER_COLORS[location.tier as keyof typeof TIER_COLORS]}`}>
                  T{location.tier}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 mb-3">
                <div className="flex items-center">
                  <DollarSign className="h-3 w-3 text-gray-400 mr-1" />
                  Ksh {location.price}
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 text-gray-400 mr-1" />
                  {location.estimatedDays}d
                </div>
                <div className="flex items-center col-span-2">
                  {location.expressAvailable ? (
                    <>
                      <Zap className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-green-600">Express: Ksh {location.expressPrice}</span>
                    </>
                  ) : (
                    <span className="text-gray-400">No express</span>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(location)}
                  className="text-xs px-2 py-1"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(location.id!)}
                  className="text-red-600 hover:text-red-700 text-xs px-2 py-1"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Time
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Express
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLocations.map((location) => (
                <tr key={location.id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          {location.name}
                        </div>
                      </div>
                      {location.description && (
                        <div className="text-sm text-gray-500 ml-6">
                          {location.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${TIER_COLORS[location.tier as keyof typeof TIER_COLORS]}`}>
                      Tier {location.tier}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                      Ksh {location.price}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      {location.estimatedDays} day{location.estimatedDays !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    {location.expressAvailable ? (
                      <div className="flex items-center text-sm text-green-600">
                        <Zap className="h-4 w-4 mr-1" />
                        Ksh {location.expressPrice}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Not available</span>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(location)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(location.id!)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLocations.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <MapPin className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No locations found</h3>
            <p className="text-sm sm:text-base text-gray-500 px-4">
              {searchTerm || selectedTier ? 'Try adjusting your filters' : 'Add your first delivery location to get started'}
            </p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                {editingLocation ? 'Edit Location' : 'Add New Location'}
              </h3>
              <Button variant="outline" size="sm" onClick={resetForm}>
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Location Name
                </label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Nairobi CBD"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Tier
                  </label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>Tier 1</option>
                    <option value={2}>Tier 2</option>
                    <option value={3}>Tier 3</option>
                    <option value={4}>Tier 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Price (Ksh)
                  </label>
                  <Input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Via Super Metro"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Estimated Delivery Days
                </label>
                <Input
                  type="number"
                  required
                  min="1"
                  value={formData.estimatedDays}
                  onChange={(e) => setFormData({ ...formData, estimatedDays: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.expressAvailable}
                    onChange={(e) => setFormData({ ...formData, expressAvailable: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-xs sm:text-sm text-gray-700">Express delivery available</span>
                </label>

                {formData.expressAvailable && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Express Price (Ksh)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.expressPrice || 0}
                      onChange={(e) => setFormData({ ...formData, expressPrice: parseFloat(e.target.value) })}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4">
                <Button type="button" variant="outline" onClick={resetForm} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" className="flex items-center justify-center w-full sm:w-auto">
                  <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  {editingLocation ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
