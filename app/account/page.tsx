'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Package,
  Heart,
  MapPin,
  Clock,
  Calendar,
  LogOut,
  ChevronRight,
  ShoppingCart,
  ShieldCheck,
  AlertCircle,
  Truck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { PRODUCTS } from '@/data/products';
import { Product } from '@/types';

interface CustomerOrder {
  id: string;
  order_number: string;
  user_id: string;
  customer_name: string;
  customer_mobile: string;
  customer_email?: string;
  shipping_address: any;
  order_status: string;
  total_amount: number;
  shipping_charge: number;
  created_at: string;
  order_items: {
    id: string;
    product_name: string;
    product_slug?: string;
    image_url?: string;
    quantity: number;
    unit_selling_price: number;
  }[];
  payments?: {
    payment_method: string;
    payment_status: string;
    razorpay_payment_id?: string;
  }[];
}

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'wishlist' ? 'wishlist' : 'orders';
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile' | 'addresses'>(defaultTab);

  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { wishlist, cart } = useStore();

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Fetch real customer orders for authenticated user
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setOrders([]);
      setLoadingOrders(false);
      return;
    }

    const fetchCustomerOrders = async () => {
      setLoadingOrders(true);
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setLoadingOrders(false);
        return;
      }

      try {
        // Strict customer isolation: query orders for this authenticated user
        let query = supabase
          .from('orders')
          .select(`
            id,
            order_number,
            user_id,
            customer_name,
            customer_mobile,
            customer_email,
            shipping_address,
            order_status,
            total_amount,
            shipping_charge,
            created_at,
            order_items (
              id,
              product_name,
              product_slug,
              image_url,
              quantity,
              unit_selling_price
            ),
            payments (
              payment_method,
              payment_status,
              razorpay_payment_id
            )
          `)
          .order('created_at', { ascending: false });

        if (user.id && user.email) {
          query = query.or(`user_id.eq.${user.id},customer_email.eq.${user.email}`);
        } else if (user.id) {
          query = query.eq('user_id', user.id);
        } else if (user.email) {
          query = query.eq('customer_email', user.email);
        }

        const { data, error } = await query;

        if (!error && data) {
          setOrders(data as CustomerOrder[]);
        }
      } catch (err) {
        console.error('Error fetching customer orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchCustomerOrders();
  }, [user, authLoading]);

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-valuecart-navy border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-valuecart-text-muted">Loading account...</span>
      </div>
    );
  }

  // If not logged in, prompt user to login
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-5">
        <div className="bg-white rounded-3xl p-8 border border-valuecart-border shadow-soft space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-valuecart-navy text-white flex items-center justify-center mx-auto shadow-md">
            <User className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-valuecart-navy">Customer Account</h1>
          <p className="text-xs sm:text-sm text-valuecart-text-muted leading-relaxed">
            Sign in to view your order history, delivery status, and saved preferences.
          </p>
          <div className="pt-2">
            <Link
              href="/login?redirect=/account"
              className="inline-flex items-center justify-center gap-2 w-full bg-valuecart-navy hover:bg-valuecart-navy-light text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition-all shadow-md"
            >
              <span>Sign In / Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const customerName = profile?.full_name || (user.user_metadata?.full_name as string) || 'Customer';
  const customerEmail = user.email || '';
  const customerPhone = profile?.phone || (user.user_metadata?.phone as string) || 'Not provided';

  const getStatusColor = (status: string) => {
    if (status === 'delivered') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (status === 'shipped' || status === 'out_for_delivery') return 'text-blue-700 bg-blue-50 border-blue-200';
    if (status === 'cancelled') return 'text-rose-700 bg-rose-50 border-rose-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  const formatStatus = (status: string, method?: string) => {
    if (status === 'new') return method === 'cod' ? 'Order Placed (COD)' : 'Order Received';
    if (status === 'payment_confirmed') return 'Payment Confirmed';
    return status.replace(/_/g, ' ');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header Profile summary */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-valuecart-border shadow-soft mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-valuecart-navy text-white flex items-center justify-center text-xl font-black shadow-sm shrink-0">
            {customerName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-valuecart-navy">
              {customerName}
            </h1>
            <p className="text-xs text-valuecart-text-muted mt-0.5">
              {customerPhone} • {customerEmail}
            </p>
            <span className="inline-block mt-1 text-[11px] font-bold text-valuecart-green bg-valuecart-green-tint px-2.5 py-0.5 rounded-full">
              ValueCart Verified Customer
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="text-center px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-[11px] text-valuecart-text-muted block">Orders</span>
            <span className="text-base font-black text-valuecart-navy">{orders.length}</span>
          </div>
          <div className="text-center px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-[11px] text-valuecart-text-muted block">Cart</span>
            <span className="text-base font-black text-valuecart-navy">{cart.length}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-2xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation & Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Navigation Sidebar (3 cols) */}
        <div className="md:col-span-3 space-y-1">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-valuecart-navy text-white shadow-sm'
                : 'bg-white hover:bg-gray-100 text-valuecart-text-muted hover:text-valuecart-navy'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4" />
              <span>My Orders</span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20">
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wishlist')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'wishlist'
                ? 'bg-valuecart-navy text-white shadow-sm'
                : 'bg-white hover:bg-gray-100 text-valuecart-text-muted hover:text-valuecart-navy'
            }`}
          >
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4" />
              <span>Wishlist</span>
            </div>
            {wishlist.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                {wishlist.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-valuecart-navy text-white shadow-sm'
                : 'bg-white hover:bg-gray-100 text-valuecart-text-muted hover:text-valuecart-navy'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'addresses'
                ? 'bg-valuecart-navy text-white shadow-sm'
                : 'bg-white hover:bg-gray-100 text-valuecart-text-muted hover:text-valuecart-navy'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Delivery Addresses</span>
          </button>
        </div>

        {/* Tab Content (9 cols) */}
        <div className="md:col-span-9">
          {/* Tab 1: Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-valuecart-navy">My Orders</h2>
                <span className="text-xs text-valuecart-text-muted">
                  {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
                </span>
              </div>

              {loadingOrders ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                  <div className="w-6 h-6 border-2 border-valuecart-navy border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-valuecart-text-muted">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 space-y-3">
                  <p className="text-sm font-bold text-valuecart-navy">
                    You haven&apos;t placed any orders yet.
                  </p>
                  <p className="text-xs text-valuecart-text-muted max-w-sm mx-auto">
                    Check out our 304 Stainless Steel Chopping Board at ₹299 with free delivery.
                  </p>
                  <Link
                    href="/product/stainless-steel-chopping-board"
                    className="inline-block mt-2 bg-valuecart-green hover:bg-valuecart-green-dark text-white text-xs font-bold px-6 py-2.5 rounded-full transition-colors shadow-sm"
                  >
                    View Product
                  </Link>
                </div>
              ) : (
                orders.map((ord) => {
                  const payment = ord.payments?.[0];
                  const orderDate = new Date(ord.created_at);
                  const formattedDate = orderDate.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  const formattedTime = orderDate.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={ord.id}
                      className="bg-white rounded-3xl p-5 sm:p-6 border border-valuecart-border shadow-soft space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-valuecart-navy">
                              {ord.order_number}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border capitalize ${getStatusColor(
                                ord.order_status
                              )}`}
                            >
                              {formatStatus(ord.order_status, payment?.payment_method)}
                            </span>
                          </div>
                          <div className="text-valuecart-text-muted flex items-center gap-3 mt-1 text-[11px]">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formattedDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formattedTime}
                            </span>
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="font-black text-valuecart-navy text-base block">
                            ₹{ord.total_amount}
                          </span>
                          <span className="text-[11px] text-valuecart-text-muted block">
                            {payment?.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment (Razorpay)'}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-3">
                        {ord.order_items?.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                                {item.image_url ? (
                                  <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                                ) : (
                                  <Package className="w-6 h-6 text-gray-400 m-auto mt-3" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-bold text-valuecart-navy line-clamp-1">{item.product_name}</h3>
                                <p className="text-valuecart-text-muted text-[11px] mt-0.5">
                                  Quantity: <strong className="text-valuecart-navy">{item.quantity}</strong> × ₹{item.unit_selling_price}
                                </p>
                              </div>
                            </div>
                            <span className="font-black text-valuecart-navy text-sm">
                              ₹{item.unit_selling_price * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-valuecart-text-muted">
                        <span>
                          Estimated delivery: <strong>5–7 days</strong>
                        </span>
                        <Link
                          href={`/account/orders/${ord.id}`}
                          className="font-bold text-valuecart-green hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                        >
                          <span>View Order Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab 2: Wishlist */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-valuecart-navy mb-2">
                My Wishlist ({wishlist.length})
              </h2>

              {wishlist.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 space-y-2">
                  <p className="text-sm font-semibold text-valuecart-navy">Your wishlist is empty.</p>
                  <p className="text-xs text-valuecart-text-muted">Save your favorite items here to purchase later.</p>
                  <Link
                    href="/product/stainless-steel-chopping-board"
                    className="inline-block mt-3 bg-valuecart-green text-white text-xs font-bold px-6 py-2.5 rounded-full"
                  >
                    Explore Chopping Board
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {wishlist
                    .map((item) => PRODUCTS.find((p) => p.id === item || p.slug === item))
                    .filter((p): p is Product => !!p)
                    .map((prod) => (
                      <div
                        key={prod.id}
                        className="p-4 bg-white rounded-2xl border border-gray-200 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <img src={prod.image} alt={prod.name} className="w-12 h-12 object-cover rounded-xl" />
                          <div>
                            <h4 className="text-xs font-bold text-valuecart-navy">{prod.name}</h4>
                            <span className="text-xs font-black text-valuecart-green">₹{prod.price}</span>
                          </div>
                        </div>
                        <Link
                          href={`/product/${prod.slug}`}
                          className="text-xs font-bold text-valuecart-navy hover:underline"
                        >
                          View Product →
                        </Link>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Profile Details */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-valuecart-border shadow-soft space-y-4">
              <h2 className="text-lg font-bold text-valuecart-navy">Profile Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                  <span className="text-valuecart-text-muted block font-medium">Full Name</span>
                  <strong className="text-sm font-bold text-valuecart-navy block">{customerName}</strong>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                  <span className="text-valuecart-text-muted block font-medium">Email Address</span>
                  <strong className="text-sm font-bold text-valuecart-navy block">{customerEmail}</strong>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                  <span className="text-valuecart-text-muted block font-medium">Mobile Number</span>
                  <strong className="text-sm font-bold text-valuecart-navy block">{customerPhone}</strong>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                  <span className="text-valuecart-text-muted block font-medium">Account Security</span>
                  <div className="flex items-center gap-1.5 text-valuecart-green font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Supabase Auth Protected</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Delivery Addresses */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-valuecart-navy mb-2">Delivery Addresses</h2>
              {orders.length > 0 && orders[0].shipping_address ? (
                <div className="bg-white rounded-3xl p-6 border-2 border-valuecart-green/40 shadow-soft relative">
                  <span className="absolute top-4 right-4 bg-valuecart-green-tint text-valuecart-green-dark text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    Last Used Address
                  </span>
                  <h4 className="text-sm font-bold text-valuecart-navy">
                    {orders[0].shipping_address.fullName}
                  </h4>
                  <p className="text-xs text-valuecart-text-muted mt-2 leading-relaxed max-w-md">
                    {orders[0].shipping_address.houseFlat}, {orders[0].shipping_address.streetArea} <br />
                    {orders[0].shipping_address.landmark && `Near ${orders[0].shipping_address.landmark}, `}
                    {orders[0].shipping_address.city}, {orders[0].shipping_address.district} <br />
                    {orders[0].shipping_address.state} – {orders[0].shipping_address.pincode}
                  </p>
                  <div className="text-xs text-valuecart-navy font-semibold mt-2">
                    Mobile: {orders[0].shipping_address.mobile}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center space-y-2">
                  <p className="text-sm font-bold text-valuecart-navy">No saved addresses yet.</p>
                  <p className="text-xs text-valuecart-text-muted">
                    Addresses entered during checkout will be saved here automatically.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-valuecart-text-muted">Loading account details...</div>}>
      <AccountContent />
    </Suspense>
  );
}
