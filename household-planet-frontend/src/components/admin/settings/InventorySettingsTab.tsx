'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save, Package } from 'lucide-react';
import { settingsApi, type InventorySettings, type Setting } from '@/lib/settings-api';
const toast = {
  success: (msg: string) => console.log('✅', msg),
  error: (msg: string) => console.error('❌', msg)
};

interface InventorySettingsTabProps {
  settings: { [key: string]: Setting };
  onSettingsChange: () => void;
}

export function InventorySettingsTab({ settings, onSettingsChange }: InventorySettingsTabProps) {
  const [formData, setFormData] = useState<InventorySettings>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const data: InventorySettings = {
      lowStockThreshold: settings.low_stock_threshold?.value || 10,
      trackStock: settings.track_stock?.value || true,
      autoApproveReviews: settings.auto_approve_reviews?.value || false,
      allowBackorders: settings.allow_backorders?.value || false,
      showOutOfStock: settings.show_out_of_stock?.value || true,
      maxOrderQuantity: settings.max_order_quantity?.value || 100,
      requireStockConfirmation: settings.require_stock_confirmation?.value || false,
    };
    setFormData(data);
  }, [settings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsApi.updateInventorySettings(formData);
      toast.success('Inventory settings saved successfully');
      onSettingsChange();
    } catch (error) {
      console.error('Failed to save inventory settings:', error);
      toast.error('Failed to save inventory settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof InventorySettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Package className="h-6 w-6 text-blue-600 mr-3" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Inventory Management</h2>
          <p className="text-sm text-gray-600">Configure stock tracking and inventory settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Low Stock Threshold
          </label>
          <Input
            type="number"
            value={formData.lowStockThreshold || ''}
            onChange={(e) => handleChange('lowStockThreshold', parseInt(e.target.value))}
            placeholder="10"
          />
          <p className="text-xs text-gray-500 mt-1">Alert when stock falls below this number</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Order Quantity
          </label>
          <Input
            type="number"
            value={formData.maxOrderQuantity || ''}
            onChange={(e) => handleChange('maxOrderQuantity', parseInt(e.target.value))}
            placeholder="100"
          />
          <p className="text-xs text-gray-500 mt-1">Maximum quantity per order item</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Track Stock</h4>
            <p className="text-sm text-gray-500">Enable inventory tracking for products</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.trackStock || false}
              onChange={(e) => handleChange('trackStock', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Auto-approve Reviews</h4>
            <p className="text-sm text-gray-500">Automatically approve customer reviews</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.autoApproveReviews || false}
              onChange={(e) => handleChange('autoApproveReviews', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Allow Backorders</h4>
            <p className="text-sm text-gray-500">Allow orders when products are out of stock</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allowBackorders || false}
              onChange={(e) => handleChange('allowBackorders', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Show Out of Stock Products</h4>
            <p className="text-sm text-gray-500">Display products that are out of stock</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.showOutOfStock || false}
              onChange={(e) => handleChange('showOutOfStock', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}