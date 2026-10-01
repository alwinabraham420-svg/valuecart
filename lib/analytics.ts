// Analytics and Conversion Tracking Readiness (Meta Pixel, Conversions API, GA4)

import { Product, Order, CartItem } from '@/types';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const trackEvent = (eventName: string, params: Record<string, unknown> = {}) => {
  if (typeof window === 'undefined') return;

  // Log in development for auditability
  if (process.env.NODE_ENV !== 'production') {
    // console.log(`[ValueCart Analytics Event] ${eventName}:`, params);
  }

  // Meta Pixel (fbq)
  if (typeof window.fbq === 'function') {
    try {
      window.fbq('track', eventName, params);
    } catch {
      // safe fallback
    }
  }

  // Google Analytics 4 (gtag)
  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, params);
    } catch {
      // safe fallback
    }
  }
};

export const trackViewContent = (product: Product) => {
  trackEvent('ViewContent', {
    content_name: product.name,
    content_category: product.category,
    content_ids: [product.id],
    content_type: 'product',
    value: product.price,
    currency: 'INR',
  });
};

export const trackAddToCart = (product: Product, quantity = 1) => {
  trackEvent('AddToCart', {
    content_name: product.name,
    content_category: product.category,
    content_ids: [product.id],
    content_type: 'product',
    value: product.price * quantity,
    currency: 'INR',
    num_items: quantity,
  });
};

export const trackInitiateCheckout = (items: CartItem[], total: number) => {
  trackEvent('InitiateCheckout', {
    content_ids: items.map((i) => i.product.id),
    content_type: 'product',
    num_items: items.reduce((acc, i) => acc + i.quantity, 0),
    value: total,
    currency: 'INR',
  });
};

export const trackPurchase = (order: Order) => {
  trackEvent('Purchase', {
    content_ids: order.items.map((i) => i.productId),
    content_type: 'product',
    value: order.financials.sellingPrice,
    currency: 'INR',
    num_items: order.items.reduce((acc, i) => acc + i.quantity, 0),
    order_id: order.orderNumber,
    payment_method: order.payment.method,
  });
};
