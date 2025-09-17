import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

interface WishlistStore {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (id: number) => void;
  clearWishlist: () => void;
  clearOnLogout: () => void;
  isInWishlist: (id: number) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) =>
        set((state) => {
          const exists = state.items.find((item) => item.id === product.id);
          if (!exists) {
            return { items: [...state.items, product] };
          }
          return state;
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      clearWishlist: () => set({ items: [] }),
      clearOnLogout: () => set({ items: [] }),
      isInWishlist: (id) => {
        const { items } = get();
        return items.some((item) => item.id === id);
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
