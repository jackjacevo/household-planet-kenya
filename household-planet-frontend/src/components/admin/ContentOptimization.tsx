'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Search, Image, Link, Star, TrendingUp } from 'lucide-react';
import SeoOptimizer from '@/components/SEO/SeoOptimizer';
import SearchAnalytics from '@/components/search/SearchAnalytics';

export default function ContentOptimization() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const optimizeImageAlt = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/content/optimize-image-alt', { method: 'POST' });
      const data = await response.json();
      setResults({ type: 'image-alt', data });
    } catch (error) {
      console.error('Failed to optimize image alt text:', error);
    } finally {
      setLoading(false);
    }
  };

  const optimizeUrls = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/content/optimize-urls', { method: 'POST' });
      const data = await response.json();
      setResults({ type: 'urls', data });
    } catch (error) {
      console.error('Failed to optimize URLs:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'seo', label: 'SEO Optimizer', icon: Search },
    { id: 'analytics', label: 'Search Analytics', icon: Star }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Content Optimization</h1>
      </div>

      {/* Tabs */}
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Image Alt Text Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Automatically generate SEO-optimized alt text for all product images.
              </p>
              <Button onClick={optimizeImageAlt} disabled={loading}>
                {loading ? 'Optimizing...' : 'Optimize Alt Text'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                URL Structure Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Optimize product and category URLs for better SEO performance.
              </p>
              <Button onClick={optimizeUrls} disabled={loading}>
                {loading ? 'Optimizing...' : 'Optimize URLs'}
              </Button>
            </CardContent>
          </Card>

          {/* Results Display */}
          {results && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Optimization Results</CardTitle>
              </CardHeader>
              <CardContent>
                {results.type === 'image-alt' && (
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      Updated {results.data.updated} products
                    </Badge>
                    <p className="text-sm text-gray-600">
                      All product images now have SEO-optimized alt text.
                    </p>
                  </div>
                )}
                
                {results.type === 'urls' && (
                  <div className="space-y-4">
                    <div>
                      <Badge variant="secondary" className="mb-2">
                        Products: {results.data.products.optimized} optimized
                      </Badge>
                      <Badge variant="secondary" className="mb-2 ml-2">
                        Categories: {results.data.categories.optimized} optimized
                      </Badge>
                    </div>
                    
                    {results.data.products.updates.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Product URL Updates:</h4>
                        <div className="space-y-1 text-sm">
                          {results.data.products.updates.slice(0, 5).map((update: any, index: number) => (
                            <div key={index} className="text-gray-600">
                              {update.oldSlug} → {update.newSlug}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* SEO Optimizer Tab */}
      {activeTab === 'seo' && (
        <SeoOptimizer type="product" itemId={1} />
      )}

      {/* Search Analytics Tab */}
      {activeTab === 'analytics' && (
        <SearchAnalytics />
      )}
    </div>
  );
}
