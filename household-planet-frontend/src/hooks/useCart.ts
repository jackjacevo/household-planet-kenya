'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';
import { api } from '@/lib/api';

interface LocalCartItem {
  productId: number;
  variantId?: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  savedForLater: CartItem[];
  cartData: any;
  addToCart: (item: CartItem, isAuthenticated?: boolean) => Promise<boolean>;
  removeFromCart: (id: string, isAuthenticated?: boolean) => Promise<void>;
  updateQuantity: (id: string, quantity: number, isAuthenticated?: boolean) => Promise<void>;
  clearCart: (isAuthenticated?: boolean, force?: boolean) => Promise<void>;
  saveForLater: (id: string, isAuthenticated?: boolean) => Promise<void>;
  moveToCart: (id: string) => Promise<void>;
  syncWithBackend: () => Promise<void>;
  syncLocalToBackend: () => Promise<void>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      savedForLater: [],
      cartData: null,
      
      addToCart: async (item, isAuthenticated = false) => {
        const state = get();
        const existingItem = state.items.find((i) => 
          i.productId === item.productId && 
          i.variant?.id === item.variant?.id
        );
        
        if (existingItem) {
          set({ isLoading: false });
          return false;
        }

        set({ isLoading: true });
        
        const token = localStorage.getItem('token');
        const shouldUseBackend = isAuthenticated || token;
        
        try {
          if (shouldUseBackend) {
            await api.addToCart(
              item.product.id,
              item.quantity,
              item.variant?.id
            );
            await get().syncWithBackend();
          } else {
            set((state) => ({ items: [...state.items, item] }));
          }
          set({ isLoading: false });
          return true;
        } catch (error) {
          console.error('Failed to add to cart:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      removeFromCart: async (id, isAuthenticated = false) => {
        set({ isLoading: true });
        
        const token = localStorage.getItem('token');
        const shouldUseBackend = isAuthenticated || token;
        
        if (shouldUseBackend) {
          try {
            // Extract numeric ID from string ID if needed
            const numericId = id.includes('-') ? id.split('-')[0] : id;
            await api.delete(`/api/cart/${numericId}`);
            await get().syncWithBackend();
          } catch (error) {
            console.error('Failed to remove from cart:', error);
            // Fallback to local storage if backend fails
            set((state) => ({
              items: state.items.filter((item) => item.id !== id),
            }));
          }
        } else {
          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
          }));
        }
        
        set({ isLoading: false });
      },
      
      updateQuantity: async (id, quantity, isAuthenticated = false) => {
        if (quantity <= 0) {
          await get().removeFromCart(id, isAuthenticated);
          return;
        }
        
        set({ isLoading: true });
        
        const token = localStorage.getItem('token');
        const shouldUseBackend = isAuthenticated || token;
        
        if (shouldUseBackend) {
          try {
            // Extract numeric ID from string ID if needed
            const numericId = id.includes('-') ? id.split('-')[0] : id;
            await api.put(`/api/cart/${numericId}`, { quantity });
            await get().syncWithBackend();
          } catch (error) {
            console.error('Failed to update cart:', error);
            // Fallback to local storage if backend fails
            set((state) => ({
              items: state.items.map((item) =>
                item.id === id ? { ...item, quantity } : item
              ),
            }));
          }
        } else {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id ? { ...item, quantity } : item
            ),
          }));
        }
        
        set({ isLoading: false });
      },
      
      clearCart: async (isAuthenticated = false, force = false) => {
        // Only clear if forced (after order confirmation) or explicitly requested
        if (!force) {
          console.log('Cart clear prevented - use force=true after order confirmation');
          return;
        }
        
        set({ isLoading: true });
        
        const token = localStorage.getItem('token');
        const shouldUseBackend = isAuthenticated || token;
        
        if (shouldUseBackend) {
          try {
            await api.delete('/api/cart');
          } catch (error) {
            console.error('Failed to clear cart:', error);
          }
        }
        
        // Clear checkout data as well
        localStorage.removeItem('checkoutData');
        set({ items: [], cartData: null, isLoading: false });
      },
      
      saveForLater: async (id, isAuthenticated = false) => {
        set({ isLoading: true });
        
        const token = localStorage.getItem('token');
        const shouldUseBackend = isAuthenticated || token;
        
        if (shouldUseBackend) {
          try {
            // Extract numeric ID from string ID if needed
            const numericId = id.includes('-') ? id.split('-')[0] : id;
            await api.post(`/api/cart/save-for-later/${numericId}`);
            await get().syncWithBackend();
          } catch (error) {
            console.error('Failed to save for later:', error);
            // Fallback to local storage if backend fails
            set((state) => {
              const item = state.items.find(i => i.id === id);
              if (item) {
                return {
                  items: state.items.filter(i => i.id !== id),
                  savedForLater: [...state.savedForLater, item]
                };
              }
              return state;
            });
          }
        } else {
          set((state) => {
            const item = state.items.find(i => i.id === id);
            if (item) {
              return {
                items: state.items.filter(i => i.id !== id),
                savedForLater: [...state.savedForLater, item]
              };
            }
            return state;
          });
        }
        
        set({ isLoading: false });
      },
      
      moveToCart: async (id) => {
        const token = localStorage.getItem('token');
        
        if (token) {
          try {
            await api.post(`/api/cart/move-to-cart/${id}`);
            await get().syncWithBackend();
          } catch (error) {
            console.error('Failed to move to cart:', error);
            // Fallback to local storage if backend fails
            set((state) => {
              const item = state.savedForLater.find(i => i.id === id);
              if (item) {
                return {
                  savedForLater: state.savedForLater.filter(i => i.id !== id),
                  items: [...state.items, item]
                };
              }
              return state;
            });
          }
        } else {
          set((state) => {
            const item = state.savedForLater.find(i => i.id === id);
            if (item) {
              return {
                savedForLater: state.savedForLater.filter(i => i.id !== id),
                items: [...state.items, item]
              };
            }
            return state;
          });
        }
      },
      
      syncWithBackend: async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.log('No token found, skipping cart sync');
            return;
          }
          
          const response = await api.get('/api/cart');
          const cartData = response.data as any;
          const backendItems = (cartData.items || []).map((item: any) => ({
            id: item.id.toString(), // Use actual cart item ID from backend
            productId: item.productId,
            product: item.product,
            variant: item.variant,
            quantity: item.quantity,

          }));
          set({ items: backendItems, cartData });
        } catch (error) {
          console.error('Failed to sync cart:', error);
        }
      },

      syncLocalToBackend: async () => {
        const state = get();
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log('No token found, skipping local to backend sync');
          return;
        }
        
        if (state.items.length === 0) {
          console.log('No local items to sync');
          return;
        }
        
        const localItems: LocalCartItem[] = state.items.map(item => ({
          productId: item.product.id,
          variantId: item.variant?.id,
          quantity: item.quantity
        }));
        
        try {
          console.log('Syncing local cart to backend:', localItems.length, 'items');
          await api.post('/api/cart/sync', { items: localItems });
          // Clear local items after successful sync to prevent duplicates
          set({ items: [] });
          await get().syncWithBackend();
        } catch (error) {
          console.error('Failed to sync local cart to backend:', error);
        }
      },
      
      getTotalPrice: () => {
        const state = get();
        return state.items.reduce((total, item) => {
          const price = item.variant?.price || item.product.price;
          return total + price * item.quantity;
        }, 0);
      },
      
      getTotalItems: () => {
        const state = get();
        return state.items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        savedForLater: state.savedForLater
      })
    }
  )
);
