export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  userId?: string;
  orderNumber: string;
  subtotal: number;
  shippingCost: number;
  discount?: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: string;
  deliveryLocation: string;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderRequest {
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
  }[];
  shippingAddress: string;
  deliveryLocation: string;
  paymentMethod: string;
  notes?: string;
}

export interface OrderStatusUpdate {
  status: string;
  notes?: string;
}