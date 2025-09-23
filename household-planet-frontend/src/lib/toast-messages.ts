export const toastMessages = {
  cart: {
    added: (productName: string, quantity: number = 1) => ({
      type: 'success' as const,
      message: `Added to Cart! 🛒 ${quantity > 1 ? `${quantity}x ` : ''}${productName} • Ready for checkout`,
    }),
    alreadyExists: (productName: string) => ({
      type: 'info' as const,
      message: `Already in Cart 📦 ${productName} • Check your cart`,
    }),
    removed: (productName: string) => ({
      type: 'warning' as const,
      message: `Removed from Cart 🗑️ ${productName} • Item removed`,
    }),
    updated: (productName: string, quantity: number) => ({
      type: 'info' as const,
      message: `Cart Updated 📝 ${productName} • Quantity: ${quantity}`,
    }),
  },
  wishlist: {
    added: (productName: string) => ({
      type: 'success' as const,
      message: `Added to Wishlist! ❤️ ${productName} • Saved for later`,
    }),
    alreadyExists: (productName: string) => ({
      type: 'info' as const,
      message: `Already in Wishlist 💖 ${productName} • Already saved`,
    }),
    removed: (productName: string) => ({
      type: 'warning' as const,
      message: `Removed from Wishlist 💔 ${productName} • No longer saved`,
    }),
  },
  order: {
    placed: (orderId: string) => ({
      type: 'success' as const,
      message: `Order Placed! 🎉 Order #${orderId} • We'll process it soon`,
    }),
    cancelled: (orderId: string) => ({
      type: 'error' as const,
      message: `Order Cancelled ❌ Order #${orderId} • Successfully cancelled`,
    }),
  },
  auth: {
    loginSuccess: () => ({
      type: 'success' as const,
      message: 'Welcome Back! 👋 Successfully logged in',
    }),
    logoutSuccess: () => ({
      type: 'info' as const,
      message: 'Logged Out 👋 See you next time!',
    }),
    registerSuccess: () => ({
      type: 'success' as const,
      message: 'Account Created! 🎉 Welcome to Household Planet Kenya',
    }),
  },
  error: {
    generic: (message?: string) => ({
      type: 'error' as const,
      message: `Something went wrong ⚠️ ${message || 'Please try again later'}`,
    }),
    network: () => ({
      type: 'error' as const,
      message: 'Connection Error 📡 Please check your internet connection',
    }),
    outOfStock: (availableStock: number) => ({
      type: 'error' as const,
      message: `Insufficient Stock ⚠️ Only ${availableStock} items available`,
    }),
  },
  success: {
    saved: (itemName?: string) => ({
      type: 'success' as const,
      message: `Saved Successfully! ✅ ${itemName ? `${itemName} has been saved` : 'Changes saved'}`,
    }),
    updated: (itemName?: string) => ({
      type: 'success' as const,
      message: `Updated Successfully! ✅ ${itemName ? `${itemName} has been updated` : 'Changes updated'}`,
    }),
  },
};
