'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Bell, 
  Shield, 
  Globe, 
  CreditCard, 
  Building2,
  Truck,
  Search,
  Lock,
  Mail,
  Share2,
  Package,
  Download,
  Upload,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { settingsApi, type SettingsResponse } from '@/lib/settings-api';
// import toast from 'react-hot-toast';
const toast = {
  success: (msg: string) => {
    console.log('✅', msg);
    if (typeof window !== 'undefined') {
      // Create a simple toast notification
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
import { CompanySettingsTab } from '@/components/admin/settings/CompanySettingsTab';
import { PaymentSettingsTab } from '@/components/admin/settings/PaymentSettingsTab';
import { NotificationSettingsTab } from '@/components/admin/settings/NotificationSettingsTab';
import { InventorySettingsTab } from '@/components/admin/settings/InventorySettingsTab';
import { SEOSettingsTab } from '@/components/admin/settings/SEOSettingsTab';
import { SecuritySettingsTab } from '@/components/admin/settings/SecuritySettingsTab';
import { EmailSettingsTab } from '@/components/admin/settings/EmailSettingsTab';
import { SocialMediaSettingsTab } from '@/components/admin/settings/SocialMediaSettingsTab';
import { DeliverySettingsTab } from '@/components/admin/settings/DeliverySettingsTab';

const TABS = [
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'notification', label: 'Notifications', icon: Bell },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'delivery', label: 'Delivery', icon: Truck },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'social', label: 'Social', icon: Share2 },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('company');
  const [settings, setSettings] = useState<SettingsResponse>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      console.log('Loading settings...');
      
      // Try admin settings first, fallback to public settings, then mock data
      let data;
      try {
        data = await settingsApi.getSettings();
      } catch (adminError) {
        console.log('Admin settings failed, trying public settings:', adminError);
        try {
          data = await settingsApi.getPublicSettings();
        } catch (publicError) {
          console.log('Public settings failed, using mock data:', publicError);
          // Mock data fallback
          data = {
            company: {
              site_name: { value: 'Household Planet Kenya' },
              site_description: { value: 'Your one-stop shop for household items in Kenya' },
              company_name: { value: 'Household Planet Kenya Ltd' },
              contact_email: { value: 'info@householdplanet.co.ke' },
              contact_phone: { value: '+254700000000' },
              currency: { value: 'KSh' },
            },
            payment: {
              tax_rate: { value: 16 },
              shipping_fee: { value: 200 },
              free_shipping_threshold: { value: 5000 },
              mpesa_shortcode: { value: '174379' },
              enable_cash_payments: { value: true },
              enable_bank_transfer: { value: true },
            },
            notification: {
              email_notifications: { value: true },
              sms_notifications: { value: true },
              low_stock_alerts: { value: true },
            },
            inventory: {
              low_stock_threshold: { value: 10 },
              track_stock: { value: true },
              auto_approve_reviews: { value: false },
            }
          };
        }
      }
      
      console.log('Loaded settings:', data);
      setSettings(data || {});
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
      // Set empty settings to prevent crashes
      setSettings({});
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const data = await settingsApi.exportSettings();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Settings exported successfully');
    } catch (error) {
      toast.error('Failed to export settings');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await settingsApi.importSettings(data);
      await loadSettings();
      toast.success('Settings imported successfully');
    } catch (error) {
      toast.error('Failed to import settings');
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      await settingsApi.resetToDefaults();
      await loadSettings();
      toast.success('Settings reset to defaults');
    } catch (error) {
      toast.error('Failed to reset settings');
    } finally {
      setSaving(false);
    }
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-48 sm:h-64">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-sm sm:text-base text-gray-500">Loading settings...</p>
        </div>
      );
    }
    
    // Show debug info in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Current settings state:', settings);
      console.log('Active tab:', activeTab);
    }

    switch (activeTab) {
      case 'company':
        return <CompanySettingsTab settings={settings.company || {}} onSettingsChange={loadSettings} />;
      case 'payment':
        return <PaymentSettingsTab settings={settings.payment || {}} onSettingsChange={loadSettings} />;
      case 'notification':
        return <NotificationSettingsTab settings={settings.notification || {}} onSettingsChange={loadSettings} />;
      case 'inventory':
        return <InventorySettingsTab settings={settings.inventory || {}} onSettingsChange={loadSettings} />;
      case 'delivery':
        return <DeliverySettingsTab settings={settings.delivery || {}} onSettingsChange={loadSettings} />;
      case 'seo':
        return <SEOSettingsTab settings={settings.seo || {}} onSettingsChange={loadSettings} />;
      case 'security':
        return <SecuritySettingsTab settings={settings.security || {}} onSettingsChange={loadSettings} />;
      case 'email':
        return <EmailSettingsTab settings={settings.email || {}} onSettingsChange={loadSettings} />;
      case 'social':
        return <SocialMediaSettingsTab settings={settings.social || {}} onSettingsChange={loadSettings} />;
      default:
        return <div>Tab not found</div>;
    }
  };

  return (
    <div className="px-3 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="mt-1 sm:mt-2 text-sm text-gray-700">
            Configure your store settings and preferences.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6 sm:mb-8">
        {/* Mobile Dropdown */}
        <div className="block sm:hidden mb-4">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TABS.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Desktop Tabs */}
        <nav className="-mb-px hidden sm:flex space-x-8">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-3 sm:p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

// Fallback component for missing tab components
function FallbackTabContent({ title }: { title: string }) {
  return (
    <div className="text-center py-12">
      <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title} Settings</h3>
      <p className="text-gray-500">This settings section is coming soon.</p>
    </div>
  );
}