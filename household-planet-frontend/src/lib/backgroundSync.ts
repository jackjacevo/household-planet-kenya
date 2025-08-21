'use client';

export interface SyncData {
  id: string;
  type: 'cart' | 'order' | 'wishlist' | 'review';
  data: any;
  timestamp: number;
}

export class BackgroundSyncManager {
  private static SYNC_STORE = 'sync-store';

  static async scheduleSync(data: SyncData): Promise<void> {
    if (!('serviceWorker' in navigator)) return;

    try {
      // Store data for sync
      await this.storeForSync(data);

      // Register background sync
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('background-sync');
    } catch (error) {
      console.error('Background sync registration failed:', error);
      // Fallback: try immediate sync
      await this.performSync();
    }
  }

  static async storeForSync(data: SyncData): Promise<void> {
    const stored = this.getStoredSyncData();
    stored.push(data);
    localStorage.setItem(this.SYNC_STORE, JSON.stringify(stored));
  }

  static getStoredSyncData(): SyncData[] {
    const stored = localStorage.getItem(this.SYNC_STORE);
    return stored ? JSON.parse(stored) : [];
  }

  static async performSync(): Promise<void> {
    const syncData = this.getStoredSyncData();
    const successful: string[] = [];

    for (const item of syncData) {
      try {
        await this.syncItem(item);
        successful.push(item.id);
      } catch (error) {
        console.error(`Sync failed for item ${item.id}:`, error);
      }
    }

    // Remove successful items
    const remaining = syncData.filter(item => !successful.includes(item.id));
    localStorage.setItem(this.SYNC_STORE, JSON.stringify(remaining));
  }

  private static async syncItem(item: SyncData): Promise<void> {
    const endpoints = {
      cart: '/api/cart/sync',
      order: '/api/orders/sync',
      wishlist: '/api/wishlist/sync',
      review: '/api/reviews/sync'
    };

    const endpoint = endpoints[item.type];
    if (!endpoint) throw new Error(`Unknown sync type: ${item.type}`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(item.data)
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }
  }

  // Specific sync methods
  static async syncCartUpdate(cartData: any): Promise<void> {
    await this.scheduleSync({
      id: `cart-${Date.now()}`,
      type: 'cart',
      data: cartData,
      timestamp: Date.now()
    });
  }

  static async syncOrderPlacement(orderData: any): Promise<void> {
    await this.scheduleSync({
      id: `order-${Date.now()}`,
      type: 'order',
      data: orderData,
      timestamp: Date.now()
    });
  }

  static async syncWishlistUpdate(wishlistData: any): Promise<void> {
    await this.scheduleSync({
      id: `wishlist-${Date.now()}`,
      type: 'wishlist',
      data: wishlistData,
      timestamp: Date.now()
    });
  }

  static async syncReviewSubmission(reviewData: any): Promise<void> {
    await this.scheduleSync({
      id: `review-${Date.now()}`,
      type: 'review',
      data: reviewData,
      timestamp: Date.now()
    });
  }
}