'use client';

import { useState } from 'react';
import { Lock, Save, Shield, Clock, Key, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { settingsApi, type SecuritySettings } from '@/lib/settings-api';

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

interface SecuritySettingsTabProps {
  settings: any;
  onSettingsChange: () => void;
}

export function SecuritySettingsTab({ settings, onSettingsChange }: SecuritySettingsTabProps) {
  const [formData, setFormData] = useState<SecuritySettings>({
    sessionTimeout: settings.session_timeout?.value || 3600,
    maxLoginAttempts: settings.max_login_attempts?.value || 5,
    lockoutDuration: settings.lockout_duration?.value || 900,
    requireTwoFactor: settings.require_two_factor?.value ?? false,
    enableCaptcha: settings.enable_captcha?.value ?? false,
    captchaSiteKey: settings.captcha_site_key?.value || '',
    captchaSecretKey: settings.captcha_secret_key?.value || '',
    passwordMinLength: settings.password_min_length?.value || 8,
    requirePasswordComplexity: settings.require_password_complexity?.value ?? false,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsApi.updateSecuritySettings(formData);
      toast.success('Security settings updated successfully');
      onSettingsChange();
    } catch (error) {
      toast.error('Failed to update security settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof SecuritySettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Lock className="h-5 w-5 mr-2" />
          Security Configuration
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure security settings to protect your store and user accounts.
        </p>
      </div>

      {/* Session & Login Security */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Session & Login Security
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (seconds)
            </label>
            <Input
              type="number"
              value={formData.sessionTimeout || 3600}
              onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
              min="300"
              max="86400"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Auto-logout after inactivity (300-86400 seconds)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Login Attempts
            </label>
            <Input
              type="number"
              value={formData.maxLoginAttempts || 5}
              onChange={(e) => handleInputChange('maxLoginAttempts', parseInt(e.target.value))}
              min="3"
              max="10"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lock account after failed attempts (3-10)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lockout Duration (seconds)
            </label>
            <Input
              type="number"
              value={formData.lockoutDuration || 900}
              onChange={(e) => handleInputChange('lockoutDuration', parseInt(e.target.value))}
              min="300"
              max="3600"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Account lockout time (300-3600 seconds)
            </p>
          </div>
        </div>
      </div>

      {/* Password Security */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <Key className="h-4 w-4 mr-2" />
          Password Security
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Password Length
            </label>
            <Input
              type="number"
              value={formData.passwordMinLength || 8}
              onChange={(e) => handleInputChange('passwordMinLength', parseInt(e.target.value))}
              min="6"
              max="20"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum characters required (6-20)
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Require Password Complexity
              </label>
              <p className="text-xs text-gray-500">
                Require uppercase, lowercase, numbers, and symbols
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requirePasswordComplexity ?? false}
                onChange={(e) => handleInputChange('requirePasswordComplexity', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          Two-Factor Authentication
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Require Two-Factor Authentication
              </label>
              <p className="text-xs text-gray-500">
                Force all admin users to enable 2FA
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requireTwoFactor ?? false}
                onChange={(e) => handleInputChange('requireTwoFactor', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* CAPTCHA Settings */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2" />
          CAPTCHA Protection
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Enable CAPTCHA
              </label>
              <p className="text-xs text-gray-500">
                Show CAPTCHA on login and registration forms
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableCaptcha ?? false}
                onChange={(e) => handleInputChange('enableCaptcha', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {formData.enableCaptcha && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CAPTCHA Site Key
                </label>
                <Input
                  type="text"
                  value={formData.captchaSiteKey || ''}
                  onChange={(e) => handleInputChange('captchaSiteKey', e.target.value)}
                  placeholder="6Lc..."
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CAPTCHA Secret Key
                </label>
                <Input
                  type="password"
                  value={formData.captchaSecretKey || ''}
                  onChange={(e) => handleInputChange('captchaSecretKey', e.target.value)}
                  placeholder="6Lc..."
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Tips */}
      <div className="bg-red-50 p-6 rounded-lg">
        <h4 className="text-md font-medium text-red-900 mb-3 flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Security Best Practices
        </h4>
        <ul className="text-sm text-red-800 space-y-2">
          <li>• Use strong session timeouts (1-4 hours for admin accounts)</li>
          <li>• Enable account lockouts to prevent brute force attacks</li>
          <li>• Require complex passwords with minimum 8 characters</li>
          <li>• Enable two-factor authentication for all admin accounts</li>
          <li>• Use CAPTCHA to prevent automated attacks</li>
          <li>• Regularly review security logs and failed login attempts</li>
        </ul>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={saving}
          className="flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Security Settings'}
        </Button>
      </div>
    </form>
  );
}