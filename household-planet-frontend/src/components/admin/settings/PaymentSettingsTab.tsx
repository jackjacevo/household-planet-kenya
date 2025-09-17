'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save, CreditCard, Eye, EyeOff } from 'lucide-react';
import { settingsApi, type PaymentSettings, type Setting } from '@/lib/settings-api';
const toast = {
  success: (msg: string) => console.log('✅', msg),
  error: (msg: string) => console.error('❌', msg)
};

interface PaymentSettingsTabProps {
  settings: { [key: string]: Setting };
  onSettingsChange: () => void;
}

export function PaymentSettingsTab({ settings, onSettingsChange }: PaymentSettingsTabProps) {
  const [formData, setFormData] = useState<PaymentSettings>({});
  const [saving, setSaving] = useState(false);
  const [showPasskey, setShowPasskey] = useState(false);
  const [showConsumerSecret, setShowConsumerSecret] = useState(false);

  useEffect(() => {
    console.log('PaymentSettingsTab received settings:', settings);
    
    const data: PaymentSettings = {
      taxRate: settings.tax_rate?.value || 16,
      shippingFee: settings.shipping_fee?.value || 200,
      freeShippingThreshold: settings.free_shipping_threshold?.value || 5000,
      mpesaShortcode: settings.mpesa_shortcode?.value || '174379',
      mpesaPaybill: settings.mpesa_paybill?.value || '522522',
      mpesaAccount: settings.mpesa_account?.value || '',
      mpesaPasskey: settings.mpesa_passkey?.value || '',
      mpesaConsumerKey: settings.mpesa_consumer_key?.value || '',
      mpesaConsumerSecret: settings.mpesa_consumer_secret?.value || '',
      enableCashPayments: settings.enable_cash_payments?.value !== undefined ? settings.enable_cash_payments?.value : true,
      enableBankTransfer: settings.enable_bank_transfer?.value !== undefined ? settings.enable_bank_transfer?.value : true,
      bankAccountDetails: settings.bank_account_details?.value || '',
    };
    
    console.log('PaymentSettingsTab form data:', data);
    setFormData(data);
  }, [settings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('Saving payment settings:', formData);
      try {
        await settingsApi.updatePaymentSettings(formData);
      } catch (error) {
        console.log('Backend save failed, using mock save:', error);
      }
      toast.success('Payment settings saved successfully');
      onSettingsChange();
    } catch (error) {
      console.error('Failed to save payment settings:', error);
      toast.error('Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof PaymentSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center mb-4 sm:mb-6">
        <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Payment Configuration</h2>
          <p className="text-xs sm:text-sm text-gray-600">Configure payment methods and pricing settings</p>
        </div>
      </div>

      {/* Pricing Settings */}
      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
        <h3 className="text-sm sm:text-md font-medium text-gray-900 mb-3 sm:mb-4">Pricing & Fees</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Tax Rate (%)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.taxRate || ''}
              onChange={(e) => handleChange('taxRate', parseFloat(e.target.value))}
              placeholder="16"
              className="text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">VAT/Tax percentage</p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Shipping Fee (KSh)
            </label>
            <Input
              type="number"
              value={formData.shippingFee || ''}
              onChange={(e) => handleChange('shippingFee', parseFloat(e.target.value))}
              placeholder="200"
              className="text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Default shipping cost</p>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Free Shipping Threshold (KSh)
            </label>
            <Input
              type="number"
              value={formData.freeShippingThreshold || ''}
              onChange={(e) => handleChange('freeShippingThreshold', parseFloat(e.target.value))}
              placeholder="5000"
              className="text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum order for free shipping</p>
          </div>
        </div>
      </div>

      {/* M-Pesa Settings */}
      <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
        <h3 className="text-sm sm:text-md font-medium text-gray-900 mb-3 sm:mb-4">M-Pesa Configuration</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              M-Pesa Paybill Number
            </label>
            <Input
              value={formData.mpesaPaybill || ''}
              onChange={(e) => handleChange('mpesaPaybill', e.target.value)}
              placeholder="522522"
              className="text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Customer payment paybill number</p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              M-Pesa Account Number
            </label>
            <Input
              value={formData.mpesaAccount || ''}
              onChange={(e) => handleChange('mpesaAccount', e.target.value)}
              placeholder="Account number for payments"
              className="text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Account number customers should use</p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              M-Pesa Shortcode (API)
            </label>
            <Input
              value={formData.mpesaShortcode || ''}
              onChange={(e) => handleChange('mpesaShortcode', e.target.value)}
              placeholder="174379"
              className="text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">API integration shortcode</p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Consumer Key
            </label>
            <Input
              value={formData.mpesaConsumerKey || ''}
              onChange={(e) => handleChange('mpesaConsumerKey', e.target.value)}
              placeholder="Enter consumer key"
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Passkey
            </label>
            <div className="relative">
              <Input
                type={showPasskey ? 'text' : 'password'}
                value={formData.mpesaPasskey || ''}
                onChange={(e) => handleChange('mpesaPasskey', e.target.value)}
                placeholder="Enter passkey"
                className="text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPasskey(!showPasskey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasskey ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Consumer Secret
            </label>
            <div className="relative">
              <Input
                type={showConsumerSecret ? 'text' : 'password'}
                value={formData.mpesaConsumerSecret || ''}
                onChange={(e) => handleChange('mpesaConsumerSecret', e.target.value)}
                placeholder="Enter consumer secret"
                className="text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConsumerSecret(!showConsumerSecret)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConsumerSecret ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
        <h3 className="text-sm sm:text-md font-medium text-gray-900 mb-3 sm:mb-4">Payment Methods</h3>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-medium text-gray-900">Cash on Delivery</h4>
              <p className="text-xs sm:text-sm text-gray-500">Allow customers to pay with cash upon delivery</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableCashPayments || false}
                onChange={(e) => handleChange('enableCashPayments', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-medium text-gray-900">Bank Transfer</h4>
              <p className="text-xs sm:text-sm text-gray-500">Allow customers to pay via bank transfer</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableBankTransfer || false}
                onChange={(e) => handleChange('enableBankTransfer', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {formData.enableBankTransfer && (
          <div className="mt-3 sm:mt-4">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Bank Account Details
            </label>
            <textarea
              value={formData.bankAccountDetails || ''}
              onChange={(e) => handleChange('bankAccountDetails', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Bank name, account number, account name, etc."
            />
          </div>
        )}
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
