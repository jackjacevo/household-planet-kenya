'use client';

import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { safeAdminAPI, adminAPI } from '../../lib/api/admin-api-wrapper';

export default function AdminAPITestPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, any>>({});

  const testEndpoint = async (name: string, apiCall: () => Promise<any>) => {
    try {
      setLoading(true);
      console.log(`Testing ${name}...`);

      const startTime = Date.now();
      const result = await apiCall();
      const duration = Date.now() - startTime;

      setResults(prev => ({
        ...prev,
        [name]: {
          success: true,
          data: result,
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        }
      }));

      console.log(`✅ ${name} succeeded in ${duration}ms:`, result);
    } catch (error) {
      console.error(`❌ ${name} failed:`, error);
      setResults(prev => ({
        ...prev,
        [name]: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setResults({});

    const tests = [
      { name: 'Categories (Safe API)', call: () => safeAdminAPI.categories.getAll() },
      { name: 'Brands (Safe API)', call: () => safeAdminAPI.brands.getAll() },
      { name: 'Products (Safe API)', call: () => safeAdminAPI.products.getAll() },
      { name: 'Dashboard (Safe API)', call: () => safeAdminAPI.dashboard.getStats() },
      { name: 'Categories (Direct API)', call: () => adminAPI.categories.getCategories() },
      { name: 'Brands (Direct API)', call: () => adminAPI.brands.getBrands() },
      { name: 'Products (Direct API)', call: () => adminAPI.products.getProducts() },
      { name: 'Dashboard (Direct API)', call: () => adminAPI.dashboard.getDashboardStats() },
    ];

    for (const test of tests) {
      await testEndpoint(test.name, test.call);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setLoading(false);
  };

  const testHealthCheck = async () => {
    await testEndpoint('Health Check', async () => {
      const response = await fetch('/api/health');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    });
    setLoading(false);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin API Test Suite</h1>

        <div className="flex gap-4 mb-6">
          <Button
            onClick={runAllTests}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Running Tests...' : 'Test All Admin APIs'}
          </Button>

          <Button
            onClick={testHealthCheck}
            disabled={loading}
            variant="outline"
          >
            Test Health Check
          </Button>

          <Button
            onClick={() => setResults({})}
            variant="outline"
          >
            Clear Results
          </Button>
        </div>

        <div className="grid gap-4">
          {Object.entries(results).map(([name, result]) => (
            <div
              key={name}
              className={`p-4 rounded-lg border ${
                result.success
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20'
                  : 'bg-red-50 border-red-200 dark:bg-red-900/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{name}</h3>
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <>
                      <span className="text-green-600">✅ Success</span>
                      <span className="text-sm text-gray-500">{result.duration}</span>
                    </>
                  ) : (
                    <span className="text-red-600">❌ Failed</span>
                  )}
                </div>
              </div>

              <div className="text-sm">
                <div className="mb-2">
                  <strong>Time:</strong> {new Date(result.timestamp).toLocaleTimeString()}
                </div>

                {result.success ? (
                  <div>
                    <strong>Response:</strong>
                    <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto max-h-32">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-red-600">
                    <strong>Error:</strong> {result.error}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {Object.keys(results).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No test results yet. Click "Test All Admin APIs" to run the test suite.
          </div>
        )}
      </div>
    </div>
  );
}