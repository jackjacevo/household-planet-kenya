'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MapPin, Plus, Edit2, Trash2, Check } from 'lucide-react';
import { Address } from '@/types';
import axios from 'axios';

interface AddressManagerProps {
  selectedAddressId: string;
  onAddressSelect: (address: Address) => void;
  onAddressChange: (formData: any) => void;
  isGuest?: boolean;
}

export function AddressManager({ 
  selectedAddressId, 
  onAddressSelect, 
  onAddressChange,
  isGuest = false 
}: AddressManagerProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    county: '',
    town: '',
    street: '',
    isDefault: false,
  });

  useEffect(() => {
    if (!isGuest) {
      loadAddresses();
    }
  }, [isGuest]);

  const loadAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/addresses`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setAddresses((response as any).data);
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const saveAddress = async () => {
    if (!formData.fullName || !formData.phone || !formData.county || !formData.town || !formData.street) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const addressData = {
        type: 'SHIPPING' as const,
        ...formData,
        isDefault: addresses.length === 0 || formData.isDefault,
      };

      let response: any;
      if (editingId) {
        response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/addresses/${editingId}`,
          addressData,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setAddresses(addresses.map(addr => 
          addr.id === editingId ? response.data : addr
        ));
      } else {
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/addresses`,
          addressData,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setAddresses([...addresses, (response as any).data]);
      }

      onAddressSelect((response as any).data);
      resetForm();
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/addresses/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setAddresses(addresses.filter(addr => addr.id !== id));
      if (selectedAddressId === id && addresses.length > 1) {
        const nextAddress = addresses.find(addr => addr.id !== id);
        if (nextAddress) onAddressSelect(nextAddress);
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const editAddress = (address: Address) => {
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      county: address.county,
      town: address.town,
      street: address.street,
      isDefault: address.isDefault,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      county: '',
      town: '',
      street: '',
      isDefault: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    };
    setFormData(newFormData);
    onAddressChange(newFormData);
  };

  if (isGuest) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Shipping Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <Input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="+254700000000"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">County</label>
          <Input
            type="text"
            name="county"
            value={formData.county}
            onChange={handleInputChange}
            required
            placeholder="Nairobi"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Town</label>
            <Input
              type="text"
              name="town"
              value={formData.town}
              onChange={handleInputChange}
              required
              placeholder="Westlands"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Street Address</label>
            <Input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              required
              placeholder="123 Moi Avenue"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Shipping Address</h3>
        {!showForm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Address
          </Button>
        )}
      </div>

      {addresses.length > 0 && !showForm && (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedAddressId === address.id 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onAddressSelect(address)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <input
                      type="radio"
                      checked={selectedAddressId === address.id}
                      onChange={() => onAddressSelect(address)}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium">{address.fullName}</p>
                      {address.isDefault && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 ml-6">
                    <p>{address.street}</p>
                    <p>{address.town}, {address.county}</p>
                    <p>{address.phone}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      editAddress(address);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAddress(address.id);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </h4>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              Cancel
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+254700000000"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">County</label>
              <Input
                type="text"
                name="county"
                value={formData.county}
                onChange={handleInputChange}
                required
                placeholder="Nairobi"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Town</label>
                <Input
                  type="text"
                  name="town"
                  value={formData.town}
                  onChange={handleInputChange}
                  required
                  placeholder="Westlands"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Street Address</label>
                <Input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  required
                  placeholder="123 Moi Avenue"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm">Set as default address</label>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={saveAddress}
                disabled={loading || !formData.fullName || !formData.phone || !formData.county || !formData.town || !formData.street}
                className="flex-1"
              >
                {loading ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {addresses.length === 0 && !showForm && (
        <div className="text-center py-8 text-gray-500">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No saved addresses yet</p>
          <Button
            variant="outline"
            onClick={() => setShowForm(true)}
            className="mt-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Address
          </Button>
        </div>
      )}
    </div>
  );
}
