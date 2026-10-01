'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  Truck,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Banknote,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface OrderItemDetail {
  id: string;
  product_name: string;
  product_slug?: string;
  image_url?: string;
  quantity: number;
  unit_selling_price: number;
}

interface OrderDetail {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_mobile: string;
  customer_email?: string;
  shipping_address: any;
  order_status: string;
  total_amount: number;
  shipping_charge: number;
  created_at: string;
  order_items: OrderItemDetail[];
  payments?: {
    payment_method: string;
    payment_status: string;
    razorpay_payment_id?: string;
  }[];
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace(`/login?redirect=/account/orders/${orderId}`);
      return;
    }

    const fetchOrder = async () => {
      setLoading(true);
      setErrorMsg('');

      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setErrorMsg('Supabase database client not available.');
        setLoading(false);
        return;
      }

      try {
        // Fetch order with its items and payments
        // Security: query by id AND user_id to ensure customer A cannot see customer B's order
        const { data, error } = await supabase
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
          .eq('id', orderId)
          .maybeSingle();

        if (error || !data) {
          setErrorMsg('Order not found or you do not have permission to view it.');
          setLoading(false);
          return;
        }

        // Security verification: order must belong to this authenticated user
        const isOwner =
          (data.user_id && data.user_id === user.id) ||
          (data.customer_email && user.email && data.customer_email.toLowerCase() === user.email.toLowerCase());

        if (!isOwner) {
          setErrorMsg('Unauthorized: You do not have permission to view this order.');
          setLoading(false);
          return;
        }

        setOrder(data as OrderDetail);
      } catch (err: any) {
        setErrorMsg(err.message || 'Error fetching order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [user, authLoading, orderId, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-valuecart-navy border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-valuecart-text-muted">Loading order details...</span>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-valuecart-navy">Unable to Load Order</h1>
        <p className="text-xs text-valuecart-text-muted max-w-md mx-auto">{errorMsg}</p>
        <Link
          href="/account"
          className="inline-flex items-center gap-2 bg-valuecart-navy text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-valuecart-navy-light transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Account</span>
        </Link>
      </div>
    );
  }

  const orderDate = new Date(order.created_at);
  const formattedDate = orderDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = orderDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const payment = order.payments?.[0];
  const isCOD = payment?.payment_method === 'cod';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/account?tab=orders"
          className="inline-flex items-center gap-2 text-xs font-bold text-valuecart-text-muted hover:text-valuecart-navy transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>
      </div>

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl border border-valuecart-border shadow-soft p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-valuecart-navy">
                Order {order.order_number}
              </h1>
              <span className="text-xs font-bold text-valuecart-green bg-valuecart-green-tint px-2.5 py-0.5 rounded-full capitalize">
                {order.order_status.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-valuecart-text-muted mt-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {formattedTime}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-valuecart-text-muted block">Estimated Delivery</span>
            <span className="text-sm font-bold text-valuecart-green">
              Estimated delivery: 5–7 days
            </span>
          </div>
        </div>

        {/* Product Items */}
        <div className="space-y-4 pb-6 border-b border-gray-100">
          <h2 className="text-xs font-bold text-valuecart-navy uppercase tracking-wider">
            Items in this order
          </h2>
          <div className="divide-y divide-gray-100">
            {order.order_items?.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-valuecart-navy line-clamp-1">
                      {item.product_name}
                    </h3>
                    <p className="text-xs text-valuecart-text-muted mt-0.5">
                      Quantity: <strong className="text-valuecart-navy">{item.quantity}</strong> × ₹{item.unit_selling_price}
                    </p>
                  </div>
                </div>
                <span className="text-base font-black text-valuecart-navy">
                  ₹{item.unit_selling_price * item.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Grid: Delivery Address & Payment Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-gray-100 text-xs">
          
          {/* Delivery Address */}
          <div className="space-y-2">
            <h3 className="font-bold text-valuecart-navy uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-valuecart-green" />
              Delivery Address
            </h3>
            <div className="text-valuecart-text-muted leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <strong className="text-valuecart-navy block font-bold text-sm mb-1">
                {order.customer_name}
              </strong>
              {order.shipping_address?.houseFlat}, {order.shipping_address?.streetArea} <br />
              {order.shipping_address?.landmark && `Near ${order.shipping_address?.landmark}, `}
              {order.shipping_address?.city}, {order.shipping_address?.district} <br />
              {order.shipping_address?.state} – {order.shipping_address?.pincode} <br />
              <span className="block mt-2 font-medium text-valuecart-navy">
                Mobile: {order.customer_mobile}
              </span>
            </div>
          </div>

          {/* Payment & Price Breakdown */}
          <div className="space-y-2">
            <h3 className="font-bold text-valuecart-navy uppercase tracking-wider flex items-center gap-1.5">
              {isCOD ? (
                <Banknote className="w-4 h-4 text-valuecart-green" />
              ) : (
                <CreditCard className="w-4 h-4 text-valuecart-green" />
              )}
              Payment Details
            </h3>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2.5">
              <div className="flex justify-between">
                <span className="text-valuecart-text-muted">Payment Method:</span>
                <span className="font-bold text-valuecart-navy">
                  {isCOD ? 'Cash on Delivery (COD)' : 'Online Payment (Razorpay)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-valuecart-text-muted">Payment Status:</span>
                <span className={`font-bold capitalize ${
                  payment?.payment_status === 'paid' ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {payment?.payment_status === 'pending_cod' ? 'Pending COD' : (payment?.payment_status || 'Pending')}
                </span>
              </div>
              {payment?.razorpay_payment_id && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-valuecart-text-muted">Payment ID:</span>
                  <span className="font-mono text-gray-600">{payment.razorpay_payment_id}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-black text-valuecart-navy">
                <span>Total Amount:</span>
                <span className="text-base text-valuecart-green">₹{order.total_amount}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer reassurance */}
        <div className="flex items-center justify-between pt-2 text-xs text-valuecart-text-muted">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-valuecart-green" />
            <span>ValueCart Order Protection • 100% Genuine 304 Food-Grade Steel</span>
          </div>
          <Link
            href="/"
            className="font-bold text-valuecart-green hover:underline cursor-pointer"
          >
            Continue Shopping →
          </Link>
        </div>

      </div>
    </div>
  );
}
