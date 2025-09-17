'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useCart } from './useCart';
import { useWishlist } from './useWishlist';

export function usePersistentData() {
  const { user } = useAuth();
  const { syncWithBackend: syncCart, syncLocalToBackend: syncLocalCart } = useCart();
  const { syncWithBackend: syncWishlist, syncLocalToBackend: syncLocalWishlist } = useWishlist();

  useEffect(() => {
    if (user) {
      // User just logged in - sync local data to backend, then sync backend to local
      const syncOnLogin = async () => {
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
          console.warn('Failed to sync data on login:', error);
        }
      };
      
      syncOnLogin();
    }
  }, [user, syncCart, syncWishlist, syncLocalCart, syncLocalWishlist]);

  return {
    syncCart,
    syncWishlist,
    syncLocalCart,
    syncLocalWishlist
  };
}
