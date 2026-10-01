export interface MarketingAttribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  landingPage?: string;
  referrer?: string;
  timestamp?: string;
}

export interface ProductEconomics {
  supplierCost: number; // e.g. ₹190 (Meesho / supplier wholesale cost)
  supplierName?: string; // e.g. "Meesho Supplier"
  supplierUrl?: string; // Direct supplier/Meesho link for manual order
  supplierProductId?: string;
  supplierNotes?: string;
  targetCac: number; // Target customer acquisition cost via Meta Ads (e.g. ₹150)
  advertisingCost: number; // Current allocated ad spend per unit
  estimatedGatewayFee: number; // Estimated Razorpay / payment gateway fee (e.g. 2% + GST)
  otherCost: number; // Packaging, RTO reserve, operational buffer (e.g. ₹20)
  maxAcceptableCac: number; // Max CAC before order is unprofitable
  estimatedProfit: number; // Selling Price - Supplier Cost - Gateway Fee - Ad Cost - Other
  isCodAvailable?: boolean;
  isActive?: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number; // Selling Price to Customer
  originalPrice: number;
  discount: number; // percentage
  rating: number;
  reviewCount: number;
  image: string;
  images: string[];
  description: string;
  stock: number;
  featured?: boolean;
  bestSeller?: boolean;
  deal?: boolean;
  badge?: string;
  shortName?: string;
  material?: string;
  dimensions?: string;
  sizeLabel?: string;
  features?: string[];
  useCases?: { title: string; subtitle?: string; image?: string }[];
  isAvailable?: boolean;
  isCodAvailable?: boolean;
  isOnlinePaymentAvailable?: boolean;
  specs?: Record<string, string>;
  variants?: {
    sizes?: string[];
    colors?: { name: string; hex: string }[];
  };
  // Admin-Only supplier & unit economics (never shown to customer)
  economics?: ProductEconomics;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  image: string;
  itemCount?: number;
  featured?: boolean;
  bgGradient?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
}

export interface ShippingAddress {
  fullName: string;
  mobile: string;
  email: string;
  houseFlat: string;
  streetArea: string;
  landmark?: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

export type OrderStatus =
  | 'new'
  | 'payment_confirmed'
  | 'ready_for_supplier'
  | 'supplier_ordered'
  | 'supplier_confirmed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export type PaymentMethod = 'cod' | 'online';

export type PaymentStatus = 'pending_cod' | 'paid' | 'failed' | 'refunded';

export interface SupplierDetails {
  supplierName: string; // e.g. "Meesho Seller #491"
  supplierOrderId?: string; // Meesho order ID
  supplierCost: number; // Actual amount paid to supplier
  trackingNumber?: string; // Courier tracking AWB
  courier?: string; // e.g. "Delhivery", "XpressBees", "Shadowfax"
  supplierOrderDate?: string;
  notes?: string;
}

export interface OrderFinancials {
  sellingPrice: number; // Customer total
  supplierCost: number; // What ValueCart paid supplier
  gatewayFee: number; // Payment gateway fee (for online) or COD collection fee
  advertisingCost: number; // Attributed Meta Ads cost / CAC
  otherCost: number; // Shipping, packaging, operational buffer
  estimatedProfit: number; // Selling - (Supplier + Gateway + Ad + Other)
}

export interface OrderItem {
  productId: string;
  productName: string;
  productSlug: string;
  image: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
  supplierCost: number;
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note: string;
  updatedBy: string;
}

export interface Order {
  id: string; // Internal unique ID
  orderNumber: string; // e.g. "VC-1024"
  createdAt: string;
  updatedAt: string;
  customer: {
    name: string;
    mobile: string;
    email: string;
  };
  delivery: ShippingAddress;
  items: OrderItem[];
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string; // Razorpay payment ID
    razorpayOrderId?: string;
    paidAt?: string;
  };
  orderStatus: OrderStatus;
  statusHistory: OrderStatusHistoryItem[];
  supplier: SupplierDetails;
  marketing: MarketingAttribution;
  financials: OrderFinancials;
  customerTrackingTimeline?: Array<{
    title: string;
    description: string;
    date: string;
    completed: boolean;
    current?: boolean;
  }>;
  internalNotes?: string;
}

export interface CampaignPerformance {
  campaign: string;
  productName: string;
  productSlug: string;
  source: string;
  medium: string;
  ordersCount: number;
  revenue: number;
  adSpend: number;
  cac: number;
  estimatedProfit: number;
  roas: number;
}

export interface ProductPerformance {
  productId: string;
  name: string;
  slug: string;
  views: number;
  addToCartCount: number;
  checkoutStartedCount: number;
  ordersCount: number;
  revenue: number;
  adSpend: number;
  supplierCost: number;
  estimatedProfit: number;
  conversionRate: number; // percentage
  cac: number;
}
