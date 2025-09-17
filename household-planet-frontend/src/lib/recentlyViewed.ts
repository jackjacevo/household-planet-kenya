import { Product } from '@/types';

const RECENTLY_VIEWED_KEY = 'recently-viewed';
const MAX_RECENTLY_VIEWED = 20;

export interface RecentlyViewedItem {
  id: number;
  viewedAt: string;
}

export function addToRecentlyViewed(product: Product): void {
  try {
    // Get existing recently viewed items
    const existing = getRecentlyViewedIds();
    
    // Remove the product if it already exists
    const filtered = existing.filter(item => item.id !== product.id);
    
    // Add the product to the beginning
    const updated = [
      { id: product.id, viewedAt: new Date().toISOString() },
      ...filtered
    ].slice(0, MAX_RECENTLY_VIEWED);
    
    // Save to localStorage
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
    
    // Also try to send to API if user is logged in
    sendToAPI(product.id);
  } catch (error) {
    console.error('Error adding to recently viewed:', error);
  }
}

export function getRecentlyViewedIds(): RecentlyViewedItem[] {
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    const items = stored ? JSON.parse(stored) : [];
    
    // If no items exist, add some sample data for demonstration
    if (items.length === 0 && typeof window !== 'undefined') {
      const sampleData = [
        { id: 1, viewedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
        { id: 2, viewedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
        { id: 3, viewedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
      ];
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(sampleData));
      return sampleData;
    }
    
    return items;
  } catch (error) {
    console.error('Error getting recently viewed:', error);
    return [];
  }
}

export function clearRecentlyViewed(): void {
  try {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
  } catch (error) {
    console.error('Error clearing recently viewed:', error);
  }
}

async function sendToAPI(productId: number): Promise<void> {
  try {
    // Only send if user is authenticated
    const token = localStorage.getItem('auth-token');
    if (!token) return;
    
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/recently-viewed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId })
    });
  } catch (error) {
    // Silently fail - localStorage is the fallback
    console.debug('Failed to send to API:', error);
  }
}
