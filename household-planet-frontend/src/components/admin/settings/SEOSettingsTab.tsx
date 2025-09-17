'use client';

import { useState } from 'react';
import { Search, Save, Globe, BarChart3, Eye, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { settingsApi, type SEOSettings } from '@/lib/settings-api';

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

interface SEOSettingsTabProps {
  settings: any;
  onSettingsChange: () => void;
}

export function SEOSettingsTab({ settings, onSettingsChange }: SEOSettingsTabProps) {
  const [formData, setFormData] = useState<SEOSettings>({
    metaTitle: settings.meta_title?.value || '',
    metaDescription: settings.meta_description?.value || '',
    metaKeywords: settings.meta_keywords?.value || '',
    googleAnalyticsId: settings.google_analytics_id?.value || '',
    facebookPixelId: settings.facebook_pixel_id?.value || '',
    googleTagManagerId: settings.google_tag_manager_id?.value || '',
    enableSitemap: settings.enable_sitemap?.value ?? true,
    enableRobotsTxt: settings.enable_robots_txt?.value ?? true,
    canonicalUrl: settings.canonical_url?.value || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await settingsApi.updateSEOSettings(formData);
      toast.success('SEO settings updated successfully');
      onSettingsChange();
    } catch (error) {
      console.error('Failed to update SEO settings:', error);
      toast.error('Failed to update SEO settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof SEOSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Search className="h-5 w-5 mr-2" />
          SEO Configuration
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure search engine optimization settings for your store.
        </p>
      </div>

      {/* Meta Tags Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <Tag className="h-4 w-4 mr-2" />
          Meta Tags
        </h4>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title
            </label>
            <Input
              type="text"
              value={formData.metaTitle || ''}
              onChange={(e) => handleInputChange('metaTitle', e.target.value)}
              placeholder="Household Planet Kenya - Quality Household Items"
              maxLength={60}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended: 50-60 characters. Current: {(formData.metaTitle || '').length}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              value={formData.metaDescription || ''}
              onChange={(e) => handleInputChange('metaDescription', e.target.value)}
              placeholder="Shop quality household items in Kenya. Fast delivery, great prices, excellent customer service."
              maxLength={160}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended: 150-160 characters. Current: {(formData.metaDescription || '').length}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Keywords
            </label>
            <Input
              type="text"
              value={formData.metaKeywords || ''}
              onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
              placeholder="household items, kenya, home goods, kitchenware"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate keywords with commas. Focus on 5-10 relevant keywords.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Canonical URL
            </label>
            <Input
              type="url"
              value={formData.canonicalUrl || ''}
              onChange={(e) => handleInputChange('canonicalUrl', e.target.value)}
              placeholder="https://householdplanet.co.ke"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              The preferred URL for your website to prevent duplicate content issues.
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <BarChart3 className="h-4 w-4 mr-2" />
          Analytics & Tracking
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Analytics ID
            </label>
            <Input
              type="text"
              value={formData.googleAnalyticsId || ''}
              onChange={(e) => handleInputChange('googleAnalyticsId', e.target.value)}
              placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your Google Analytics measurement ID for tracking website traffic.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Tag Manager ID
            </label>
            <Input
              type="text"
              value={formData.googleTagManagerId || ''}
              onChange={(e) => handleInputChange('googleTagManagerId', e.target.value)}
              placeholder="GTM-XXXXXXX"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your Google Tag Manager container ID for managing tracking codes.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facebook Pixel ID
            </label>
            <Input
              type="text"
              value={formData.facebookPixelId || ''}
              onChange={(e) => handleInputChange('facebookPixelId', e.target.value)}
              placeholder="123456789012345"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your Facebook Pixel ID for tracking conversions and creating audiences.
            </p>
          </div>
        </div>
      </div>

      {/* Technical SEO Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <Globe className="h-4 w-4 mr-2" />
          Technical SEO
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Generate XML Sitemap
              </label>
              <p className="text-xs text-gray-500">
                Automatically generate and update XML sitemap for search engines.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableSitemap ?? true}
                onChange={(e) => handleInputChange('enableSitemap', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Generate Robots.txt
              </label>
              <p className="text-xs text-gray-500">
                Automatically generate robots.txt file to guide search engine crawlers.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableRobotsTxt ?? true}
                onChange={(e) => handleInputChange('enableRobotsTxt', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* SEO Tips Section */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h4 className="text-md font-medium text-blue-900 mb-3 flex items-center">
          <Eye className="h-4 w-4 mr-2" />
          SEO Best Practices
        </h4>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• Keep meta titles under 60 characters for optimal display in search results</li>
          <li>• Write compelling meta descriptions that encourage clicks (150-160 characters)</li>
          <li>• Use relevant keywords naturally in your content and meta tags</li>
          <li>• Enable sitemap generation to help search engines discover your pages</li>
          <li>• Set up Google Analytics to track your SEO performance</li>
          <li>• Use canonical URLs to prevent duplicate content issues</li>
        </ul>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={saving}
          className="flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save SEO Settings'}
        </Button>
      </div>
    </form>
  );
}
