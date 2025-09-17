'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';

export function PersistentDataSync() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // User is authenticated - only sync backend data to local state
      const syncOnAuth = async () => {
        try {
          const { syncWithBackend: syncCart } = useCart.getState();
          const { syncWithBackend: syncWishlist } = useWishlist.getState();
          
          // Only sync backend data to local state (don't sync local to backend)
          await Promise.all([
            syncCart(),
            syncWishlist()
          ]);
        } catch (error) {
          console.warn('Failed to sync data on authentication:', error);
        }
      };
      
      syncOnAuth();
    }
  }, [user]);

  // This component doesn't render anything - it just handles data sync
  return null;
}
