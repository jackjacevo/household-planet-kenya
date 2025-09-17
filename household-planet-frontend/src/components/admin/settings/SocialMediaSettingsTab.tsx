'use client';

import { useState, useEffect } from 'react';
import { Share2, Save, Facebook, Twitter, Instagram, Linkedin, Youtube, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { settingsApi, type SocialMediaSettings } from '@/lib/settings-api';

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

interface SocialMediaSettingsTabProps {
  settings: any;
  onSettingsChange: () => void;
}

export function SocialMediaSettingsTab({ settings, onSettingsChange }: SocialMediaSettingsTabProps) {
  const [formData, setFormData] = useState<SocialMediaSettings>({});

  useEffect(() => {
    setFormData({
      facebookUrl: settings?.facebook_url?.value || settings?.facebookUrl?.value || 'https://www.facebook.com/share/1Np1NSY2bm/',
      twitterUrl: settings?.twitter_url?.value || settings?.twitterUrl?.value || '',
      instagramUrl: settings?.instagram_url?.value || settings?.instagramUrl?.value || 'https://instagram.com/householdplanetkenya',
      linkedinUrl: settings?.linkedin_url?.value || settings?.linkedinUrl?.value || '',
      youtubeUrl: settings?.youtube_url?.value || settings?.youtubeUrl?.value || '',
      tiktokUrl: settings?.tiktok_url?.value || settings?.tiktokUrl?.value || '',
      whatsappNumber: settings?.whatsapp_number?.value || settings?.whatsappNumber?.value || settings?.contact_phone?.value || '+254790227760',
    });
  }, [settings]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsApi.updateSocialMediaSettings(formData);
      toast.success('Social media settings updated successfully');
      onSettingsChange();
    } catch (error) {
      toast.error('Failed to update social media settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof SocialMediaSettings, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Share2 className="h-5 w-5 mr-2" />
          Social Media Configuration
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure your social media profiles and contact information.
        </p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-4">Social Media Profiles</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Facebook className="h-4 w-4 mr-2 text-blue-600" />
              Facebook Page URL
            </label>
            <Input
              type="url"
              value={formData.facebookUrl || ''}
              onChange={(e) => handleInputChange('facebookUrl', e.target.value)}
              placeholder="https://facebook.com/yourpage"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Twitter className="h-4 w-4 mr-2 text-blue-400" />
              Twitter Profile URL
            </label>
            <Input
              type="url"
              value={formData.twitterUrl || ''}
              onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
              placeholder="https://twitter.com/yourhandle"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Instagram className="h-4 w-4 mr-2 text-pink-600" />
              Instagram Profile URL
            </label>
            <Input
              type="url"
              value={formData.instagramUrl || ''}
              onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
              placeholder="https://instagram.com/yourhandle"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
              LinkedIn Profile URL
            </label>
            <Input
              type="url"
              value={formData.linkedinUrl || ''}
              onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
              placeholder="https://linkedin.com/company/yourcompany"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Youtube className="h-4 w-4 mr-2 text-red-600" />
              YouTube Channel URL
            </label>
            <Input
              type="url"
              value={formData.youtubeUrl || ''}
              onChange={(e) => handleInputChange('youtubeUrl', e.target.value)}
              placeholder="https://youtube.com/c/yourchannel"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              TikTok Profile URL
            </label>
            <Input
              type="url"
              value={formData.tiktokUrl || ''}
              onChange={(e) => handleInputChange('tiktokUrl', e.target.value)}
              placeholder="https://tiktok.com/@yourhandle"
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
          WhatsApp Contact
        </h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            WhatsApp Business Number
          </label>
          <Input
            type="tel"
            value={formData.whatsappNumber || ''}
            onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
            placeholder="+254700000000"
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Include country code (e.g., +254 for Kenya)
          </p>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h4 className="text-md font-medium text-blue-900 mb-3">Social Media Tips</h4>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• Use complete URLs including https://</li>
          <li>• Ensure all profiles are active and regularly updated</li>
          <li>• Use consistent branding across all platforms</li>
          <li>• WhatsApp number will be used for customer support links</li>
        </ul>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={saving}
          className="flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Social Media Settings'}
        </Button>
      </div>
    </form>
  );
}
