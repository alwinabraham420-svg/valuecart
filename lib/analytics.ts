// Analytics and Conversion Tracking Readiness (Meta Pixel & GA4 Standard Ecommerce)

import { Product, Order, CartItem } from '@/types';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

// Meta Pixel tracking
export const trackMetaEvent = (eventName: string, params: Record<string, unknown> = {}) => {
  if (typeof window === 'undefined') return;
  if (typeof window.fbq === 'function') {
    try {
      window.fbq('track', eventName, params);
    } catch {
      // safe fallback
    }
  }
};

// GA4 tracking with standard ecommerce nomenclature
export const trackGA4Event = (eventName: string, params: Record<string, unknown> = {}) => {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, params);
    } catch {
      // safe fallback
    }
  }
};

export const trackEvent = (eventName: string, params: Record<string, unknown> = {}) => {
  trackMetaEvent(eventName, params);
  trackGA4Event(eventName, params);
};

export const trackViewContent = (product: Product) => {
  // Meta Pixel standard event
  trackMetaEvent('ViewContent', {
    content_name: product.name,
    content_category: product.category,
    content_ids: [product.id],
    content_type: 'product',
    value: product.price,
    currency: 'INR',
  });

  // GA4 standard event: view_item
  trackGA4Event('view_item', {
    currency: 'INR',
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        quantity: 1,
      },
    ],
  });
};

export const trackAddToCart = (product: Product, quantity = 1) => {
  // Meta Pixel standard event
  trackMetaEvent('AddToCart', {
    content_name: product.name,
    content_category: product.category,
    content_ids: [product.id],
    content_type: 'product',
    value: product.price * quantity,
    currency: 'INR',
    num_items: quantity,
  });

  // GA4 standard event: add_to_cart
  trackGA4Event('add_to_cart', {
    currency: 'INR',
    value: product.price * quantity,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        quantity,
      },
    ],
  });
};

export const trackInitiateCheckout = (items: CartItem[], total: number) => {
  // Meta Pixel standard event
  trackMetaEvent('InitiateCheckout', {
    content_ids: items.map((i) => i.product.id),
    content_type: 'product',
    num_items: items.reduce((acc, i) => acc + i.quantity, 0),
    value: total,
    currency: 'INR',
  });

  // GA4 standard event: begin_checkout
  trackGA4Event('begin_checkout', {
    currency: 'INR',
    value: total,
    items: items.map((i) => ({
      item_id: i.product.id,
      item_name: i.product.name,
      item_category: i.product.category,
      price: i.product.price,
      quantity: i.quantity,
    })),
  });
};

export const trackAddPaymentInfo = (paymentType: string, total: number) => {
  // Meta Pixel
  trackMetaEvent('AddPaymentInfo', {
    currency: 'INR',
    value: total,
  });

  // GA4 standard event: add_payment_info
  trackGA4Event('add_payment_info', {
    currency: 'INR',
    value: total,
    payment_type: paymentType,
  });
};

export const trackPurchase = (order: Order) => {
  const totalValue = order.financials.sellingPrice;
  const items = order.items.map((i) => ({
    item_id: i.productId,
    item_name: i.productName,
    price: i.unitPrice,
    quantity: i.quantity,
  }));

  // Meta Pixel standard event
  trackMetaEvent('Purchase', {
    content_ids: order.items.map((i) => i.productId),
    content_type: 'product',
    value: totalValue,
    currency: 'INR',
    num_items: order.items.reduce((acc, i) => acc + i.quantity, 0),
    order_id: order.orderNumber,
    payment_method: order.payment.method,
  });

  // GA4 standard event: purchase
  trackGA4Event('purchase', {
    transaction_id: order.orderNumber,
    value: totalValue,
    currency: 'INR',
    payment_type: order.payment.method,
    items,
  });
};
