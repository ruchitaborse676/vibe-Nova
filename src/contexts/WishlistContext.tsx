import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.js';

interface WishlistContextType {
  wishlistIds: string[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vn_wishlist');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    if (user) {
      api.getWishlist()
        .then(res => {
          if (res.success && res.productIds) {
            setWishlistIds(res.productIds);
          }
        })
        .catch(() => {});
    } else {
      try {
        const saved = localStorage.getItem('vn_wishlist');
        if (saved) setWishlistIds(JSON.parse(saved));
      } catch {}
    }
  }, [user]);

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  const toggleWishlist = async (productId: string) => {
    if (user) {
      try {
        const res = await api.toggleWishlist(productId);
        if (res.success) {
          setWishlistIds(res.productIds);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setWishlistIds(prev => {
        const next = prev.includes(productId)
          ? prev.filter(id => id !== productId)
          : [...prev, productId];
        if (typeof window !== 'undefined') {
          localStorage.setItem('vn_wishlist', JSON.stringify(next));
        }
        return next;
      });
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistCount: wishlistIds.length,
        isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
