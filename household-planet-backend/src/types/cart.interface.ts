export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images?: string[];
    stock: number;
  };
  variant?: {
    id: string;
    name: string;
    price: number;
    stock: number;
  };
  createdAt: Date;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
  promo?: PromoCodeResult;
  finalTotal?: number;
}

export interface PromoCodeResult {
  promoCode: string;
  discountType: string;
  discountValue: number;
  discount: number;
  originalTotal: number;
  finalTotal: number;
  savings: number;
}

export interface AddToCartRequest {
  productId: string;
  variantId?: string;
  quantity: number;
}