// Quick fix script to test and fix delivery locations issue

const fs = require('fs');
const path = require('path');

// Create a simplified useDelivery hook that should work reliably
const fixedHookContent = `'use client';

import { useState, useEffect } from 'react';

interface DeliveryLocation {
  id: string;
  name: string;
  tier: number;
  price: number;
  description?: string;
  estimatedDays: number;
  expressAvailable: boolean;
  expressPrice?: number;
}

export function useDelivery() {
  const [locations, setLocations] = useState<DeliveryLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchLocations = async () => {
      try {
        console.log('🔄 Fetching delivery locations...');
        setLoading(true);
        setError(null);
        
        const response = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/api/simple-delivery/locations\`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
        }
        
        const data = await response.json();
        console.log('📦 API Response:', data);
        
        if (data.success && Array.isArray(data.data)) {
          if (mounted) {
            setLocations(data.data);
            console.log(\`✅ Loaded \${data.data.length} delivery locations\`);
          }
        } else {
          throw new Error('Invalid API response format');
        }
        
      } catch (err) {
        console.error('❌ Failed to fetch delivery locations:', err);
        
        if (mounted) {
          setError(err.message);
          
          // Fallback to basic locations
          const fallbackLocations = [
            { id: '1', name: 'Nairobi CBD', tier: 1, price: 100, description: 'Orders within CBD only', estimatedDays: 1, expressAvailable: true, expressPrice: 200 },
            { id: '26', name: 'Westlands', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
            { id: '41', name: 'Lavington', tier: 3, price: 350, estimatedDays: 2, expressAvailable: true, expressPrice: 500 },
            { id: '60', name: 'Karen', tier: 4, price: 650, estimatedDays: 3, expressAvailable: true, expressPrice: 800 },
            { id: '62', name: 'JKIA', tier: 4, price: 700, estimatedDays: 2, expressAvailable: true, expressPrice: 900 }
          ];
          
          setLocations(fallbackLocations);
          console.log(\`⚠️ Using \${fallbackLocations.length} fallback locations\`);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchLocations();
    
    return () => {
      mounted = false;
    };
  }, []);

  const calculateDeliveryCost = async (locationId: string, orderValue: number): Promise<number> => {
    const location = locations.find(loc => loc.id === locationId);
    if (!location) return 0;
    
    let cost = location.price;
    
    // Apply free delivery for orders over threshold
    if (orderValue >= 5000) {
      cost = 0;
    } else if (orderValue >= 3000) {
      cost = Math.round(cost * 0.5); // 50% discount
    }
    
    return cost;
  };

  const getLocationById = (id: string) => {
    return locations.find(location => location.id === id);
  };

  const tier1Locations = locations.filter(loc => loc.tier === 1);
  const minDeliveryPrice = tier1Locations.length > 0 ? Math.min(...tier1Locations.map(loc => loc.price)) : 100;

  return {
    locations,
    tier1Locations,
    deliveryLocations: locations,
    minDeliveryPrice,
    freeDeliveryThreshold: 5000,
    loading,
    error,
    calculateDeliveryCost,
    getLocationById
  };
}`;

// Write the fixed hook
const hookPath = path.join(__dirname, 'household-planet-frontend', 'src', 'hooks', 'useDelivery.ts');
console.log('📝 Writing fixed useDelivery hook...');

try {
  fs.writeFileSync(hookPath, fixedHookContent);
  console.log('✅ Fixed useDelivery hook written successfully');
  console.log('');
  console.log('🔧 Changes made:');
  console.log('  • Simplified API call logic');
  console.log('  • Better error handling');
  console.log('  • More reliable loading states');
  console.log('  • Added console logging for debugging');
  console.log('  • Improved fallback locations');
  console.log('');
  console.log('📋 Next steps:');
  console.log('  1. Restart your frontend development server');
  console.log('  2. Go to http://localhost:3000/cart');
  console.log('  3. Check browser console for debug messages');
  console.log('  4. The delivery locations should now load properly');
} catch (error) {
  console.error('❌ Error writing file:', error.message);
}

<parameter name="explanation">Creating a script to fix the delivery locations hook with better error handling and debugging