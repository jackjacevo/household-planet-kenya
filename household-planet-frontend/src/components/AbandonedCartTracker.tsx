'use client';

import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function AbandonedCartTracker() {
  const { user } = useAuth();
  const { cart } = useCart();

  useEffect(() => {
    // Track abandoned cart when cart changes
    if (cart && cart.items && cart.items.length > 0) {
      const trackingData = {
        userId: user?.id,
        sessionId: !user ? getSessionId() : undefined,
        phoneNumber: user?.phone,
        cartItems: cart.items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.variant?.price || item.product.price,
          name: item.product.name
        }))
      };

      // Debounce the tracking to avoid too many requests
      const timeoutId = setTimeout(() => {
        trackAbandonedCart(trackingData);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [cart, user]);

  useEffect(() => {
    // Mark cart as recovered when user completes checkout
    const handleBeforeUnload = () => {
      if (cart && cart.items && cart.items.length === 0) {
        markCartAsRecovered();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [cart, user]);

  const getSessionId = () => {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  };

  const trackAbandonedCart = async (data: any) => {
    try {
      await fetch('/api/whatsapp/abandoned-cart/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to track abandoned cart:', error);
    }
  };

  const markCartAsRecovered = async () => {
    try {
      await fetch('/api/whatsapp/abandoned-cart/recovered', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          sessionId: !user ? getSessionId() : undefined,
          phoneNumber: user?.phone,
        }),
      });
    } catch (error) {
      console.error('Failed to mark cart as recovered:', error);
    }
  };

  // This component doesn't render anything visible
  return null;
}