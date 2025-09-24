// Mock API service for development/demo purposes
const mockCategories = [
  { id: 1, name: 'Kitchen & Dining', slug: 'kitchen-dining', image: '/images/categories/kitchen.jpg' },
  { id: 2, name: 'Home Decor', slug: 'home-decor', image: '/images/categories/decor.jpg' },
  { id: 3, name: 'Cleaning Supplies', slug: 'cleaning', image: '/images/categories/cleaning.jpg' },
  { id: 4, name: 'Storage & Organization', slug: 'storage', image: '/images/categories/storage.jpg' }
]

const mockProducts = [
  { id: 1, name: 'Premium Cookware Set', price: 2500, image: '/images/products/cookware.jpg', category: 'Kitchen & Dining' },
  { id: 2, name: 'Decorative Vase', price: 800, image: '/images/products/vase.jpg', category: 'Home Decor' },
  { id: 3, name: 'All-Purpose Cleaner', price: 350, image: '/images/products/cleaner.jpg', category: 'Cleaning Supplies' }
]

class MockApiClient {
  async getCategories() {
    return Promise.resolve(mockCategories)
  }

  async getProducts() {
    return Promise.resolve(mockProducts)
  }

  async getCategoryHierarchy() {
    return Promise.resolve(mockCategories)
  }

  // Fallback for other methods
  async request(endpoint: string) {
    console.warn(`Mock API: ${endpoint} - returning empty data`)
    return Promise.resolve([])
  }
}

export const mockApi = new MockApiClient()