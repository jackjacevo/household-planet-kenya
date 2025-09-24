import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';
import { api } from '@/lib/api';

interface WishlistStore {
  items: Product[];
  isLoading: boolean;
  wishlistData: any;
  addToWishlist: (product: Product, isAuthenticated?: boolean) => Promise<boolean>;
  removeFromWishlist: (id: string | number, isAuthenticated?: boolean) => Promise<void>;
  isInWishlist: (id: string | number) => boolean;
  clearWishlist: (isAuthenticated?: boolean) => Promise<void>;
  syncWithBackend: () => Promise<void>;
  syncLocalToBackend: () => Promise<void>;
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      wishlistData: null,
      
      addToWishlist: async (product, isAuthenticated = false) => {
        const state = get();
        const existingItem = state.items.find((item) => item.id === product.id);
        if (existingItem) {
          return false;
        }

        set({ isLoading: true });
        
        try {
          if (isAuthenticated) {
            await api.post(`/wishlist/${product.id}`);
            await get().syncWithBackend();
          } else {
            set((state) => ({ items: [...state.items, product] }));
          }
          set({ isLoading: false });
          return true;
        } catch (error) {
          console.error('Failed to add to wishlist:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      removeFromWishlist: async (id, isAuthenticated = false) => {
        const numericId = typeof id === 'string' ? Number(id) : id;
        
        set({ isLoading: true });
        
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          const shouldUseBackend = isAuthenticated || token;
          
          if (shouldUseBackend) {
            await api.delete(`/wishlist/${numericId}`);
            await get().syncWithBackend();
          } else {
            set((state) => ({
              items: state.items.filter((item) => item.id !== numericId),
            }));
          }
        } catch (error) {
          console.error('Failed to remove from wishlist:', error);
          // Fallback to local removal if backend fails
          set((state) => ({
            items: state.items.filter((item) => item.id !== numericId),
          }));
        } finally {
          set({ isLoading: false });
        }
      },
      
      isInWishlist: (id) => {
        const state = get();
        const numericId = typeof id === 'string' ? Number(id) : id;
        return state.items.some((item) => item.id === numericId);
      },
      
      clearWishlist: async (isAuthenticated = false) => {
        set({ isLoading: true });
        
        if (isAuthenticated) {
          try {
            await api.delete('/wishlist');
          } catch (error) {
            console.error('Failed to clear wishlist:', error);
          }
        }
        
        set({ items: [], isLoading: false });
      },

      syncWithBackend: async () => {
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          if (!token) {
            console.log('No token found, skipping wishlist sync');
            return;
          }
          
          const response = await api.get('/wishlist');
          const wishlistData = (response as any).data;
          // Handle different response structures
          let itemsArray = [];
          if (wishlistData.items && Array.isArray(wishlistData.items)) {
            itemsArray = wishlistData.items;
          } else if (Array.isArray((response as any).data)) {
            itemsArray = (response as any).data;
          } else if (Array.isArray(wishlistData)) {
            itemsArray = wishlistData;
          } else {
            console.warn('Unexpected wishlist API response structure:', wishlistData);
            itemsArray = [];
          }
          
          const backendItems = itemsArray.map((item: any) => item.product || item);
          set({ items: backendItems, wishlistData });
        } catch (error) {
          console.error('Failed to sync wishlist:', error);
          // If it's an auth error, don't retry
          if (error instanceof Error && error.message.includes('Authentication required')) {
            console.log('Authentication required for wishlist sync, clearing token');
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
            }
          }
        }
      },

      syncLocalToBackend: async () => {
        const state = get();
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        
        if (!token) {
          console.log('No token found, skipping local to backend wishlist sync');
          return;
        }
        
        if (state.items.length === 0) return;
        
        for (const item of state.items) {
          try {
            await api.post(`/wishlist/${item.id}`);
          } catch (error) {
            console.warn(`Failed to sync wishlist item ${item.id}:`, error);
          }
        }
        await get().syncWithBackend();
      },
      
      clearOnLogout: () => {
        set({ items: [], wishlistData: null, isLoading: false });
      },
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({
        items: state.items
      })
    }
  )
);
