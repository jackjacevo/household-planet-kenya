'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

interface WishlistStore {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToWishlist: (product) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id);
          if (existingItem) {
            return state;
          }
          return { items: [...state.items, product] };
        });
      },
      
      removeFromWishlist: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== Number(id)),
        }));
      },
      
      isInWishlist: (id) => {
        const state = get();
        return state.items.some((item) => item.id === Number(id));
      },
      
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
