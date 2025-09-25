'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { CartItem } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from './AuthProvider';

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addItem: (productId: string, variantId?: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  refreshCart: () => Promise<void>;
  syncLocalCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      // Load guest cart from localStorage
      const guestCart = localStorage.getItem('guestCart');
      if (guestCart) {
        try {
          const parsed = JSON.parse(guestCart);
          setItems(parsed.items || []);
        } catch {
          localStorage.removeItem('guestCart');
        }
      }
      setIsLoading(false);
    }
  }, [user]);

  // Sync local cart with backend when user logs in
  const syncLocalCart = async () => {
    if (!user || items.length === 0) return;
    
    const localItems = items.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity
    }));
    
    try {
      // For now, just clear local cart - in a real implementation, you would sync with backend
      localStorage.removeItem('guestCart');
      await refreshCart();
    } catch (error) {
      console.error('Failed to sync local cart:', error);
    }
  };

  const refreshCart = async () => {
    if (!user) return;

    try {
      // TODO: Implement backend cart sync when cart API is available
      // For now, just load from localStorage for authenticated users too
      const guestCart = localStorage.getItem('guestCart');
      if (guestCart) {
        try {
          const parsed = JSON.parse(guestCart);
          setItems(parsed.items || []);
        } catch {
          localStorage.removeItem('guestCart');
          setItems([]);
        }
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to refresh cart:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (productId: string, variantId?: string, quantity = 1) => {
    // TODO: Implement backend cart sync when cart API is available
    // For now, use localStorage for both authenticated and guest users
    const newItem: CartItem = {
      id: Date.now().toString(),
      productId: typeof productId === 'string' ? parseInt(productId) : productId,
      variantId: variantId ? (typeof variantId === 'string' ? parseInt(variantId) : variantId) : undefined,
      quantity,
      product: {} as any, // Will be populated when cart is synced
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    localStorage.setItem('guestCart', JSON.stringify({ items: updatedItems }));
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    // TODO: Implement backend cart sync when cart API is available
    // For now, use localStorage for both authenticated and guest users
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    );
    setItems(updatedItems);
    localStorage.setItem('guestCart', JSON.stringify({ items: updatedItems }));
  };

  const removeItem = async (itemId: string) => {
    // TODO: Implement backend cart sync when cart API is available
    // For now, use localStorage for both authenticated and guest users
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    localStorage.setItem('guestCart', JSON.stringify({ items: updatedItems }));
  };

  const clearCart = async () => {
    // TODO: Implement backend cart sync when cart API is available
    // For now, use localStorage for both authenticated and guest users
    setItems([]);
    localStorage.removeItem('guestCart');
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = item.variant?.price || item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        getTotalPrice,
        getTotalItems,
        refreshCart,
        syncLocalCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
