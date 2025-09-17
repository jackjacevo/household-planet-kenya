'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Search, Target, TrendingUp, Eye } from 'lucide-react';

interface SeoData {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  altText: string[];
  structuredData: any;
}

interface SeoOptimizerProps {
  type: 'product' | 'category';
  itemId: number;
  currentData?: any;
}

export default function SeoOptimizer({ type, itemId, currentData }: SeoOptimizerProps) {
  const [seoData, setSeoData] = useState<SeoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [customKeywords, setCustomKeywords] = useState('');

  const optimizeSeo = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/content/seo/${type}/${itemId}`);
      const data = await response.json();
      setSeoData(data);
    } catch (error) {
      console.error('SEO optimization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateKeywords = () => {
    if (seoData && customKeywords) {
      const newKeywords = customKeywords.split(',').map(k => k.trim());
      setSeoData({
        ...seoData,
        keywords: [...new Set([...seoData.keywords, ...newKeywords])]
      });
      setCustomKeywords('');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            SEO Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={optimizeSeo} disabled={loading} className="mb-4">
            {loading ? 'Optimizing...' : 'Generate SEO Data'}
          </Button>

          {seoData && (
            <div className="space-y-6">
              {/* Meta Title */}
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={seoData.metaTitle}
                  onChange={(e) => setSeoData({ ...seoData, metaTitle: e.target.value })}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Length: {seoData.metaTitle.length}/60 characters
                </p>
              </div>

              {/* Meta Description */}
              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={seoData.metaDescription}
                  onChange={(e) => setSeoData({ ...seoData, metaDescription: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Length: {seoData.metaDescription.length}/160 characters
                </p>
              </div>

              {/* Keywords */}
              <div>
                <Label>Keywords</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-3">
                  {seoData.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom keywords (comma separated)"
                    value={customKeywords}
                    onChange={(e) => setCustomKeywords(e.target.value)}
                  />
                  <Button onClick={updateKeywords} size="sm">
                    Add
                  </Button>
                </div>
              </div>

              {/* Alt Text */}
              {seoData.altText && seoData.altText.length > 0 && (
                <div>
                  <Label>Image Alt Text</Label>
                  <div className="space-y-2 mt-2">
                    {seoData.altText.map((alt, index) => (
                      <Input
                        key={index}
                        value={alt}
                        onChange={(e) => {
                          const newAltText = [...seoData.altText];
                          newAltText[index] = e.target.value;
                          setSeoData({ ...seoData, altText: newAltText });
                        }}
                        placeholder={`Image ${index + 1} alt text`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Structured Data Preview */}
              <div>
                <Label>Structured Data (Schema.org)</Label>
                <pre className="bg-gray-100 p-3 rounded text-sm mt-2 overflow-auto">
                  {JSON.stringify(seoData.structuredData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SEO Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            SEO Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">85</div>
              <div className="text-sm text-gray-500">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">92</div>
              <div className="text-sm text-gray-500">Title Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">78</div>
              <div className="text-sm text-gray-500">Description</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">88</div>
              <div className="text-sm text-gray-500">Keywords</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Search Result Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {seoData && (
            <div className="border rounded p-4 bg-white">
              <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                {seoData.metaTitle}
              </div>
              <div className="text-green-600 text-sm">
                https://householdplanet.co.ke/{type}s/{currentData?.slug}
              </div>
              <div className="text-gray-600 text-sm mt-1">
                {seoData.metaDescription}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
