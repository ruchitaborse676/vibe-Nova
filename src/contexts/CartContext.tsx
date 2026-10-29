import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.js';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  discount: number;
  finalTotal: number;
  appliedCoupon: { code: string; discount: number; description?: string } | null;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, variant?: any) => Promise<{ success: boolean; error?: string }>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vn_guest_cart');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; description?: string } | null>(null);

  // Sync cart when user signs in or out
  useEffect(() => {
    if (user) {
      // Sync guest items to server
      const guestItems = [...items];
      api.syncCart(guestItems)
        .then(res => {
          if (res.success) {
            setItems(res.items);
            localStorage.removeItem('vn_guest_cart');
          }
        })
        .catch(() => {
          // Fallback fetch
          api.getCart().then(r => r.success && setItems(r.items));
        });
    } else {
      // Guest mode
      try {
        const saved = localStorage.getItem('vn_guest_cart');
        if (saved) setItems(JSON.parse(saved));
      } catch {}
    }
  }, [user]);

  // Save guest cart
  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      localStorage.setItem('vn_guest_cart', JSON.stringify(items));
    }
  }, [items, user]);

  const addToCart = async (product: Product, quantity = 1, variant?: any) => {
    try {
      if (product.stock < quantity) {
        return { success: false, error: `Only ${product.stock} left in stock.` };
      }

      if (user) {
        const res = await api.addToCart({
          productId: product._id || product.id || '',
          quantity,
          variant,
        });
        if (res.success) {
          setItems(res.items);
          setIsCartOpen(true);
          return { success: true };
        }
        return { success: false, error: 'Could not add to cart' };
      } else {
        // Guest cart
        setItems(prev => {
          const key = `${product._id || product.id}_${variant?.id || 'base'}`;
          const existingIdx = prev.findIndex(it => `${it.productId}_${it.variant?.id || 'base'}` === key);

          if (existingIdx !== -1) {
            const next = [...prev];
            const nextQty = next[existingIdx].quantity + quantity;
            next[existingIdx] = {
              ...next[existingIdx],
              quantity: Math.min(nextQty, product.stock),
            };
            return next;
          } else {
            const newItem: CartItem = {
              id: `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              productId: product._id || product.id || '',
              name: product.name,
              price: product.price,
              image: product.images[0],
              quantity,
              variant,
              maxStock: product.stock,
            };
            return [...prev, newItem];
          }
        });
        setIsCartOpen(true);
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Error adding to cart' };
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    if (user) {
      try {
        const res = await api.updateCartItem(itemId, quantity);
        if (res.success) setItems(res.items);
      } catch (err: any) {
        console.error(err);
      }
    } else {
      setItems(prev =>
        prev.map(it => (it.id === itemId ? { ...it, quantity: Math.min(quantity, it.maxStock || 99) } : it))
      );
    }
  };

  const removeItem = async (itemId: string) => {
    if (user) {
      try {
        const res = await api.removeCartItem(itemId);
        if (res.success) setItems(res.items);
      } catch (err: any) {
        console.error(err);
      }
    } else {
      setItems(prev => prev.filter(it => it.id !== itemId));
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        await api.clearCart();
      } catch {}
    }
    setItems([]);
    setAppliedCoupon(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vn_guest_cart');
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Recalculate applied coupon if subtotal changes
  const discount = appliedCoupon ? Math.min(appliedCoupon.discount, subtotal) : 0;
  // Free shipping on orders over ₹999, else ₹99 (or 0 if cart is empty)
  const shipping = items.length === 0 ? 0 : subtotal >= 999 ? 0 : 99;
  const finalTotal = Math.max(0, subtotal - discount + shipping);

  const applyCoupon = async (code: string) => {
    try {
      const res = await api.validateCoupon(code, subtotal);
      if (res.valid && res.code && res.discount !== undefined) {
        setAppliedCoupon({
          code: res.code,
          discount: res.discount,
          description: res.description,
        });
        return { success: true, message: `Applied ${res.code} successfully! Saved ₹${res.discount}.` };
      }
      return { success: false, message: res.message || 'Invalid coupon code.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Coupon verification failed.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        shipping,
        discount,
        finalTotal,
        appliedCoupon,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
