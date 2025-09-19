'use client';

import { useEffect, useState } from 'react';
import { useDelivery } from '@/hooks/useDelivery';
import { useDeliveryLocations } from '@/hooks/useDeliveryLocations';

export default function TestDeliveryPage() {
  const [apiTest, setApiTest] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);
  
  // Test both hooks
  const deliveryHook = useDelivery();
  const deliveryLocationsHook = useDeliveryLocations();

  useEffect(() => {
    // Direct API test
    const testAPI = async () => {
      setApiLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/simple-delivery/locations`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setApiTest({
            success: true,
            status: response.status,
            count: data.data?.length || 0,
            data: data.data?.slice(0, 3) || []
          });
        } else {
          setApiTest({
            success: false,
            status: response.status,
            error: `HTTP ${response.status}`
          });
        }
      } catch (error) {
        setApiTest({
          success: false,
          error: (error as Error).message
        });
      } finally {
        setApiLoading(false);
      }
    };

    testAPI();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Delivery Locations Test</h1>
      
      {/* Environment Info */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Environment Info</h2>
        <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</p>
        <p><strong>Current Time:</strong> {new Date().toLocaleString()}</p>
      </div>

      {/* Direct API Test */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Direct API Test</h2>
        {apiLoading ? (
          <p className="text-blue-600">Testing API...</p>
        ) : apiTest ? (
          <div>
            {apiTest.success ? (
              <div className="text-green-600">
                <p>✅ API Success</p>
                <p><strong>Status:</strong> {apiTest.status}</p>
                <p><strong>Locations Found:</strong> {apiTest.count}</p>
                {apiTest.data.length > 0 && (
                  <div className="mt-2">
                    <p><strong>Sample Locations:</strong></p>
                    <ul className="list-disc list-inside ml-4">
                      {apiTest.data.map((loc: any, index: number) => (
                        <li key={index}>{loc.name} - Tier {loc.tier} - KSh {loc.price}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-red-600">
                <p>❌ API Failed</p>
                <p><strong>Error:</strong> {apiTest.error}</p>
                {apiTest.status && <p><strong>Status:</strong> {apiTest.status}</p>}
              </div>
            )}
          </div>
        ) : (
          <p>No test results yet</p>
        )}
      </div>

      {/* useDelivery Hook Test */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">useDelivery Hook Test</h2>
        <div className="space-y-2">
          <p><strong>Loading:</strong> {deliveryHook.loading ? '⏳ Yes' : '✅ No'}</p>
          <p><strong>Error:</strong> {deliveryHook.error || 'None'}</p>
          <p><strong>Locations Count:</strong> {deliveryHook.deliveryLocations.length}</p>
          <p><strong>Tier 1 Count:</strong> {deliveryHook.tier1Locations.length}</p>
          
          {deliveryHook.deliveryLocations.length > 0 && (
            <div className="mt-4">
              <p><strong>First 5 Locations:</strong></p>
              <ul className="list-disc list-inside ml-4">
                {deliveryHook.deliveryLocations.slice(0, 5).map((loc, index) => (
                  <li key={index}>{loc.name} - Tier {loc.tier} - KSh {loc.price}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* useDeliveryLocations Hook Test */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">useDeliveryLocations Hook Test</h2>
        <div className="space-y-2">
          <p><strong>Loading:</strong> {deliveryLocationsHook.loading ? '⏳ Yes' : '✅ No'}</p>
          <p><strong>Error:</strong> {deliveryLocationsHook.error || 'None'}</p>
          <p><strong>Locations Count:</strong> {deliveryLocationsHook.locations.length}</p>
          
          {deliveryLocationsHook.locations.length > 0 && (
            <div className="mt-4">
              <p><strong>First 5 Locations:</strong></p>
              <ul className="list-disc list-inside ml-4">
                {deliveryLocationsHook.locations.slice(0, 5).map((loc, index) => (
                  <li key={index}>{loc.name} - Tier {loc.tier} - KSh {loc.price}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
        <div className="space-y-2 text-sm">
          <p>If you see issues above:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Check that the backend server is running on port 3001</li>
            <li>Verify NEXT_PUBLIC_API_URL is set to https://api.householdplanetkenya.co.ke</li>
            <li>Check browser console for any JavaScript errors</li>
            <li>Check Network tab in browser dev tools for failed requests</li>
            <li>Try refreshing the page</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
