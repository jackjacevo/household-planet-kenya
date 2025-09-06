'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save, Bell } from 'lucide-react';
import { settingsApi, type NotificationSettings, type Setting } from '@/lib/settings-api';
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

interface NotificationSettingsTabProps {
  settings: { [key: string]: Setting };
  onSettingsChange: () => void;
}

export function NotificationSettingsTab({ settings, onSettingsChange }: NotificationSettingsTabProps) {
  const [formData, setFormData] = useState<NotificationSettings>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const data: NotificationSettings = {
      emailNotifications: settings?.email_notifications?.value ?? true,
      smsNotifications: settings?.sms_notifications?.value ?? true,
      whatsappNotifications: settings?.whatsapp_notifications?.value ?? true,
      orderConfirmationEmail: settings?.order_confirmation_email?.value ?? true,
      orderStatusUpdates: settings?.order_status_updates?.value ?? true,
      lowStockAlerts: settings?.low_stock_alerts?.value ?? true,
      newCustomerNotifications: settings?.new_customer_notifications?.value ?? true,
      dailySalesReport: settings?.daily_sales_report?.value ?? false,
      notificationEmail: settings?.notification_email?.value || settings?.contact_email?.value || 'info@householdplanet.co.ke',
    };
    setFormData(data);
  }, [settings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsApi.updateNotificationSettings(formData);
      toast.success('Notification settings saved successfully');
      onSettingsChange();
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof NotificationSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleOptions = [
    { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive email notifications for orders and updates' },
    { key: 'smsNotifications', label: 'SMS Notifications', description: 'Send SMS notifications to customers' },
    { key: 'whatsappNotifications', label: 'WhatsApp Notifications', description: 'Send WhatsApp messages to customers' },
    { key: 'orderConfirmationEmail', label: 'Order Confirmation Emails', description: 'Send confirmation emails for new orders' },
    { key: 'orderStatusUpdates', label: 'Order Status Updates', description: 'Notify customers of order status changes' },
    { key: 'lowStockAlerts', label: 'Low Stock Alerts', description: 'Alert when products are running low' },
    { key: 'newCustomerNotifications', label: 'New Customer Notifications', description: 'Notify when new customers register' },
    { key: 'dailySalesReport', label: 'Daily Sales Report', description: 'Receive daily sales summary emails' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Bell className="h-6 w-6 text-blue-600 mr-3" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
          <p className="text-sm text-gray-600">Configure how and when notifications are sent</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notification Email Address
        </label>
        <Input
          type="email"
          value={formData.notificationEmail || ''}
          onChange={(e) => handleChange('notificationEmail', e.target.value)}
          placeholder="admin@company.com"
        />
        <p className="text-xs text-gray-500 mt-1">Email address to receive admin notifications</p>
      </div>

      <div className="space-y-4">
        {toggleOptions.map((option) => (
          <div key={option.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">{option.label}</h4>
              <p className="text-sm text-gray-500">{option.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData[option.key as keyof NotificationSettings] as boolean || false}
                onChange={(e) => handleChange(option.key as keyof NotificationSettings, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
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