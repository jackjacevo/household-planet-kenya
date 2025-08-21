export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  phoneVerified: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'CUSTOMER' | 'GUEST';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  children?: Category[];
  parent?: Category;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  sku: string;
  price: number;
  comparePrice?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images: string[];
  images360?: string[];
  videos?: string[];
  categoryId: string;
  brandId?: string;
  isActive: boolean;
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  tags: string[];
  features?: string[];
  specifications?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  category: Category;
  variants?: ProductVariant[];
  reviews?: Review[];
  averageRating?: number;
  reviewCount?: number;
  stock?: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  size?: string;
  color?: string;
  material?: string;
  attributes?: Record<string, any>;
  images?: string[];
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  comment?: string;
  photos?: string[];
  helpfulVotes: number;
  unhelpfulVotes: number;
  isVerified: boolean;
  createdAt: string;
  user: User;
}

export interface CartItem {
  id: string;
  userId?: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product: Product;
  variant?: ProductVariant;
}

export interface Address {
  id: string;
  userId: string;
  type: 'SHIPPING' | 'BILLING';
  fullName: string;
  phone: string;
  county: string;
  town: string;
  street: string;
  isDefault: boolean;
}

export interface DeliveryLocation {
  id: string;
  name: string;
  county: string;
  price: number;
  tier: number;
  estimatedDays: number;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: Address;
  deliveryLocation: DeliveryLocation;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  total: number;
  product: Product;
  variant?: ProductVariant;
}

export type OrderStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type PaymentMethod = 
  | 'MPESA'
  | 'CARD'
  | 'CASH_ON_DELIVERY'
  | 'BANK_TRANSFER';

export type PaymentStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIAL';

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  brand?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'popular' | 'rating';
  page?: number;
  limit?: number;
}

export interface NewsletterSignup {
  email: string;
  name?: string;
}

export interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// Dashboard Types
export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: 'ORDER' | 'PRODUCT' | 'PAYMENT' | 'DELIVERY' | 'ACCOUNT' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  description: string;
  orderId?: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  message: string;
  isFromCustomer: boolean;
  createdAt: string;
  attachments?: string[];
}

export interface ReturnRequest {
  id: string;
  returnNumber: string;
  orderId: string;
  orderNumber: string;
  type: 'RETURN' | 'EXCHANGE';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'COMPLETED';
  reason: string;
  items: ReturnItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ReturnItem {
  orderItemId: string;
  productName: string;
  quantity: number;
  reason: string;
}

export interface LoyaltyProgram {
  currentPoints: number;
  totalEarned: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  nextTierPoints: number;
  pointsToNextTier: number;
}

export interface PointsTransaction {
  id: string;
  type: 'EARNED' | 'REDEEMED';
  points: number;
  description: string;
  date: string;
  orderId?: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: 'DISCOUNT' | 'FREE_SHIPPING' | 'PRODUCT' | 'EXPERIENCE';
  isAvailable: boolean;
  expiryDate?: string;
}

export interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
  sms: boolean;
  push: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  showPurchaseHistory: boolean;
  allowDataCollection: boolean;
  allowPersonalization: boolean;
}
