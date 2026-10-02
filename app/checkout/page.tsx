'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  CreditCard,
  Banknote,
  ArrowRight,
  ChevronRight,
  Lock,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useAdmin } from '@/context/AdminContext';
import { useAuth } from '@/context/AuthContext';
import { ShippingAddress, Order, OrderItem } from '@/types';
import { getStoredAttribution } from '@/lib/attribution';
import { trackPurchase } from '@/lib/analytics';
import { PRODUCTS } from '@/data/products';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartSubtotal, cartShipping, cartGrandTotal, clearCart, addToCart, addToast } = useStore();
  const { addOrder } = useAdmin();
  const { user, profile, loading: authLoading } = useAuth();

  const [address, setAddress] = useState<ShippingAddress>({
    fullName: '',
    mobile: '',
    email: '',
    houseFlat: '',
    streetArea: '',
    landmark: '',
    city: '',
    district: '',
    state: 'Kerala',
    pincode: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Autofill user profile data if logged in
  React.useEffect(() => {
    if (user) {
      setAddress((prev) => ({
        ...prev,
        fullName: prev.fullName || profile?.full_name || (user.user_metadata?.full_name as string) || '',
        mobile: prev.mobile || profile?.phone || (user.user_metadata?.phone as string) || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user, profile]);

  // All 28 States and 8 Union Territories of India (Kerala default)
  const indianStates = [
    'Kerala',
    'Tamil Nadu',
    'Karnataka',
    'Andhra Pradesh',
    'Telangana',
    'Maharashtra',
    'Delhi NCR',
    'Gujarat',
    'Rajasthan',
    'Uttar Pradesh',
    'West Bengal',
    'Madhya Pradesh',
    'Punjab',
    'Haryana',
    'Bihar',
    'Odisha',
    'Assam',
    'Goa',
    'Jharkhand',
    'Chhattisgarh',
    'Uttarakhand',
    'Himachal Pradesh',
    'Tripura',
    'Meghalaya',
    'Manipur',
    'Nagaland',
    'Mizoram',
    'Sikkim',
    'Arunachal Pradesh',
    'Jammu and Kashmir',
    'Ladakh',
    'Puducherry',
    'Chandigarh',
    'Andaman and Nicobar Islands',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Lakshadweep',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!address.fullName.trim()) {
      errors.fullName = 'Please enter your full name.';
    }

    const cleanMobile = address.mobile.replace(/\D/g, '');
    if (!cleanMobile) {
      errors.mobile = 'Please enter your mobile number.';
    } else if (cleanMobile.length !== 10) {
      errors.mobile = 'Please enter a valid 10-digit mobile number.';
    }

    if (!address.email.trim()) {
      errors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!address.houseFlat.trim()) {
      errors.houseFlat = 'Please enter your House / Flat / Building name.';
    }

    if (!address.streetArea.trim()) {
      errors.streetArea = 'Please enter your Street / Area / Colony.';
    }

    if (!address.city.trim()) {
      errors.city = 'Please enter your City / Town.';
    }

    if (!address.district.trim()) {
      errors.district = 'Please enter your District.';
    }

    if (!address.state.trim()) {
      errors.state = 'Please select your state.';
    }

    const cleanPin = address.pincode.replace(/\D/g, '');
    if (!cleanPin) {
      errors.pincode = 'Please enter your PIN code.';
    } else if (cleanPin.length !== 6) {
      errors.pincode = 'Please enter a valid 6-digit Indian PIN code.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast('Missing Information', 'Please fill in all required delivery details.', 'warning');
      return;
    }

    if (cart.length === 0) {
      addToast('Cart is Empty', 'Please select a product before checking out.', 'warning');
      return;
    }

    if (paymentMethod === 'online') {
      setIsPlacingOrder(true);
      try {
        const attribution = getStoredAttribution();
        const payload = {
          customer: {
            userId: user?.id,
            name: address.fullName.trim(),
            mobile: address.mobile.replace(/\D/g, ''),
            email: address.email.trim(),
          },
          delivery: { ...address },
          items: cart.map((item) => ({
            productId: item.product.id,
            productSlug: item.product.slug,
            quantity: item.quantity,
            variant: item.selectedSize ? `Size: ${item.selectedSize}` : undefined,
          })),
          marketing: attribution,
        };

        const res = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          if (data.code === 'RAZORPAY_CONFIG_MISSING') {
            addToast(
              'Online Gateway Pending',
              'Razorpay live API credentials not configured yet. Please select Cash on Delivery to place your order.',
              'warning'
            );
          } else {
            addToast('Online Payment Error', data.error || 'Could not initiate payment.', 'warning');
          }
          setIsPlacingOrder(false);
          return;
        }

        // Dynamically load Razorpay SDK
        const loadRzp = () =>
          new Promise<boolean>((resolve) => {
            if ((window as any).Razorpay) return resolve(true);
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });

        const rzpLoaded = await loadRzp();
        if (!rzpLoaded) {
          addToast('Gateway Error', 'Failed to load Razorpay checkout.', 'warning');
          setIsPlacingOrder(false);
          return;
        }

        const rzpOptions = {
          key: data.keyId,
          amount: data.amount * 100,
          currency: data.currency || 'INR',
          name: 'ValueCart',
          description: '304 Stainless Steel Chopping Board',
          order_id: data.razorpayOrderId,
          prefill: {
            name: address.fullName.trim(),
            contact: address.mobile.replace(/\D/g, ''),
            email: address.email.trim(),
          },
          theme: {
            color: '#0B1E36',
          },
          handler: async (response: any) => {
            try {
              const verifyRes = await fetch('/api/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: data.orderId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) {
                addToast('Payment Verification Failed', verifyData.error || 'Tampering detected.', 'warning');
                setIsPlacingOrder(false);
                return;
              }

              const confirmedOrder: Order = {
                id: data.orderId,
                orderNumber: data.orderNumber,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                customer: {
                  name: address.fullName.trim(),
                  mobile: address.mobile.replace(/\D/g, ''),
                  email: address.email.trim(),
                },
                delivery: { ...address },
                items: cart.map((i) => ({
                  productId: i.product.id,
                  productName: i.product.name,
                  productSlug: i.product.slug,
                  image: i.product.image,
                  quantity: i.quantity,
                  unitPrice: i.product.price,
                  supplierCost: Math.round(i.product.price * 0.38),
                })),
                payment: {
                  method: 'online',
                  status: 'paid',
                  transactionId: response.razorpay_payment_id,
                },
                orderStatus: 'payment_confirmed',
                statusHistory: [],
                supplier: {
                  supplierName: '',
                  supplierCost: 0,
                  notes: '',
                },
                marketing: attribution || { utm_source: 'direct', utm_medium: 'organic', utm_campaign: 'direct' },
                financials: {
                  sellingPrice: cartGrandTotal,
                  supplierCost: 0,
                  gatewayFee: 0,
                  advertisingCost: 0,
                  otherCost: 0,
                  estimatedProfit: cartGrandTotal,
                },
                customerTrackingTimeline: [],
              };

              addOrder(confirmedOrder);
              trackPurchase(confirmedOrder);
              setCreatedOrder(confirmedOrder);
              clearCart();
              addToast('Payment Verified!', `Order ${data.orderNumber} placed successfully.`, 'success');
            } catch (vErr) {
              console.error('Verify error:', vErr);
              addToast('Verification Error', 'Failed to confirm payment with server.', 'warning');
            } finally {
              setIsPlacingOrder(false);
            }
          },
          modal: {
            ondismiss: () => {
              setIsPlacingOrder(false);
              addToast('Payment Cancelled', 'Payment was cancelled. Your cart is preserved.', 'warning');
            },
          },
        };

        const rzp = new (window as any).Razorpay(rzpOptions);
        rzp.open();
      } catch (err: any) {
        setIsPlacingOrder(false);
        addToast('Payment Error', err.message || 'Payment initiation failed.', 'warning');
      }
      return;
    }

    // Cash on Delivery
    setIsPlacingOrder(true);

    try {
      const attribution = getStoredAttribution();

      const orderPayload = {
        customer: {
          userId: user?.id,
          name: address.fullName.trim(),
          mobile: address.mobile.replace(/\D/g, ''),
          email: address.email.trim(),
        },
        delivery: { ...address },
        items: cart.map((item) => ({
          productId: item.product.id,
          productSlug: item.product.slug,
          quantity: item.quantity,
          variant: item.selectedSize ? `Size: ${item.selectedSize}` : undefined,
        })),
        paymentMethod: 'cod',
        marketing: attribution,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        addToast('Order Submission Failed', data.error || 'Failed to place order.', 'warning');
        setIsPlacingOrder(false);
        return;
      }

      const createdOrderData: Order = data.order;

      // Register order with internal operations context & trigger analytics
      addOrder(createdOrderData);
      trackPurchase(createdOrderData);

      setCreatedOrder(createdOrderData);
      clearCart();
      addToast(
        'Order Confirmed!',
        `Order ${createdOrderData.orderNumber} placed successfully.`,
        'success'
      );
    } catch {
      addToast('Network Error', 'Could not reach server to place order. Please try again.', 'warning');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // If cart is empty and no order created, show clean recovery
  if (cart.length === 0 && !createdOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-valuecart-warm-white text-valuecart-navy flex items-center justify-center mx-auto border border-valuecart-border">
          <Truck className="w-8 h-8 text-valuecart-green" />
        </div>
        <h1 className="text-2xl font-black text-valuecart-navy">Your Cart is Empty</h1>
        <p className="text-xs sm:text-sm text-valuecart-text-muted max-w-md mx-auto">
          Add the 304 Stainless Steel Chopping Board to complete your order with Cash on Delivery or Secure Online Payment.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/product/stainless-steel-chopping-board"
            className="w-full sm:w-auto bg-valuecart-green hover:bg-valuecart-green-dark text-white font-bold px-8 py-3.5 rounded-full text-xs sm:text-sm transition-all shadow-md"
          >
            View Stainless Steel Chopping Board (₹299)
          </Link>
        </div>
      </div>
    );
  }

  // 13. ORDER SUCCESS PAGE
  if (createdOrder) {
    const isCOD = createdOrder.payment.method === 'cod';

    return (
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-16 text-center">
        {/* Success Checkmark */}
        <div className="w-20 h-20 rounded-full bg-valuecart-green-tint text-valuecart-green flex items-center justify-center mx-auto mb-4 shadow-sm">
          <CheckCircle2 className="w-10 h-10 stroke-[2.4]" />
        </div>

        <span className="text-xs font-bold text-valuecart-green uppercase tracking-wider bg-valuecart-green-surface px-3 py-1 rounded-full border border-valuecart-green/20">
          ✓ Order Confirmed
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-valuecart-navy mt-3">
          Thank you for shopping with ValueCart.
        </h1>

        <p className="text-xs sm:text-sm text-valuecart-text-muted mt-2 max-w-md mx-auto">
          Your order has been recorded. An SMS confirmation has been sent to{' '}
          <strong className="text-valuecart-navy font-bold">{createdOrder.customer.mobile}</strong> and email to{' '}
          <strong className="text-valuecart-navy font-bold">{createdOrder.customer.email}</strong>.
        </p>

        {/* Order Details Card */}
        <div className="mt-8 p-6 bg-white rounded-3xl border border-valuecart-border/80 shadow-soft text-left space-y-4 max-w-lg mx-auto">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <span className="text-xs text-valuecart-text-muted block font-medium">Order ID</span>
              <span className="text-base font-black text-valuecart-navy">
                {createdOrder.orderNumber}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-valuecart-text-muted block font-medium">Estimated Delivery</span>
              <span className="text-xs font-bold text-valuecart-green">
                Estimated delivery: 5–7 days
              </span>
            </div>
          </div>

          {/* Ordered Products */}
          <div className="space-y-3 pb-3 border-b border-gray-100">
            <span className="text-xs font-bold text-valuecart-navy uppercase tracking-wider block">
              Product Details
            </span>
            {createdOrder.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden relative border border-gray-100 shrink-0">
                    <img src={item.image} alt={item.productName} className="object-cover w-full h-full" />
                  </div>
                  <div>
                    <div className="font-semibold text-valuecart-navy leading-snug line-clamp-1">
                      {item.productName}
                    </div>
                    <div className="text-valuecart-text-muted text-[11px] mt-0.5">
                      Quantity: <strong className="text-valuecart-navy font-bold">{item.quantity}</strong>
                    </div>
                  </div>
                </div>
                <div className="font-black text-valuecart-navy text-sm">
                  ₹{item.unitPrice * item.quantity}
                </div>
              </div>
            ))}
          </div>

          {/* Payment & Total Amount */}
          <div className="grid grid-cols-2 gap-4 text-xs pt-1">
            <div>
              <span className="text-valuecart-text-muted block font-medium">Payment Method</span>
              <span className="font-bold text-valuecart-navy block mt-0.5">
                {isCOD ? 'Cash on Delivery' : 'Payment Successful'}
              </span>
              <span
                className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 ${
                  isCOD ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {isCOD ? 'Payment on Delivery' : 'Online Payment (Paid)'}
              </span>
            </div>

            <div className="text-right">
              <span className="text-valuecart-text-muted block font-medium">Total Amount</span>
              <span className="text-xl font-black text-valuecart-green block mt-0.5">
                ₹{createdOrder.financials.sellingPrice}
              </span>
              <span className="text-[10px] text-valuecart-text-muted block mt-0.5">Shipping: Free</span>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="pt-3 border-t border-gray-100 text-xs text-valuecart-text-muted">
            <span className="block font-bold text-valuecart-navy mb-0.5">Delivery Address:</span>
            <p className="leading-relaxed">
              {createdOrder.delivery.fullName} <br />
              {createdOrder.delivery.houseFlat}, {createdOrder.delivery.streetArea}
              {createdOrder.delivery.landmark ? `, Near ${createdOrder.delivery.landmark}` : ''} <br />
              {createdOrder.delivery.city}, {createdOrder.delivery.district}, {createdOrder.delivery.state} – {createdOrder.delivery.pincode} <br />
              Mobile: {createdOrder.customer.mobile}
            </p>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="bg-valuecart-green hover:bg-valuecart-green-dark text-white font-bold px-8 py-3.5 rounded-full text-xs sm:text-sm transition-colors shadow-md cursor-pointer"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Active Checkout Form View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-valuecart-text-muted mb-6">
        <Link href="/" className="hover:text-valuecart-green transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/cart" className="hover:text-valuecart-green transition-colors">
          Cart
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-valuecart-navy font-semibold">Checkout</span>
      </nav>

      {/* Header Banner */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-valuecart-navy tracking-tight">
            Checkout
          </h1>
          <p className="text-xs sm:text-sm text-valuecart-text-muted mt-1">
            Complete your delivery information and select payment
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full font-bold border border-emerald-200">
          <Lock className="w-3.5 h-3.5 text-valuecart-green" />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Customer & Delivery Information + Payment Methods (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* SECTION 1: Delivery Address */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-valuecart-border/80 shadow-soft space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-valuecart-green-tint text-valuecart-green flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-valuecart-navy">
                  Customer &amp; Delivery Information
                </h2>
              </div>
              <span className="text-xs text-valuecart-green font-semibold">All India Shipping</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-valuecart-navy mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={address.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. Arjun Menon"
                  className={`w-full h-11 px-3.5 rounded-xl border text-xs sm:text-sm text-valuecart-navy focus:outline-none focus:ring-2 ${
                    fieldErrors.fullName
                      ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                      : 'border-gray-200 focus:ring-valuecart-green bg-white'
                  }`}
                />
                {fieldErrors.fullName && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.fullName}
                  </p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-valuecart-navy mb-1.5">
                  Mobile Number (for delivery SMS &amp; tracking) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-xs font-bold text-gray-400">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    name="mobile"
                    value={address.mobile}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '');
                      setAddress((prev) => ({ ...prev, mobile: digits }));
                      if (fieldErrors.mobile) {
                        setFieldErrors((prev) => {
                          const next = { ...prev };
                          delete next.mobile;
                          return next;
                        });
                      }
                    }}
                    placeholder="10-digit mobile number"
                    className={`w-full h-11 pl-12 pr-3.5 rounded-xl border text-xs sm:text-sm text-valuecart-navy focus:outline-none focus:ring-2 ${
                      fieldErrors.mobile
                        ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                        : 'border-gray-200 focus:ring-valuecart-green bg-white'
                    }`}
                  />
                </div>
                {fieldErrors.mobile && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.mobile}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-valuecart-navy mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  inputMode="email"
                  name="email"
                  value={address.email}
                  onChange={handleInputChange}
                  placeholder="e.g. arjun@example.com"
                  className={`w-full h-11 px-3.5 rounded-xl border text-xs sm:text-sm text-valuecart-navy focus:outline-none focus:ring-2 ${
                    fieldErrors.email
                      ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                      : 'border-gray-200 focus:ring-valuecart-green bg-white'
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* House / Flat / Building */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-valuecart-navy mb-1.5">
                  House / Flat / Building / Apartment Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="houseFlat"
                  value={address.houseFlat}
                  onChange={handleInputChange}
                  placeholder="e.g. Flat 4B, Silver Heights / TC 12/34 Rose Villa"
                  className={`w-full h-11 px-3.5 rounded-xl border text-xs sm:text-sm text-valuecart-navy focus:outline-none focus:ring-2 ${
                    fieldErrors.houseFlat
                      ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                      : 'border-gray-200 focus:ring-valuecart-green bg-white'
                  }`}
                />
                {fieldErrors.houseFlat && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.houseFlat}
                  </p>
                )}
              </div>

              {/* Street / Area / Colony */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-valuecart-navy mb-1.5">
                  Street / Area / Colony <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="streetArea"
                  value={address.streetArea}
                  onChange={handleInputChange}
                  placeholder="e.g. MG Road, Near Marine Drive"
                  className={`w-full h-11 px-3.5 rounded-xl border text-xs sm:text-sm text-valuecart-navy focus:outline-none focus:ring-2 ${
                    fieldErrors.streetArea
                      ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                      : 'border-gray-200 focus:ring-valuecart-green bg-white'
                  }`}
                />
                {fieldErrors.streetArea && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.streetArea}
                  </p>
                )}
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-xs font-bold text-valuecart-navy mb-1.5">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={address.landmark}
                  onChange={handleInputChange}
                  placeholder="e.g. Opposite Post Office / Near High Court"
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-valuecart-navy focus:outline-none focus:ring-2 focus:ring-valuecart-green bg-white"
                />
              </div>

              {/* City / Town */}
              <div>
                <label className="block text-xs font-bold text-valuecart-navy mb-1.5">
                  City / Town <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={address.city}
                  onChange={handleInputChange}
                  placeholder="e.g. Kochi / Kozhikode / Trivandrum"
                  className={`w-full h-11 px-3.5 rounded-xl border text-xs sm:text-sm text-valuecart-navy focus:outline-none focus:ring-2 ${
                    fieldErrors.city
                      ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                      : 'border-gray-200 focus:ring-valuecart-green bg-white'
                  }`}
                />
                {fieldErrors.city && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.city}
                  </p>
                )}
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-bold text-valuecart-navy mb-1.5">
                  District <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="district"
                  value={address.district}
                  onChange={handleInputChange}
                  placeholder="e.g. Ernakulam / Kozhikode"
                  className={`w-full h-11 px-3.5 rounded-xl border text-xs sm:text-sm text-valuecart-navy focus:outline-none focus:ring-2 ${
                    fieldErrors.district
                      ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                      : 'border-gray-200 focus:ring-valuecart-green bg-white'
                  }`}
                />
                {fieldErrors.district && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.district}
                  </p>
                )}
              </div>

              {/* State Dropdown (Default Kerala, All Indian States) */}
              <div>
                <label className="block text-xs font-bold text-valuecart-navy mb-1.5">
                  State / UT <span className="text-rose-500">*</span>
                </label>
                <select
                  name="state"
                  value={address.state}
                  onChange={handleInputChange}
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-valuecart-navy focus:outline-none focus:ring-2 focus:ring-valuecart-green bg-white cursor-pointer"
                >
                  {indianStates.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* PIN Code */}
              <div>
                <label className="block text-xs font-bold text-valuecart-navy mb-1.5">
                  PIN Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  name="pincode"
                  value={address.pincode}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    setAddress((prev) => ({ ...prev, pincode: digits }));
                    if (fieldErrors.pincode) {
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.pincode;
                        return next;
                      });
                    }
                  }}
                  placeholder="6-digit PIN code"
                  className={`w-full h-11 px-3.5 rounded-xl border text-xs sm:text-sm text-valuecart-navy focus:outline-none focus:ring-2 ${
                    fieldErrors.pincode
                      ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                      : 'border-gray-200 focus:ring-valuecart-green bg-white'
                  }`}
                />
                {fieldErrors.pincode && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.pincode}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: Select Payment Method (2 Large Selectable Cards) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-valuecart-border/80 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-valuecart-green-tint text-valuecart-green flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-valuecart-navy">
                  Payment Method
                </h2>
              </div>
              <span className="text-xs text-valuecart-text-muted">100% Safe &amp; Encrypted</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card 1: CASH ON DELIVERY */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'cod'
                    ? 'border-valuecart-green bg-valuecart-green-surface shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-valuecart-navy flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-valuecart-green" />
                      CASH ON DELIVERY
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'cod'
                          ? 'border-valuecart-green bg-valuecart-green text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      {paymentMethod === 'cod' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-xs text-valuecart-text-muted leading-relaxed">
                    Pay when your order is delivered.
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-valuecart-green">Zero Advance Payment</span>
                  <span className="text-gray-400">Cash / UPI at door</span>
                </div>
              </div>

              {/* Card 2: ONLINE PAYMENT */}
              <div
                onClick={() => setPaymentMethod('online')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'online'
                    ? 'border-valuecart-green bg-valuecart-green-surface shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-valuecart-navy flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-valuecart-green" />
                      ONLINE PAYMENT
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'online'
                          ? 'border-valuecart-green bg-valuecart-green text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      {paymentMethod === 'online' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-xs text-valuecart-text-muted leading-relaxed">
                    Pay securely online.
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-blue-600">Razorpay Architecture</span>
                  <span className="text-gray-400">UPI / Cards / NetBanking</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Checkout Summary & Place Order CTA (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-6 border border-valuecart-border/80 shadow-soft space-y-5 sticky top-24">
            <h2 className="text-base font-extrabold text-valuecart-navy pb-3 border-b border-gray-100">
              Order Summary
            </h2>

            {/* Product items thumbnail list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 text-xs">
                  <div className="relative w-14 h-14 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="object-contain w-full h-full p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-valuecart-navy truncate">
                      {item.product.name}
                    </div>
                    <div className="text-valuecart-text-muted mt-0.5">
                      Quantity: <strong className="text-valuecart-navy">{item.quantity}</strong>
                    </div>
                    <div className="font-bold text-valuecart-green mt-0.5">
                      ₹{item.product.price} each
                    </div>
                  </div>
                  <div className="font-black text-valuecart-navy text-sm">
                    ₹{item.product.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-gray-100 pt-3 space-y-2 text-xs sm:text-sm text-valuecart-text-muted">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-valuecart-navy">₹{cartSubtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                {cartShipping === 0 ? (
                  <span className="text-valuecart-green font-bold">FREE</span>
                ) : (
                  <span className="font-bold text-valuecart-navy">₹{cartShipping}</span>
                )}
              </div>
              <div className="border-t border-gray-100 pt-2.5 flex justify-between text-base font-black text-valuecart-navy">
                <span>Total Amount</span>
                <span className="text-2xl text-valuecart-green">₹{cartGrandTotal}</span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              type="submit"
              disabled={isPlacingOrder || cart.length === 0}
              className="w-full bg-valuecart-green hover:bg-valuecart-green-dark active:scale-[0.99] disabled:opacity-50 text-white font-extrabold py-4 px-4 rounded-2xl flex items-center justify-center gap-2 text-sm sm:text-base shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              {isPlacingOrder ? (
                <span>Placing Order...</span>
              ) : (
                <>
                  <span>
                    {paymentMethod === 'cod' ? 'PLACE COD ORDER' : 'PROCEED TO PAYMENT'} • ₹{cartGrandTotal}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="space-y-1.5 pt-2 text-[11px] text-valuecart-text-muted border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-valuecart-green" />
                <span>100% Genuine Food-Grade 304 Stainless Steel</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-valuecart-green" />
                <span>Dispatched with express delivery tracking</span>
              </div>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
}
