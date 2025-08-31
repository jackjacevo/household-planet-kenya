'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Image, Mail, HelpCircle, Newspaper, Settings } from 'lucide-react';
import BannerManager from '@/components/admin/content/BannerManager';
import PageManager from '@/components/admin/content/PageManager';
import EmailTemplateManager from '@/components/admin/content/EmailTemplateManager';
import FAQManager from '@/components/admin/content/FAQManager';
import BlogManager from '@/components/admin/content/BlogManager';

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState('banners');

  const contentStats = [
    { title: 'Active Banners', value: '3', icon: Image, color: 'text-blue-600' },
    { title: 'Published Pages', value: '8', icon: FileText, color: 'text-green-600' },
    { title: 'Email Templates', value: '12', icon: Mail, color: 'text-purple-600' },
    { title: 'FAQ Items', value: '25', icon: HelpCircle, color: 'text-orange-600' },
    { title: 'Blog Posts', value: '15', icon: Newspaper, color: 'text-red-600' }
  ];

  const tabs = [
    { id: 'banners', label: 'Banners', icon: Image },
    { id: 'pages', label: 'Pages', icon: FileText },
    { id: 'emails', label: 'Email Templates', icon: Mail },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
    { id: 'blog', label: 'Blog', icon: Newspaper }
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Content Management</h1>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {contentStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'banners' && <BannerManager />}
        {activeTab === 'pages' && <PageManager />}
        {activeTab === 'emails' && <EmailTemplateManager />}
        {activeTab === 'faqs' && <FAQManager />}
        {activeTab === 'blog' && <BlogManager />}
      </div>
    </div>
  );
}