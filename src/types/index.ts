export interface ProductVariant {
  id: string;
  name: string;
  sku?: string;
  price?: number; // override if different
  stock: number;
  options: { [key: string]: string }; // e.g. { Color: 'Midnight Blue', Size: 'M' }
}

export interface Product {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  categoryId: string;
  categoryName?: string;
  sku: string;
  stock: number;
  variants?: ProductVariant[];
  rating: number;
  reviewCount: number;
  featured?: boolean;
  isNewArrival?: boolean;
  bestSeller?: boolean;
  tags?: string[];
  specifications?: { [key: string]: string };
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount?: number;
  active: boolean;
}

export interface Address {
  _id?: string;
  id?: string;
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  addresses: Address[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string; // unique item line id
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: {
    id: string;
    name: string;
    options: { [key: string]: string };
  };
  maxStock: number;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  expiryDate?: string;
  active: boolean;
  description?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'razorpay' | 'cod' | 'demo_card';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: {
    id: string;
    name: string;
    options: { [key: string]: string };
  };
  lineTotal: number;
}

export interface Order {
  _id: string;
  id?: string;
  orderNumber: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  items: OrderItem[];
  shippingAddress: Address;
  subtotal: number;
  shippingCharges: number;
  discount: number;
  couponCode?: string;
  finalTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDetails?: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    transactionId?: string;
  };
  orderStatus: OrderStatus;
  statusHistory?: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  totalProducts: number;
  totalRevenue: number;
  recentOrders: Order[];
  lowStockProducts: Product[];
  salesByCategory: { category: string; count: number; revenue: number }[];
}
