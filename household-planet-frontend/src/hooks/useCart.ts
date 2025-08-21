'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';
import { api } from '@/lib/api';

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  savedForLater: CartItem[];
  addToCart: (item: CartItem, isAuthenticated?: boolean) => Promise<void>;
  removeFromCart: (id: string, isAuthenticated?: boolean) => Promise<void>;
  updateQuantity: (id: string, quantity: number, isAuthenticated?: boolean) => Promise<void>;
  clearCart: (isAuthenticated?: boolean) => Promise<void>;
  saveForLater: (id: string, isAuthenticated?: boolean) => Promise<void>;
  moveToCart: (id: string) => void;
  syncWithBackend: () => Promise<void>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      savedForLater: [],
      
      addToCart: async (item, isAuthenticated = false) => {
        set({ isLoading: true });
        
        if (isAuthenticated) {
          try {
            await api.post('/api/cart', {
              productId: item.product.id,
              variantId: item.variant?.id,
              quantity: item.quantity
            });
            await get().syncWithBackend();
          } catch (error) {
            console.error('Failed to add to cart:', error);
          }
        } else {
          set((state) => {
            const existingItem = state.items.find((i) => i.id === item.id);
            if (existingItem) {
              return {
                items: state.items.map((i) =>
                  i.id === item.id
                    ? { ...i, quantity: i.quantity + item.quantity }
                    : i
                ),
              };
            }
            return { items: [...state.items, item] };
          });
        }
        
        set({ isLoading: false });
      },
      
      removeFromCart: async (id, isAuthenticated = false) => {
        set({ isLoading: true });
        
        if (isAuthenticated) {
          try {
            await api.delete(`/api/cart/${id}`);
            await get().syncWithBackend();
          } catch (error) {
            console.error('Failed to remove from cart:', error);
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
        
        if (isAuthenticated) {
          try {
            await api.put(`/api/cart/${id}`, { quantity });
            await get().syncWithBackend();
          } catch (error) {
            console.error('Failed to update cart:', error);
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
      
      clearCart: async (isAuthenticated = false) => {
        set({ isLoading: true });
        
        if (isAuthenticated) {
          try {
            await api.delete('/api/cart');
          } catch (error) {
            console.error('Failed to clear cart:', error);
          }
        }
        
        set({ items: [], isLoading: false });
      },
      
      saveForLater: async (id, isAuthenticated = false) => {
        set({ isLoading: true });
        
        if (isAuthenticated) {
          try {
            await api.post(`/api/cart/save-for-later/${id}`);
            await get().syncWithBackend();
          } catch (error) {
            console.error('Failed to save for later:', error);
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
      
      moveToCart: (id) => {
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
      },
      
      syncWithBackend: async () => {
        try {
          const response = await api.get('/api/cart');
          const cartData = response.data as any;
          const backendItems = (cartData.items || []).map((item: any) => ({
            id: `${item.productId}-${item.variantId || 'default'}`,
            product: item.product,
            variant: item.variant,
            quantity: item.quantity
          }));
          set({ items: backendItems });
        } catch (error) {
          console.error('Failed to sync cart:', error);
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
    }
  )
);
