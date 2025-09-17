'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save, Building2 } from 'lucide-react';
import { settingsApi, type CompanySettings, type Setting } from '@/lib/settings-api';
const toast = {
  success: (msg: string) => {
    console.log('✅', msg);
    if (typeof window !== 'undefined') {
      const toastEl = document.createElement('div');
      toastEl.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
      toastEl.textContent = msg;
      document.body.appendChild(toastEl);
      setTimeout(() => toastEl.remove(), 3000);
    }
  },
  error: (msg: string) => {
    console.error('❌', msg);
    if (typeof window !== 'undefined') {
      const toastEl = document.createElement('div');
      toastEl.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
      toastEl.textContent = msg;
      document.body.appendChild(toastEl);
      setTimeout(() => toastEl.remove(), 5000);
    }
  }
};

interface CompanySettingsTabProps {
  settings: { [key: string]: Setting };
  onSettingsChange: () => void;
}

export function CompanySettingsTab({ settings, onSettingsChange }: CompanySettingsTabProps) {
  const [formData, setFormData] = useState<CompanySettings>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    console.log('CompanySettingsTab received settings:', settings);
    
    const data: CompanySettings = {
      siteName: settings?.site_name?.value || settings?.siteName?.value || 'Household Planet Kenya',
      siteDescription: settings?.site_description?.value || settings?.siteDescription?.value || 'Your one-stop shop for household items',
      companyName: settings?.company_name?.value || settings?.companyName?.value || 'Household Planet Kenya Ltd',
      contactEmail: settings?.contact_email?.value || settings?.contactEmail?.value || 'info@householdplanet.co.ke',
      contactPhone: settings?.contact_phone?.value || settings?.contactPhone?.value || '+254700000000',
      address: settings?.address?.value || 'Nairobi, Kenya',
      city: settings?.city?.value || 'Nairobi',
      country: settings?.country?.value || 'Kenya',
      postalCode: settings?.postal_code?.value || settings?.postalCode?.value || '00100',
      businessHours: settings?.business_hours?.value || settings?.businessHours?.value || 'Mon-Fri 9AM-6PM',
      timezone: settings?.timezone?.value || 'Africa/Nairobi',
      currency: settings?.currency?.value || 'KSh',
      language: settings?.language?.value || 'en',
    };
    
    setFormData(data);
  }, [settings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsApi.updateCompanySettings(formData);
      toast.success('Company settings saved successfully');
      onSettingsChange();
    } catch (error) {
      console.error('Failed to save company settings:', error);
      toast.error('Failed to save company settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof CompanySettings, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center mb-4 sm:mb-6">
        <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Company Information</h2>
          <p className="text-xs sm:text-sm text-gray-600">Manage your company details and contact information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Site Name *
          </label>
          <Input
            value={formData.siteName || ''}
            onChange={(e) => handleChange('siteName', e.target.value)}
            placeholder="Your website name"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Company Name *
          </label>
          <Input
            value={formData.companyName || ''}
            onChange={(e) => handleChange('companyName', e.target.value)}
            placeholder="Legal company name"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Contact Email *
          </label>
          <Input
            type="email"
            value={formData.contactEmail || ''}
            onChange={(e) => handleChange('contactEmail', e.target.value)}
            placeholder="contact@company.com"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Contact Phone *
          </label>
          <Input
            value={formData.contactPhone || ''}
            onChange={(e) => handleChange('contactPhone', e.target.value)}
            placeholder="+254700000000"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={formData.currency || 'KSh'}
            onChange={(e) => handleChange('currency', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="KSh">Kenyan Shilling (KSh)</option>
            <option value="USD">US Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
            <option value="GBP">British Pound (£)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={formData.timezone || 'Africa/Nairobi'}
            onChange={(e) => handleChange('timezone', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Africa/Nairobi">Africa/Nairobi</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
          </select>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <Input
            value={formData.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="Nairobi"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <Input
            value={formData.country || ''}
            onChange={(e) => handleChange('country', e.target.value)}
            placeholder="Kenya"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Postal Code
          </label>
          <Input
            value={formData.postalCode || ''}
            onChange={(e) => handleChange('postalCode', e.target.value)}
            placeholder="00100"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Business Hours
          </label>
          <Input
            value={formData.businessHours || ''}
            onChange={(e) => handleChange('businessHours', e.target.value)}
            placeholder="Mon-Fri 9AM-6PM"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Site Description
        </label>
        <textarea
          value={formData.siteDescription || ''}
          onChange={(e) => handleChange('siteDescription', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Brief description of your business"
        />
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Address
        </label>
        <textarea
          value={formData.address || ''}
          onChange={(e) => handleChange('address', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Full business address"
        />
      </div>

      <div className="flex justify-center sm:justify-end pt-4 sm:pt-6 border-t">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center w-full sm:w-auto justify-center"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
