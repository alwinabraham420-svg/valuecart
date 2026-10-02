'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, ToastMessage } from '@/types';
import { PRODUCTS } from '@/data/products';

interface StoreContextType {
  cart: CartItem[];
  wishlist: string[];
  isCartOpen: boolean;
  quickViewProduct: Product | null;
  toasts: ToastMessage[];
  searchQuery: string;
  cartCount: number;
  cartSubtotal: number;
  cartOriginalTotal: number;
  cartSavings: number;
  cartShipping: number;
  cartGrandTotal: number;
  shippingFeeConfig: number;
  setShippingFeeConfig: (fee: number) => void;
  addToCart: (product: Product, quantity?: number, selectedSize?: string, selectedColor?: string) => void;
  buyNow: (product: Product, quantity?: number, selectedSize?: string, selectedColor?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  openCart: () => void;
  closeCart: () => void;
  setQuickViewProduct: (product: Product | null) => void;
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  setSearchQuery: (query: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Production: Empty cart and wishlist by default, persistent across refresh via localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('valuecart_cart_v2');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('valuecart_wishlist_v2');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('valuecart_cart_v2', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // Persist wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('valuecart_wishlist_v2', JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  // Cart calculations
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartOriginalTotal = cart.reduce((acc, item) => acc + item.product.originalPrice * item.quantity, 0);
  const cartSavings = Math.max(0, cartOriginalTotal - cartSubtotal);
  // Configurable shipping policy: Free delivery by default (no invented fees)
  const [shippingFeeConfig, setShippingFeeConfig] = useState<number>(0);
  const cartShipping = shippingFeeConfig;
  const cartGrandTotal = cartSubtotal + cartShipping;

  const addToast = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auto-sanitize cart on mount: remove any items that are currently out of stock
  useEffect(() => {
    setCart((prev) => {
      const sanitized = prev.filter((item) => {
        const catalogProd = PRODUCTS.find((p) => p.id === item.product.id || p.slug === item.product.slug);
        const inStock = catalogProd
          ? (catalogProd.isAvailable !== false && (catalogProd.stock ?? 0) > 0)
          : (item.product.isAvailable !== false && (item.product.stock ?? 0) > 0);
        return inStock;
      });
      return sanitized;
    });
  }, []);

  const addToCart = (product: Product, quantity = 1, selectedSize?: string, selectedColor?: string) => {
    const cleanQty = Math.max(1, Math.min(10, Math.floor(quantity)));
    // Verify product is in stock and available
    const inStock = product.isAvailable !== false && (typeof product.stock === 'number' ? product.stock > 0 : true);
    if (!inStock) {
      addToast('Product Unavailable', 'Sorry, this product is currently out of stock.', 'warning');
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(10, updated[existingIndex].quantity + cleanQty),
          selectedSize: selectedSize || updated[existingIndex].selectedSize,
          selectedColor: selectedColor || updated[existingIndex].selectedColor,
        };
        return updated;
      }
      return [...prev, { product, quantity: cleanQty, selectedSize, selectedColor }];
    });
    addToast('Added to Cart', `${product.shortName || product.name} (Qty: ${cleanQty}) added to cart.`);
  };

  const buyNow = (product: Product, quantity = 1, selectedSize?: string, selectedColor?: string) => {
    const cleanQty = Math.max(1, Math.min(10, Math.floor(quantity)));
    const inStock = product.isAvailable !== false && (typeof product.stock === 'number' ? product.stock > 0 : true);
    if (!inStock) {
      addToast('Product Unavailable', 'Sorry, this product is currently out of stock.', 'warning');
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        // Set exact quantity requested for Buy Now, never accumulate
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: cleanQty,
          selectedSize: selectedSize || updated[existingIndex].selectedSize,
          selectedColor: selectedColor || updated[existingIndex].selectedColor,
        };
        return updated;
      }
      return [...prev, { product, quantity: cleanQty, selectedSize, selectedColor }];
    });
  };

  const removeFromCart = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
    if (item) {
      addToast('Removed', `${item.product.shortName || item.product.name} removed from your cart.`, 'info');
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    // Minimum quantity is 1. Never allow 0 or negative through minus button!
    const cleanQty = Math.max(1, Math.min(10, Math.floor(quantity)));
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: cleanQty } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    const product = PRODUCTS.find((p) => p.id === productId);
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        addToast('Removed from Wishlist', `${product?.name || 'Item'} removed.`, 'info');
        return prev.filter((id) => id !== productId);
      } else {
        addToast('Saved to Wishlist', `${product?.name || 'Item'} added to wishlist!`, 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        isCartOpen,
        quickViewProduct,
        toasts,
        searchQuery,
        cartCount,
        cartSubtotal,
        cartOriginalTotal,
        cartSavings,
        cartShipping,
        cartGrandTotal,
        shippingFeeConfig,
        setShippingFeeConfig,
        addToCart,
        buyNow,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        openCart,
        closeCart,
        setQuickViewProduct,
        addToast,
        removeToast,
        setSearchQuery,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
