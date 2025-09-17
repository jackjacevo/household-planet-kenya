'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';

interface SearchAnalytics {
  totalSearches: number;
  uniqueQueries: number;
  topQueries: Array<{ query: string; _count: { query: number } }>;
  noResultQueries: Array<{ query: string }>;
  averageResults: number;
  searchTrends: Array<{
    date: string;
    searches: number;
    unique_queries: number;
    avg_results: number;
  }>;
}

export default function SearchAnalytics() {
  const [analytics, setAnalytics] = useState<SearchAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/content/search/analytics?days=${timeRange}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch search analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return <div className="flex justify-center p-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Search Analytics</h2>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalytics} size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {analytics && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Searches</p>
                    <p className="text-2xl font-bold">{analytics.totalSearches.toLocaleString()}</p>
                  </div>
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Unique Queries</p>
                    <p className="text-2xl font-bold">{analytics.uniqueQueries.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Results</p>
                    <p className="text-2xl font-bold">{analytics.averageResults.toFixed(1)}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">No Results</p>
                    <p className="text-2xl font-bold">{analytics.noResultQueries.length}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Search Queries */}
          <Card>
            <CardHeader>
              <CardTitle>Top Search Queries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topQueries.slice(0, 10).map((query, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <span className="font-medium">{query.query}</span>
                    </div>
                    <Badge variant="secondary">
                      {query._count.query} searches
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* No Results Queries */}
          {analytics.noResultQueries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Queries with No Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {analytics.noResultQueries.slice(0, 12).map((query, index) => (
                    <Badge key={index} variant="destructive" className="justify-center">
                      {query.query}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Consider adding products or content for these search terms to improve user experience.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded border-l-4 border-blue-600">
                  <h4 className="font-medium text-blue-900">High-Volume Keywords</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Focus on optimizing content for: {analytics.topQueries.slice(0, 3).map(q => q.query).join(', ')}
                  </p>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded border-l-4 border-yellow-600">
                  <h4 className="font-medium text-yellow-900">Content Gaps</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Consider creating content for searches with no results to capture more traffic.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded border-l-4 border-green-600">
                  <h4 className="font-medium text-green-900">Search Performance</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Average of {analytics.averageResults.toFixed(1)} results per search indicates good content coverage.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
