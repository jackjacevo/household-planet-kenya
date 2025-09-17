const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    const token = localStorage.getItem('token')
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errorData.message || `API Error: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }



  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: any) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getUserProfile() {
    return this.request('/api/auth/profile')
  }

  // Products endpoints
  async getProducts(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : ''
    return this.request(`/api/products${query}`)
  }

  async getProduct(id: string) {
    return this.request(`/api/products/${id}`)
  }

  async getProductBySlug(slug: string) {
    return this.request(`/api/products/slug/${slug}`)
  }

  // Categories endpoints
  async getCategories() {
    return this.request('/api/categories')
  }

  async getCategoryHierarchy() {
    return this.request('/api/categories/hierarchy')
  }

  // Cart endpoints
  async getCart() {
    return this.request('/api/cart')
  }

  async addToCart(productId: number, quantity: number, variantId?: number) {
    return this.request('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, variantId }),
    })
  }

  // Orders endpoints
  async createOrder(orderData: any) {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  }

  async getOrders() {
    return this.request('/api/orders')
  }

  // Delivery endpoints
  async getDeliveryLocations() {
    return this.request('/api/delivery/locations')
  }

  async getDeliveryPrice(location: string) {
    return this.request(`/api/delivery/price?location=${encodeURIComponent(location)}`)
  }

  async getDeliveryEstimate(location: string) {
    return this.request(`/api/delivery/estimate?location=${encodeURIComponent(location)}`)
  }

  async getLocationsByTier(tier: number) {
    return this.request(`/api/delivery/locations/tier?tier=${tier}`)
  }

  async trackDelivery(trackingNumber: string) {
    return this.request(`/api/delivery/track/${trackingNumber}`)
  }

  // Advanced product features
  async searchProducts(query: string, limit = 10) {
    return this.request(`/api/products/search/autocomplete?q=${encodeURIComponent(query)}&limit=${limit}`)
  }

  async getProductRecommendations(productId: string, type = 'RELATED', limit = 6) {
    return this.request(`/api/products/${productId}/recommendations?type=${type}&limit=${limit}`)
  }

  async getRecentlyViewed(limit = 10) {
    return this.request(`/api/products/user/recently-viewed?limit=${limit}`)
  }

  async getLowStockAlerts() {
    return this.request('/api/products/inventory/low-stock')
  }

  async generateRecommendations() {
    return this.request('/api/products/admin/generate-recommendations', { method: 'POST' })
  }

  async importProductsCsv(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    
    return fetch(`${this.baseURL}/api/products/import/csv`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }).then(res => res.json())
  }

  async exportProductsCsv() {
    const token = localStorage.getItem('token')
    return fetch(`${this.baseURL}/api/products/export/csv`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  // Reviews endpoints
  async createReview(formData: FormData) {
    const token = localStorage.getItem('token')
    return fetch(`${this.baseURL}/api/reviews`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(res => res.json())
  }

  async getProductReviews(productId: number, page = 1, limit = 10) {
    return this.request(`/api/reviews/product/${productId}?page=${page}&limit=${limit}`)
  }

  async getReviewStats(productId: number) {
    return this.request(`/api/reviews/product/${productId}/stats`)
  }

  async updateReview(reviewId: number, data: any) {
    return this.request(`/api/reviews/${reviewId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteReview(reviewId: number) {
    return this.request(`/api/reviews/${reviewId}`, {
      method: 'DELETE',
    })
  }

  // Generic methods for providers
  async get<T>(endpoint: string): Promise<{ data: T }> {
    const result = await this.request<T>(endpoint)
    return { data: result }
  }

  async post<T>(endpoint: string, data?: any): Promise<{ data: T }> {
    const result = await this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
    return { data: result }
  }

  async put<T>(endpoint: string, data?: any): Promise<{ data: T }> {
    const result = await this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
    return { data: result }
  }

  async delete<T>(endpoint: string): Promise<{ data: T }> {
    const result = await this.request<T>(endpoint, {
      method: 'DELETE',
    })
    return { data: result }
  }

  async patch<T>(endpoint: string, data?: any): Promise<{ data: T }> {
    const result = await this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
    return { data: result }
  }
}

// API endpoints for providers
export const apiEndpoints = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
  },
  user: {
    profile: '/api/user/profile',
  },
  cart: {
    get: '/api/cart',
    add: '/api/cart',
    update: '/api/cart',
    remove: '/api/cart',
  },
}

export const api = new ApiClient(API_BASE_URL)
