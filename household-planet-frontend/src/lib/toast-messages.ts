export const toastMessages = {
  cart: {
    added: (productName: string, quantity: number = 1) => ({
      variant: 'cart' as const,
      title: 'Added to Cart! 🛒',
      description: `${quantity > 1 ? `${quantity}x ` : ''}${productName} • Ready for checkout`,
    }),
    alreadyExists: (productName: string) => ({
      variant: 'info' as const,
      title: 'Already in Cart 📦',
      description: `${productName} • Check your cart`,
    }),
    removed: (productName: string) => ({
      variant: 'destructive' as const,
      title: 'Removed from Cart 🗑️',
      description: `${productName} • Item removed`,
    }),
    updated: (productName: string, quantity: number) => ({
      variant: 'info' as const,
      title: 'Cart Updated 📝',
      description: `${productName} • Quantity: ${quantity}`,
    }),
  },
  wishlist: {
    added: (productName: string) => ({
      variant: 'wishlist' as const,
      title: 'Added to Wishlist! ❤️',
      description: `${productName} • Saved for later`,
    }),
    alreadyExists: (productName: string) => ({
      variant: 'info' as const,
      title: 'Already in Wishlist 💖',
      description: `${productName} • Already saved`,
    }),
    removed: (productName: string) => ({
      variant: 'wishlist' as const,
      title: 'Removed from Wishlist 💔',
      description: `${productName} • No longer saved`,
    }),
  },
  order: {
    placed: (orderId: string) => ({
      variant: 'success' as const,
      title: 'Order Placed! 🎉',
      description: `Order #${orderId} • We'll process it soon`,
    }),
    cancelled: (orderId: string) => ({
      variant: 'destructive' as const,
      title: 'Order Cancelled ❌',
      description: `Order #${orderId} • Successfully cancelled`,
    }),
  },
  auth: {
    loginSuccess: () => ({
      variant: 'success' as const,
      title: 'Welcome Back! 👋',
      description: 'Successfully logged in',
    }),
    logoutSuccess: () => ({
      variant: 'info' as const,
      title: 'Logged Out 👋',
      description: 'See you next time!',
    }),
    registerSuccess: () => ({
      variant: 'success' as const,
      title: 'Account Created! 🎉',
      description: 'Welcome to Household Planet Kenya',
    }),
  },
  error: {
    generic: (message?: string) => ({
      variant: 'destructive' as const,
      title: 'Something went wrong ⚠️',
      description: message || 'Please try again later',
    }),
    network: () => ({
      variant: 'destructive' as const,
      title: 'Connection Error 📡',
      description: 'Please check your internet connection',
    }),
    outOfStock: (availableStock: number) => ({
      variant: 'destructive' as const,
      title: 'Insufficient Stock ⚠️',
      description: `Only ${availableStock} items available`,
    }),
  },
  success: {
    saved: (itemName?: string) => ({
      variant: 'success' as const,
      title: 'Saved Successfully! ✅',
      description: itemName ? `${itemName} has been saved` : 'Changes saved',
    }),
    updated: (itemName?: string) => ({
      variant: 'success' as const,
      title: 'Updated Successfully! ✅',
      description: itemName ? `${itemName} has been updated` : 'Changes updated',
    }),
  },
};
