'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Order,
  OrderStatus,
  SupplierDetails,
  Product,
  CampaignPerformance,
  ProductPerformance,
} from '@/types';
import { PRODUCTS } from '@/data/products';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface AdminContextType {
  isAdminAuthenticated: boolean;
  adminLoading: boolean;
  login: (password: string, email?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  orders: Order[];
  products: Product[];
  refreshOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, note?: string) => Promise<void>;
  updateSupplierDetails: (orderId: string, details: Partial<SupplierDetails>) => Promise<void>;
  addOrder: (newOrder: Order) => void;
  getOrderById: (orderId: string) => Order | undefined;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  getAnalytics: (timeframe: 'today' | 'yesterday' | '7days' | '30days' | 'this_month' | 'all') => {
    totalOrders: number;
    todayOrders: number;
    pendingOrders: number;
    processingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    returnedOrders: number;
    codOrders: number;
    onlineOrders: number;
    revenue: number;
    supplierCost: number;
    advertisingCost: number;
    gatewayFees: number;
    otherCosts: number;
    estimatedProfit: number;
    profitMargin: number;
    roas: number;
    productPerformance: ProductPerformance[];
    campaignPerformance: CampaignPerformance[];
  };
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminLoading, setAdminLoading] = useState<boolean>(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);

  const supabase = getSupabaseBrowserClient();

  // Helper to map Supabase database rows into domain Order model
  const mapSupabaseOrders = (data: any[]): Order[] => {
    return (data || []).map((row: any) => {
      const items = (row.order_items || []).map((item: any) => ({
        productId: item.product_id || item.id,
        productName: item.product_name,
        productSlug: item.product_slug || '',
        image: item.image_url || '/images/hero-banner.png',
        variant: item.variant_details || undefined,
        quantity: item.quantity,
        unitPrice: Number(item.unit_selling_price),
        supplierCost: Number(item.unit_supplier_cost || 0),
      }));

      const totalSupplierCost = items.reduce(
        (acc: number, item: any) => acc + item.supplierCost * item.quantity,
        0
      );

      const totalAmount = Number(row.total_amount);
      const paymentRecord = row.payments?.[0];
      const supplierRecord = row.supplier_orders?.[0];

      return {
        id: row.id,
        orderNumber: row.order_number,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        customer: {
          name: row.customer_name,
          mobile: row.customer_mobile,
          email: row.customer_email || '',
        },
        delivery: row.shipping_address || {},
        items,
        payment: {
          method: paymentRecord?.payment_method || 'cod',
          status: paymentRecord?.payment_status || (paymentRecord?.payment_method === 'online' ? 'failed' : 'pending_cod'),
          transactionId: paymentRecord?.razorpay_payment_id,
          razorpayOrderId: paymentRecord?.razorpay_order_id,
          paidAt: paymentRecord?.paid_at,
        },
        orderStatus: row.order_status,
        statusHistory: (row.order_status_history || []).map((h: any) => ({
          status: h.new_status,
          timestamp: h.created_at,
          note: h.note || '',
          updatedBy: h.updated_by || 'System',
        })),
        supplier: supplierRecord ? {
          supplierName: supplierRecord.courier_name || 'Direct Supplier',
          supplierOrderId: supplierRecord.supplier_order_id || '',
          supplierCost: Number(supplierRecord.total_supplier_cost || totalSupplierCost),
          trackingNumber: supplierRecord.tracking_number || '',
          courier: supplierRecord.courier_name || '',
          notes: supplierRecord.notes || '',
        } : {
          supplierName: '',
          supplierOrderId: '',
          supplierCost: totalSupplierCost,
          trackingNumber: '',
          courier: '',
          notes: '',
        },
        marketing: {
          utm_source: row.marketing_attribution?.[0]?.utm_source || 'direct',
          utm_medium: row.marketing_attribution?.[0]?.utm_medium || 'organic',
          utm_campaign: row.marketing_attribution?.[0]?.utm_campaign || 'direct_traffic',
          utm_content: row.marketing_attribution?.[0]?.utm_content,
          utm_term: row.marketing_attribution?.[0]?.utm_term,
        },
        financials: {
          sellingPrice: totalAmount,
          supplierCost: totalSupplierCost,
          gatewayFee: paymentRecord?.payment_method === 'online' ? Math.round(totalAmount * 0.02) : 0,
          advertisingCost: 0,
          otherCost: 0,
          estimatedProfit: totalSupplierCost > 0
            ? Math.max(0, totalAmount - totalSupplierCost - (paymentRecord?.payment_method === 'online' ? Math.round(totalAmount * 0.02) : 0))
            : totalAmount,
        },
        customerTrackingTimeline: [],
      };
    });
  };

  const fetchOrdersFromDb = useCallback(async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          customer_name,
          customer_mobile,
          customer_email,
          shipping_address,
          order_status,
          total_amount,
          shipping_charge,
          created_at,
          updated_at,
          order_items (
            id,
            product_id,
            product_name,
            product_slug,
            image_url,
            variant_details,
            quantity,
            unit_selling_price,
            unit_supplier_cost
          ),
          payments (
            payment_method,
            payment_status,
            razorpay_order_id,
            razorpay_payment_id,
            paid_at
          ),
          supplier_orders (
            id,
            supplier_order_id,
            total_supplier_cost,
            courier_name,
            tracking_number,
            notes
          ),
          marketing_attribution (
            utm_source,
            utm_medium,
            utm_campaign,
            utm_content,
            utm_term
          ),
          order_status_history (
            new_status,
            note,
            updated_by,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(mapSupabaseOrders(data));
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    }
  }, [supabase]);

  // Check current session on mount
  useEffect(() => {
    if (!supabase) {
      setAdminLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // Check if admin
          const { data: userProfile } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();

          const isRoleAdmin =
            userProfile?.role === 'admin' ||
            session.user.app_metadata?.role === 'admin' ||
            session.user.email?.includes('admin') ||
            session.user.email?.toLowerCase().trim() === 'alwinabraham420@gmail.com';

          if (isRoleAdmin) {
            setIsAdminAuthenticated(true);
            await fetchOrdersFromDb();
            await fetchProductsFromDb();
          }
        }
      } catch (err) {
        console.error('Error checking admin auth session:', err);
      } finally {
        setAdminLoading(false);
      }
    };

    checkSession();

    // Setup real-time listener for orders table changes
    const channel = supabase
      ? supabase
          .channel('admin-orders-realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders' },
            () => {
              fetchOrdersFromDb();
            }
          )
          .subscribe()
      : null;

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase, fetchOrdersFromDb]);

  const login = async (password: string, email?: string): Promise<boolean> => {
    if (!supabase) return false;
    const adminEmail = email?.trim() || 'alwinabraham420@gmail.com';

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password,
      });

      if (error || !data.user) {
        return false;
      }

      // Check role
      const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      const isRoleAdmin =
        userProfile?.role === 'admin' ||
        data.user.app_metadata?.role === 'admin' ||
        data.user.email?.includes('admin') ||
        data.user.email?.toLowerCase().trim() === 'alwinabraham420@gmail.com';

      if (!isRoleAdmin) {
        await supabase.auth.signOut();
        return false;
      }

      setIsAdminAuthenticated(true);
      await fetchOrdersFromDb();
      await fetchProductsFromDb();
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsAdminAuthenticated(false);
  };

  const refreshOrders = async () => {
    await fetchOrdersFromDb();
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    note?: string
  ) => {
    // 1. Optimistic update in state
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            orderStatus: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return order;
      })
    );

    // 2. Persist to Supabase via server API
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, orderStatus: newStatus, note }),
      });
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const updateSupplierDetails = async (
    orderId: string,
    details: Partial<SupplierDetails>
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updatedSupplier = { ...order.supplier, ...details };
          return {
            ...order,
            supplier: updatedSupplier,
            updatedAt: new Date().toISOString(),
          };
        }
        return order;
      })
    );

    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, supplierDetails: details }),
      });
    } catch (err) {
      console.error('Error updating supplier details:', err);
    }
  };

  const fetchProductsFromDb = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
    }
  }, []);

  const addOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
  };

  const getOrderById = (orderId: string): Order | undefined => {
    return orders.find((o) => o.id === orderId || o.orderNumber === orderId);
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updates } : p))
    );

    try {
      const prod = products.find((p) => p.id === productId);
      await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          slug: prod?.slug,
          updates,
        }),
      });
    } catch (err) {
      console.error('Failed to sync product update with backend:', err);
    }
  };

  const addProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const getAnalytics = (timeframe: 'today' | 'yesterday' | '7days' | '30days' | 'this_month' | 'all') => {
    const now = new Date();
    const filteredOrders = orders.filter((order) => {
      if (timeframe === 'all') return true;
      const orderDate = new Date(order.createdAt);
      const diffMs = now.getTime() - orderDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (timeframe === 'today') {
        return orderDate.toDateString() === now.toDateString();
      }
      if (timeframe === 'yesterday') {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return orderDate.toDateString() === yesterday.toDateString();
      }
      if (timeframe === '7days') return diffDays <= 7;
      if (timeframe === '30days') return diffDays <= 30;
      if (timeframe === 'this_month') {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });

    const totalOrders = filteredOrders.length;
    const todayOrders = orders.filter(
      (o) => new Date(o.createdAt).toDateString() === now.toDateString()
    ).length;

    const pendingOrders = filteredOrders.filter((o) =>
      ['new', 'payment_confirmed', 'ready_for_supplier'].includes(o.orderStatus)
    ).length;

    const processingOrders = filteredOrders.filter((o) =>
      ['supplier_ordered', 'supplier_confirmed'].includes(o.orderStatus)
    ).length;

    const shippedOrders = filteredOrders.filter((o) =>
      ['shipped', 'out_for_delivery'].includes(o.orderStatus)
    ).length;

    const deliveredOrders = filteredOrders.filter((o) => o.orderStatus === 'delivered').length;
    const cancelledOrders = filteredOrders.filter((o) => o.orderStatus === 'cancelled').length;
    const returnedOrders = filteredOrders.filter((o) => o.orderStatus === 'returned').length;

    const codOrders = filteredOrders.filter((o) => o.payment.method === 'cod').length;
    const onlineOrders = filteredOrders.filter((o) => o.payment.method === 'online').length;

    const revenue = filteredOrders.reduce((sum, o) => sum + o.financials.sellingPrice, 0);
    const supplierCost = filteredOrders.reduce((sum, o) => sum + o.financials.supplierCost, 0);
    const advertisingCost = filteredOrders.reduce((sum, o) => sum + o.financials.advertisingCost, 0);
    const gatewayFees = filteredOrders.reduce((sum, o) => sum + o.financials.gatewayFee, 0);
    const otherCosts = filteredOrders.reduce((sum, o) => sum + o.financials.otherCost, 0);
    const estimatedProfit = filteredOrders.reduce((sum, o) => sum + o.financials.estimatedProfit, 0);

    const profitMargin = revenue > 0 ? (estimatedProfit / revenue) * 100 : 0;
    const roas = advertisingCost > 0 ? revenue / advertisingCost : 0;

    return {
      totalOrders,
      todayOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      returnedOrders,
      codOrders,
      onlineOrders,
      revenue,
      supplierCost,
      advertisingCost,
      gatewayFees,
      otherCosts,
      estimatedProfit,
      profitMargin,
      roas,
      productPerformance: [],
      campaignPerformance: [],
    };
  };

  return (
    <AdminContext.Provider
      value={{
        isAdminAuthenticated,
        adminLoading,
        login,
        logout,
        orders,
        products,
        refreshOrders,
        updateOrderStatus,
        updateSupplierDetails,
        addOrder,
        getOrderById,
        updateProduct,
        addProduct,
        deleteProduct,
        getAnalytics,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
