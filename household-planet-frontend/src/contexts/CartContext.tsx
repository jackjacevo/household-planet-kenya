'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { api } from '../lib/api';

interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    slug: string;
  };
  variant?: {
    id: string;
    name: string;
    price: number;
  };
}

interface SavedItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    slug: string;
  };
  variant?: {
    id: string;
    name: string;
    price: number;
  };
}

interface PromoCode {
  promoCode: string;
  discountType: string;
  discountValue: number;
  discount: number;
  originalTotal: number;
  finalTotal: number;
  savings: number;
}

interface CartState {
  items: CartItem[];
  savedItems: SavedItem[];
  total: number;
  itemCount: number;
  promo?: PromoCode;
  promoError?: string;
  finalTotal?: number;
  loading: boolean;
  guestCart: CartItem[];
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: { items: CartItem[]; total: number; itemCount: number; promo?: PromoCode; finalTotal?: number; promoError?: string } }
  | { type: 'SET_SAVED_ITEMS'; payload: SavedItem[] }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'APPLY_PROMO'; payload: PromoCode }
  | { type: 'REMOVE_PROMO' }
  | { type: 'SET_PROMO_ERROR'; payload: string }
  | { type: 'ADD_TO_GUEST_CART'; payload: CartItem }
  | { type: 'UPDATE_GUEST_ITEM'; payload: { productId: string; variantId?: string; quantity: number } }
  | { type: 'REMOVE_GUEST_ITEM'; payload: { productId: string; variantId?: string } }
  | { type: 'CLEAR_GUEST_CART' };

const initialState: CartState = {
  items: [],
  savedItems: [],
  total: 0,
  itemCount: 0,
  loading: false,
  guestCart: []
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_CART':
      return { 
        ...state, 
        items: action.payload.items,
        total: action.payload.total,
        itemCount: action.payload.itemCount,
        promo: action.payload.promo,
        finalTotal: action.payload.finalTotal,
        promoError: action.payload.promoError,
        loading: false
      };
    case 'SET_SAVED_ITEMS':
      return { ...state, savedItems: action.payload };
    case 'ADD_TO_CART':
      return { 
        ...state, 
        items: [...state.items, action.payload],
        itemCount: state.itemCount + action.payload.quantity,
        total: state.total + (action.payload.variant?.price || action.payload.product.price) * action.payload.quantity
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    case 'CLEAR_CART':
      return { ...state, items: [], total: 0, itemCount: 0, promo: undefined, finalTotal: undefined };
    case 'APPLY_PROMO':
      return { ...state, promo: action.payload, finalTotal: action.payload.finalTotal, promoError: undefined };
    case 'REMOVE_PROMO':
      return { ...state, promo: undefined, finalTotal: undefined, promoError: undefined };
    case 'SET_PROMO_ERROR':
      return { ...state, promoError: action.payload, promo: undefined, finalTotal: undefined };
    case 'ADD_TO_GUEST_CART':
      const existingGuestItem = state.guestCart.find(item => 
        item.productId === action.payload.productId && 
        item.variantId === action.payload.variantId
      );
      if (existingGuestItem) {
        return {
          ...state,
          guestCart: state.guestCart.map(item =>
            item.productId === action.payload.productId && item.variantId === action.payload.variantId
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      }
      return { ...state, guestCart: [...state.guestCart, action.payload] };
    case 'UPDATE_GUEST_ITEM':
      return {
        ...state,
        guestCart: state.guestCart.map(item =>
          item.productId === action.payload.productId && item.variantId === action.payload.variantId
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    case 'REMOVE_GUEST_ITEM':
      return {
        ...state,
        guestCart: state.guestCart.filter(item => 
          !(item.productId === action.payload.productId && item.variantId === action.payload.variantId)
        )
      };
    case 'CLEAR_GUEST_CART':
      return { ...state, guestCart: [] };
    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addToCart: (productId: string, variantId?: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  saveForLater: (itemId: string) => Promise<void>;
  moveBackToCart: (savedItemId: string) => Promise<void>;
  removeSavedItem: (savedItemId: string) => Promise<void>;
  applyPromoCode: (promoCode: string) => Promise<void>;
  removePromoCode: () => void;
  fetchCart: (promoCode?: string) => Promise<void>;
  fetchSavedItems: () => Promise<void>;
  // Guest cart functions
  addToGuestCart: (product: any, variantId?: string, quantity?: number) => void;
  updateGuestQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  removeGuestItem: (productId: string, variantId?: string) => void;
  clearGuestCart: () => void;
  getGuestCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load guest cart from localStorage
  useEffect(() => {
    const savedGuestCart = localStorage.getItem('guestCart');
    if (savedGuestCart) {
      const guestCart = JSON.parse(savedGuestCart);
      guestCart.forEach((item: CartItem) => {
        dispatch({ type: 'ADD_TO_GUEST_CART', payload: item });
      });
    }
  }, []);

  // Save guest cart to localStorage
  useEffect(() => {
    localStorage.setItem('guestCart', JSON.stringify(state.guestCart));
  }, [state.guestCart]);

  const fetchCart = async (promoCode?: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const params = promoCode ? `?promoCode=${promoCode}` : '';
      const response = await api.get(`/cart${params}`);
      dispatch({ type: 'SET_CART', payload: response.data });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchSavedItems = async () => {
    try {
      const response = await api.get('/cart/saved-items');
      dispatch({ type: 'SET_SAVED_ITEMS', payload: response.data });
    } catch (error) {
      console.error('Failed to fetch saved items:', error);
    }
  };

  const addToCart = async (productId: string, variantId?: string, quantity = 1) => {
    try {
      const response = await api.post('/cart', {
        productId,
        variantId,
        quantity
      });
      dispatch({ type: 'ADD_TO_CART', payload: response.data });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await api.put(`/cart/${itemId}`, { quantity });
      dispatch({ type: 'UPDATE_ITEM', payload: { id: itemId, quantity } });
      await fetchCart();
    } catch (error) {
      console.error('Failed to update quantity:', error);
      throw error;
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await api.delete(`/cart/${itemId}`);
      dispatch({ type: 'REMOVE_ITEM', payload: itemId });
      await fetchCart();
    } catch (error) {
      console.error('Failed to remove item:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  };

  const saveForLater = async (itemId: string) => {
    try {
      await api.post('/cart/save-for-later', { cartItemId: itemId });
      await fetchCart();
      await fetchSavedItems();
    } catch (error) {
      console.error('Failed to save for later:', error);
      throw error;
    }
  };

  const moveBackToCart = async (savedItemId: string) => {
    try {
      await api.post(`/cart/saved-items/${savedItemId}/move-to-cart`);
      await fetchCart();
      await fetchSavedItems();
    } catch (error) {
      console.error('Failed to move back to cart:', error);
      throw error;
    }
  };

  const removeSavedItem = async (savedItemId: string) => {
    try {
      await api.delete(`/cart/saved-items/${savedItemId}`);
      await fetchSavedItems();
    } catch (error) {
      console.error('Failed to remove saved item:', error);
      throw error;
    }
  };

  const applyPromoCode = async (promoCode: string) => {
    try {
      const response = await api.post('/cart/apply-promo', { promoCode });
      dispatch({ type: 'APPLY_PROMO', payload: response.data });
      await fetchCart(promoCode);
    } catch (error: any) {
      dispatch({ type: 'SET_PROMO_ERROR', payload: error.response?.data?.message || 'Invalid promo code' });
      throw error;
    }
  };

  const removePromoCode = () => {
    dispatch({ type: 'REMOVE_PROMO' });
    fetchCart();
  };

  // Guest cart functions
  const addToGuestCart = (product: any, variantId?: string, quantity = 1) => {
    const cartItem: CartItem = {
      id: `guest-${product.id}-${variantId || 'default'}`,
      productId: product.id,
      variantId,
      quantity,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images,
        slug: product.slug
      },
      variant: variantId ? product.variants?.find((v: any) => v.id === variantId) : undefined
    };
    dispatch({ type: 'ADD_TO_GUEST_CART', payload: cartItem });
  };

  const updateGuestQuantity = (productId: string, variantId: string | undefined, quantity: number) => {
    if (quantity === 0) {
      removeGuestItem(productId, variantId);
    } else {
      dispatch({ type: 'UPDATE_GUEST_ITEM', payload: { productId, variantId, quantity } });
    }
  };

  const removeGuestItem = (productId: string, variantId?: string) => {
    dispatch({ type: 'REMOVE_GUEST_ITEM', payload: { productId, variantId } });
  };

  const clearGuestCart = () => {
    dispatch({ type: 'CLEAR_GUEST_CART' });
  };

  const getGuestCartTotal = () => {
    return state.guestCart.reduce((total, item) => {
      const price = item.variant?.price || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const value: CartContextType = {
    state,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    saveForLater,
    moveBackToCart,
    removeSavedItem,
    applyPromoCode,
    removePromoCode,
    fetchCart,
    fetchSavedItems,
    addToGuestCart,
    updateGuestQuantity,
    removeGuestItem,
    clearGuestCart,
    getGuestCartTotal
  };

  return (
    <CartContext.Provider value={value}>
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