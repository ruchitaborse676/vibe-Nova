import { Product, Category, User, CartItem, Order, Coupon, DashboardMetrics } from '../types/index.js';

let authToken: string | null = null;
if (typeof window !== 'undefined') {
  authToken = localStorage.getItem('vn_token');
}

export function setAuthToken(token: string | null) {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('vn_token', token);
    else localStorage.removeItem('vn_token');
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (body: { name: string; email: string; password: string }) =>
    request<{ success: boolean; user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ success: boolean; user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  logout: () =>
    request<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),

  getMe: () =>
    request<{ success: boolean; user: User | null }>('/api/auth/me'),

  updateProfile: (body: { name: string; phone?: string }) =>
    request<{ success: boolean; user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  addAddress: (address: any) =>
    request<{ success: boolean; addresses: any[] }>('/api/auth/addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    }),

  deleteAddress: (id: string) =>
    request<{ success: boolean; addresses: any[] }>(`/api/auth/addresses/${id}`, {
      method: 'DELETE',
    }),

  // Products
  getProducts: (params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    rating?: number;
    sort?: string;
    page?: number;
    limit?: number;
    featured?: boolean;
    isNewArrival?: boolean;
    bestSeller?: boolean;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          query.append(k, String(v));
        }
      });
    }
    const qStr = query.toString();
    return request<{
      success: boolean;
      products: Product[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/api/products${qStr ? `?${qStr}` : ''}`);
  },

  getProduct: (idOrSlug: string) =>
    request<{ success: boolean; product: Product }>(`/api/products/${idOrSlug}`),

  getCategories: () =>
    request<{ success: boolean; categories: Category[] }>('/api/categories'),

  // Cart
  getCart: () =>
    request<{ success: boolean; items: CartItem[] }>('/api/cart'),

  syncCart: (items: any[]) =>
    request<{ success: boolean; items: CartItem[] }>('/api/cart/sync', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),

  addToCart: (body: { productId: string; quantity?: number; variant?: any }) =>
    request<{ success: boolean; items: CartItem[] }>('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateCartItem: (id: string, quantity: number) =>
    request<{ success: boolean; items: CartItem[] }>(`/api/cart/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),

  removeCartItem: (id: string) =>
    request<{ success: boolean; items: CartItem[] }>(`/api/cart/items/${id}`, {
      method: 'DELETE',
    }),

  clearCart: () =>
    request<{ success: boolean; items: [] }>('/api/cart/clear', {
      method: 'DELETE',
    }),

  // Wishlist
  getWishlist: () =>
    request<{ success: boolean; productIds: string[] }>('/api/wishlist'),

  toggleWishlist: (productId: string) =>
    request<{ success: boolean; productIds: string[] }>('/api/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }),

  // Coupons
  validateCoupon: (code: string, subtotal: number) =>
    request<{
      valid: boolean;
      code?: string;
      discount?: number;
      discountType?: string;
      discountValue?: number;
      message?: string;
      description?: string;
    }>('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    }),

  // Orders
  createOrder: (orderData: any) =>
    request<{ success: boolean; order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  getOrders: () =>
    request<{ success: boolean; orders: Order[] }>('/api/orders'),

  getOrder: (id: string) =>
    request<{ success: boolean; order: Order }>(`/api/orders/${id}`),

  cancelOrder: (id: string) =>
    request<{ success: boolean; order: Order }>(`/api/orders/${id}/cancel`, {
      method: 'POST',
    }),

  // Payments
  getPaymentConfig: () =>
    request<{
      success: boolean;
      provider: string;
      isConfigured: boolean;
      keyId: string | null;
      mode: string;
      message: string;
    }>('/api/payments/config'),

  createPaymentOrder: (body: { amount: number; receipt?: string }) =>
    request<{
      success: boolean;
      provider: string;
      orderId: string;
      amount: number;
      currency: string;
      keyId: string;
    }>('/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  verifyPayment: (body: any) =>
    request<{ success: boolean; verified: boolean; transactionId: string }>('/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // Admin
  getAdminDashboard: () =>
    request<{
      success: boolean;
      metrics: DashboardMetrics;
      dbInfo: { engine: string; configured: boolean; connected: boolean; maskedUri: string };
    }>('/api/admin/dashboard'),

  getAdminOrders: () =>
    request<{ success: boolean; orders: Order[] }>('/api/admin/orders'),

  updateAdminOrder: (id: string, status: string, note?: string) =>
    request<{ success: boolean; order: Order }>(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    }),

  createAdminProduct: (data: any) =>
    request<{ success: boolean; product: Product }>('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAdminProduct: (id: string, data: any) =>
    request<{ success: boolean; product: Product }>(`/api/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteAdminProduct: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/admin/products/${id}`, {
      method: 'DELETE',
    }),

  getAdminCustomers: () =>
    request<{ success: boolean; customers: any[] }>('/api/admin/customers'),

  resetAdminSeed: () =>
    request<{ success: boolean; message: string }>('/api/admin/reset-seed', {
      method: 'POST',
    }),

  // Newsletter & Contact
  subscribeNewsletter: (email: string) =>
    request<{ success: boolean; message: string }>('/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  sendContactMessage: (body: { name: string; email: string; subject?: string; message: string }) =>
    request<{ success: boolean; message: string }>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
