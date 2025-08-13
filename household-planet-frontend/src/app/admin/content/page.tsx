'use client';

import { useState, useEffect } from 'react';
import { FiHome, FiMail, FiFileText, FiHelpCircle, FiEdit, FiPlus } from 'react-icons/fi';
import Link from 'next/link';

interface ContentStats {
  type: string;
  count: number;
  last_updated: string;
}

export default function ContentManagement() {
  const [stats, setStats] = useState<ContentStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContentStats();
  }, []);

  const fetchContentStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/content/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching content stats:', error);
      setLoading(false);
    }
  };

  const getStatByType = (type: string) => {
    return stats.find(stat => stat.type === type) || { count: 0, last_updated: null };
  };

  const contentSections = [
    {
      id: 'homepage',
      title: 'Homepage Content',
      description: 'Manage banners, sections, and homepage layout',
      icon: FiHome,
      color: 'bg-blue-500',
      link: '/admin/content/homepage',
      stat: getStatByType('homepage_banner')
    },
    {
      id: 'pages',
      title: 'Static Pages',
      description: 'About Us, Terms, Privacy Policy, and other pages',
      icon: FiFileText,
      color: 'bg-green-500',
      link: '/admin/content/pages',
      stat: getStatByType('static_page')
    },
    {
      id: 'emails',
      title: 'Email Templates',
      description: 'Automated email templates and notifications',
      icon: FiMail,
      color: 'bg-purple-500',
      link: '/admin/content/emails',
      stat: getStatByType('email_template')
    },
    {
      id: 'faqs',
      title: 'FAQ Management',
      description: 'Frequently asked questions and answers',
      icon: FiHelpCircle,
      color: 'bg-orange-500',
      link: '/admin/content/faqs',
      stat: getStatByType('faq')
    },
    {
      id: 'blog',
      title: 'Blog & News',
      description: 'Blog posts, news articles, and announcements',
      icon: FiEdit,
      color: 'bg-red-500',
      link: '/admin/content/blog',
      stat: getStatByType('blog_post')
    },
    {
      id: 'promotions',
      title: 'Promotional Content',
      description: 'Banners, offers, and promotional materials',
      icon: FiPlus,
      color: 'bg-yellow-500',
      link: '/admin/content/promotions',
      stat: getStatByType('promotion')
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600">Manage website content, pages, and communications</p>
        </div>

        {/* Content Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {contentSections.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.id} href={section.link}>
                <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg ${section.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                        <p className="text-sm text-gray-600">{section.description}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        {section.stat.count} items
                      </div>
                      {section.stat.last_updated && (
                        <div className="text-xs text-gray-400">
                          Updated: {new Date(section.stat.last_updated).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/content/homepage">
              <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2">
                <FiHome className="h-4 w-4" />
                <span>Edit Homepage</span>
              </button>
            </Link>
            
            <Link href="/admin/content/blog">
              <button className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2">
                <FiEdit className="h-4 w-4" />
                <span>New Blog Post</span>
              </button>
            </Link>
            
            <Link href="/admin/content/faqs">
              <button className="w-full bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 flex items-center justify-center space-x-2">
                <FiHelpCircle className="h-4 w-4" />
                <span>Add FAQ</span>
              </button>
            </Link>
            
            <Link href="/admin/content/emails">
              <button className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2">
                <FiMail className="h-4 w-4" />
                <span>Email Templates</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Recent Content Updates */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Statistics</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.map((stat, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stat.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.last_updated ? new Date(stat.last_updated).toLocaleString() : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}