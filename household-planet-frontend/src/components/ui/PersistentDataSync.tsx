'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';

export function PersistentDataSync() {
  const { user } = useAuth();
  const { syncWithBackend: syncCart, syncLocalToBackend: syncLocalCart } = useCart();
  const { syncWithBackend: syncWishlist, syncLocalToBackend: syncLocalWishlist } = useWishlist();

  useEffect(() => {
    if (user) {
      // User is authenticated - sync local data to backend, then sync backend to local
      const syncOnAuth = async () => {
        try {
          // First sync local data to backend
          await Promise.all([
            syncLocalCart(),
            syncLocalWishlist()
          ]);
          
          // Then sync backend data to local state
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
  }, [user, syncCart, syncWishlist, syncLocalCart, syncLocalWishlist]);

  // This component doesn't render anything - it just handles data sync
  return null;
}