'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, useRouter } from 'next/navigation';
import {
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Truck,
  Package,
  Clock,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Save,
  Tag,
  Share2,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { OrderStatus } from '@/types';

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const { getOrderById, updateOrderStatus, updateSupplierDetails, refreshOrders } = useAdmin();

  const [dbOrder, setDbOrder] = useState<any>(null);
  const [loadingDb, setLoadingDb] = useState(false);

  const contextOrder = getOrderById(id);
  const order = contextOrder || dbOrder;

  React.useEffect(() => {
    if (!contextOrder) {
      setLoadingDb(true);
      import('@/lib/supabase/client').then(({ getSupabaseBrowserClient }) => {
        const supabase = getSupabaseBrowserClient();
        if (supabase) {
          supabase
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
              )
            `)
            .or(`id.eq.${id},order_number.eq.${id}`)
            .maybeSingle()
            .then(({ data }) => {
              if (data) {
                const items = (data.order_items || []).map((item: any) => ({
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
                const paymentRecord = data.payments?.[0];
                const supplierRecord = data.supplier_orders?.[0];
                setDbOrder({
                  id: data.id,
                  orderNumber: data.order_number,
                  createdAt: data.created_at,
                  updatedAt: data.updated_at,
                  customer: {
                    name: data.customer_name,
                    mobile: data.customer_mobile,
                    email: data.customer_email || '',
                  },
                  delivery: data.shipping_address || {},
                  items,
                  payment: {
                    method: paymentRecord?.payment_method || 'cod',
                    status: paymentRecord?.payment_status || 'pending_cod',
                    transactionId: paymentRecord?.razorpay_payment_id,
                    razorpayOrderId: paymentRecord?.razorpay_order_id,
                    paidAt: paymentRecord?.paid_at,
                  },
                  orderStatus: data.order_status,
                  statusHistory: [],
                  supplier: {
                    supplierName: supplierRecord?.courier_name || 'ValueCart Supplier Hub',
                    supplierOrderId: supplierRecord?.supplier_order_id,
                    supplierCost: Number(supplierRecord?.total_supplier_cost || totalSupplierCost),
                    trackingNumber: supplierRecord?.tracking_number,
                    courier: supplierRecord?.courier_name,
                    notes: supplierRecord?.notes,
                  },
                  marketing: { utm_source: 'direct', utm_medium: 'organic', utm_campaign: 'direct' },
                  financials: {
                    sellingPrice: Number(data.total_amount),
                    supplierCost: totalSupplierCost,
                    gatewayFee: paymentRecord?.payment_method === 'online' ? Math.round(Number(data.total_amount) * 0.02) : 0,
                    advertisingCost: 85,
                    otherCost: 18,
                    estimatedProfit: Number(data.total_amount) - totalSupplierCost - 85 - 18,
                  },
                  customerTrackingTimeline: [],
                });
              }
              setLoadingDb(false);
            });
        } else {
          setLoadingDb(false);
        }
      });
    }
  }, [id, contextOrder]);

  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedProduct, setCopiedProduct] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('new');
  const [statusNote, setStatusNote] = useState('');

  // Editable supplier fields
  const [supplierName, setSupplierName] = useState('Meesho Seller');
  const [supplierOrderId, setSupplierOrderId] = useState('');
  const [supplierCost, setSupplierCost] = useState(0);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courier, setCourier] = useState('Delhivery');
  const [supplierNotes, setSupplierNotes] = useState('');
  const [savedSupplierMsg, setSavedSupplierMsg] = useState(false);

  React.useEffect(() => {
    if (order) {
      setSelectedStatus(order.orderStatus);
      setSupplierName(order.supplier?.supplierName || 'Meesho Seller');
      setSupplierOrderId(order.supplier?.supplierOrderId || '');
      setSupplierCost(order.supplier?.supplierCost || 0);
      setTrackingNumber(order.supplier?.trackingNumber || '');
      setCourier(order.supplier?.courier || 'Delhivery');
      setSupplierNotes(order.supplier?.notes || '');
    }
  }, [order]);

  if (loadingDb) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-xs text-gray-400">
        Loading order from database...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <h2 className="text-xl font-bold text-valuecart-navy">Order not found</h2>
        <Link href="/admin/orders" className="text-xs text-valuecart-green font-bold mt-2 inline-block">
          ← Back to all orders
        </Link>
      </div>
    );
  }

  // Copy customer shipping address in standard format for Meesho app / supplier checkout
  const handleCopyCustomerAddress = () => {
    const d = order.delivery;
    const textToCopy = `Name: ${d.fullName}
Mobile: ${d.mobile}
Address: ${d.houseFlat}, ${d.streetArea}${d.landmark ? `, Landmark: ${d.landmark}` : ''}
City: ${d.city}
District: ${d.district}
State: ${d.state}
PIN Code: ${d.pincode}
Email: ${d.email}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Copy product details
  const handleCopyProductInfo = () => {
    const item = order.items[0];
    const text = `Product: ${item?.productName}
Variant: ${item?.variant || 'Standard'}
Quantity: ${item?.quantity}
Unit Sourcing Cost: ₹${item?.supplierCost}`;

    navigator.clipboard.writeText(text);
    setCopiedProduct(true);
    setTimeout(() => setCopiedProduct(false), 2000);
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrderStatus(order.id, selectedStatus, statusNote);
    setStatusNote('');
  };

  const handleSaveSupplierDetails = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupplierDetails(order.id, {
      supplierName,
      supplierOrderId,
      supplierCost: Number(supplierCost),
      trackingNumber,
      courier,
      notes: supplierNotes,
      supplierOrderDate: new Date().toISOString().split('T')[0],
    });
    setSavedSupplierMsg(true);
    setTimeout(() => setSavedSupplierMsg(false), 2500);
  };

  const workflowStatuses: { value: OrderStatus; label: string }[] = [
    { value: 'new', label: '1. New Order' },
    { value: 'payment_confirmed', label: '2. Payment Confirmed / COD Verified' },
    { value: 'ready_for_supplier', label: '3. Ready for Supplier' },
    { value: 'supplier_ordered', label: '4. Supplier Ordered (Meesho Placed)' },
    { value: 'supplier_confirmed', label: '5. Supplier Confirmed' },
    { value: 'shipped', label: '6. Shipped (Courier Dispatched)' },
    { value: 'out_for_delivery', label: '7. Out for Delivery' },
    { value: 'delivered', label: '8. Delivered (Payment Realized)' },
    { value: 'cancelled', label: '9. Cancelled' },
    { value: 'returned', label: '10. Returned (RTO)' },
    { value: 'refunded', label: '11. Refunded' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-valuecart-text-muted mb-2">
            <Link href="/admin" className="hover:text-valuecart-green">
              Dashboard
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/admin/orders" className="hover:text-valuecart-green">
              Orders
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-valuecart-navy font-bold">{order.orderNumber}</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-valuecart-navy">
              Order {order.orderNumber}
            </h1>
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-valuecart-navy text-white">
              {order.orderStatus.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-valuecart-navy hover:text-valuecart-green bg-white border border-gray-200 px-4 py-2 rounded-xl transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Orders</span>
        </Link>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Left Column: Order Items, Customer & Supplier Fulfillment Workspace (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section: Supplier Fulfillment Workspace (Section 16 requirement) */}
          <div className="bg-gradient-to-br from-white to-amber-50/40 rounded-3xl p-6 sm:p-7 border-2 border-amber-300 shadow-soft space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-700" />
                <h2 className="text-base sm:text-lg font-black text-valuecart-navy">
                  Supplier Fulfillment Workspace (Manual Meesho Ordering)
                </h2>
              </div>
              <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full">
                Step-by-Step Supplier Workflow
              </span>
            </div>

            {/* Quick Action Copy Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCopyCustomerAddress}
                className="flex items-center justify-center gap-2 bg-valuecart-navy hover:bg-valuecart-navy-light text-white text-xs font-bold py-3 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {copiedAddress ? (
                  <>
                    <Check className="w-4 h-4 text-valuecart-green-light" />
                    <span>Customer Address Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Customer Details for Meesho</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyProductInfo}
                className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-300 text-valuecart-navy text-xs font-bold py-3 px-4 rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                {copiedProduct ? (
                  <>
                    <Check className="w-4 h-4 text-valuecart-green" />
                    <span>Product Info Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-gray-500" />
                    <span>Copy Product Name &amp; Variant</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Supplier State Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedStatus('supplier_ordered');
                  updateOrderStatus(order.id, 'supplier_ordered', 'Order placed manually on Meesho portal');
                }}
                className="text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                ✓ Mark Supplier Order Placed
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedStatus('shipped');
                  updateOrderStatus(order.id, 'shipped', 'Courier dispatched package');
                }}
                className="text-xs font-bold bg-sky-100 hover:bg-sky-200 text-sky-900 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                ✓ Mark Shipped
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedStatus('delivered');
                  updateOrderStatus(order.id, 'delivered', 'Customer received product. Payment realized.');
                }}
                className="text-xs font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                ✓ Mark Delivered
              </button>
            </div>

            {/* Supplier Form */}
            <form onSubmit={handleSaveSupplierDetails} className="space-y-4 pt-3 border-t border-amber-200/80">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-valuecart-navy mb-1">
                    Supplier / Source Name
                  </label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="e.g. Meesho Seller #912"
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 text-valuecart-navy bg-white focus:outline-none focus:ring-1 focus:ring-valuecart-green"
                  />
                </div>

                <div>
                  <label className="block font-bold text-valuecart-navy mb-1">
                    Supplier Order ID
                  </label>
                  <input
                    type="text"
                    value={supplierOrderId}
                    onChange={(e) => setSupplierOrderId(e.target.value)}
                    placeholder="e.g. MSH-ORD-881920"
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 text-valuecart-navy bg-white focus:outline-none focus:ring-1 focus:ring-valuecart-green"
                  />
                </div>

                <div>
                  <label className="block font-bold text-valuecart-navy mb-1">
                    Actual Supplier Sourcing Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={supplierCost}
                    onChange={(e) => setSupplierCost(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 text-valuecart-navy bg-white focus:outline-none focus:ring-1 focus:ring-valuecart-green font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-valuecart-navy mb-1">
                    Courier Partner
                  </label>
                  <select
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 text-valuecart-navy bg-white focus:outline-none focus:ring-1 focus:ring-valuecart-green cursor-pointer font-medium"
                  >
                    <option value="Delhivery">Delhivery</option>
                    <option value="Shadowfax">Shadowfax</option>
                    <option value="XpressBees">XpressBees</option>
                    <option value="BlueDart">BlueDart</option>
                    <option value="India Post">India Post</option>
                    <option value="DTDC">DTDC</option>
                    <option value="Other">Other / Meesho Logistics</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-valuecart-navy mb-1">
                    Tracking Number (AWB)
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. DEL-99281729IN"
                    className="w-full h-10 px-3 rounded-xl border border-gray-300 text-valuecart-navy bg-white focus:outline-none focus:ring-1 focus:ring-valuecart-green font-bold text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  className="bg-valuecart-green hover:bg-valuecart-green-dark text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Supplier Sourcing Details</span>
                </button>

                {savedSupplierMsg && (
                  <span className="text-xs text-valuecart-green font-bold flex items-center gap-1 animate-fade-in">
                    <Check className="w-4 h-4" /> Saved successfully &amp; profit recalculated!
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Section: Customer & Delivery Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-valuecart-border/80 shadow-soft space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-valuecart-navy flex items-center gap-2 pb-3 border-b border-gray-100">
              <Truck className="w-4 h-4 text-valuecart-green" />
              <span>Customer &amp; Shipping Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-valuecart-text-muted block">Customer Name</span>
                <span className="font-bold text-sm text-valuecart-navy">{order.customer.name}</span>
              </div>

              <div>
                <span className="text-valuecart-text-muted block">Mobile Number</span>
                <span className="font-bold text-sm text-valuecart-navy">{order.customer.mobile}</span>
              </div>

              <div>
                <span className="text-valuecart-text-muted block">Email Address</span>
                <span className="font-medium text-valuecart-navy">{order.customer.email}</span>
              </div>

              <div>
                <span className="text-valuecart-text-muted block">State &amp; District</span>
                <span className="font-medium text-valuecart-navy">
                  {order.delivery.district}, {order.delivery.state}
                </span>
              </div>

              <div className="sm:col-span-2 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-[11px] font-bold text-valuecart-text-muted uppercase tracking-wider block mb-1">
                  Full Destination Address
                </span>
                <p className="text-xs text-valuecart-navy font-semibold leading-relaxed">
                  {order.delivery.houseFlat}, {order.delivery.streetArea}
                  {order.delivery.landmark ? `, Landmark: ${order.delivery.landmark}` : ''},
                  <br />
                  {order.delivery.city}, {order.delivery.district}, {order.delivery.state} -{' '}
                  <strong className="text-valuecart-green font-black">{order.delivery.pincode}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Section: Ordered Products */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-valuecart-border/80 shadow-soft space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-valuecart-navy pb-3 border-b border-gray-100">
              Ordered Products ({order.items.length})
            </h2>

            <div className="divide-y divide-gray-100">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 relative">
                      <img src={item.image} alt={item.productName} className="object-cover w-full h-full" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-valuecart-navy">{item.productName}</h4>
                      {item.variant && (
                        <span className="text-xs text-valuecart-text-muted block">
                          Variant: <strong className="text-valuecart-navy">{item.variant}</strong>
                        </span>
                      )}
                      <span className="text-xs text-valuecart-text-muted">
                        Qty: <strong className="text-valuecart-navy">{item.quantity}</strong> • Unit Selling: ₹{item.unitPrice}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-valuecart-navy block">
                      ₹{item.unitPrice * item.quantity}
                    </span>
                    <span className="text-[11px] text-amber-800 font-semibold block">
                      Supplier cost: ₹{item.supplierCost * item.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Order Status History / Audit Trail */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-valuecart-border/80 shadow-soft space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-valuecart-navy pb-2 border-b border-gray-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-valuecart-green" />
              <span>Status History &amp; Audit Trail</span>
            </h2>

            <div className="space-y-2.5">
              {order.statusHistory?.map((h: any, i: number) => (
                <div key={i} className="text-xs p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-valuecart-navy uppercase">
                      {h.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-valuecart-text-muted">
                      {new Date(h.timestamp).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-valuecart-text-muted mt-1">{h.note}</p>
                  <span className="text-[10px] text-gray-400 block mt-1">
                    Updated by: {h.updatedBy}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Status Controls, Marketing Attribution & Profit Breakdown (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: Change Workflow Status */}
          <div className="bg-white rounded-3xl p-6 border border-valuecart-border/80 shadow-soft space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-valuecart-navy pb-3 border-b border-gray-100">
              Update Order Status
            </h3>

            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-valuecart-navy mb-1.5">
                  Workflow Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 text-xs font-bold text-valuecart-navy bg-white focus:outline-none focus:ring-2 focus:ring-valuecart-green cursor-pointer"
                >
                  {workflowStatuses.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-valuecart-navy mb-1.5">
                  Status Note / Reason
                </label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Optional internal note..."
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs text-valuecart-navy focus:outline-none focus:ring-2 focus:ring-valuecart-green"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-valuecart-navy hover:bg-valuecart-navy-light text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Apply Status Update
              </button>
            </form>
          </div>

          {/* Card 2: Marketing Attribution (Section 4 requirement) */}
          <div className="bg-white rounded-3xl p-6 border border-valuecart-border/80 shadow-soft space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-valuecart-navy pb-2 border-b border-gray-100 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-purple-600" />
              <span>Marketing Attribution</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between pb-1.5 border-b border-gray-100">
                <span className="text-valuecart-text-muted">Source:</span>
                <span className="font-bold text-purple-700 uppercase">
                  {order.marketing.utm_source || 'Direct'}
                </span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-gray-100">
                <span className="text-valuecart-text-muted">Medium:</span>
                <span className="font-semibold text-valuecart-navy">
                  {order.marketing.utm_medium || 'Organic'}
                </span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-gray-100">
                <span className="text-valuecart-text-muted">Campaign:</span>
                <span className="font-bold text-valuecart-navy text-right max-w-[150px] truncate">
                  {order.marketing.utm_campaign || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-gray-100">
                <span className="text-valuecart-text-muted">Ad / Content:</span>
                <span className="font-semibold text-valuecart-navy">
                  {order.marketing.utm_content || 'N/A'}
                </span>
              </div>
              {order.marketing.fbclid && (
                <div className="pt-1">
                  <span className="text-[10px] text-gray-400 block">Meta Click ID (fbclid):</span>
                  <span className="text-[10px] font-mono text-gray-600 break-all">
                    {order.marketing.fbclid}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Unit Economics & Net Profit (Section 7 requirement) */}
          <div className="bg-white rounded-3xl p-6 border-2 border-valuecart-green/30 shadow-soft space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-valuecart-navy pb-2 border-b border-gray-100 flex items-center justify-between">
              <span>Profit &amp; Unit Economics</span>
              <span className="text-[10px] font-black bg-valuecart-green-tint text-valuecart-green px-2 py-0.5 rounded">
                ADMIN ONLY
              </span>
            </h3>

            <div className="space-y-2 text-xs text-valuecart-text-muted">
              <div className="flex justify-between text-valuecart-navy font-bold">
                <span>Customer Selling Price</span>
                <span>₹{order.financials.sellingPrice}</span>
              </div>

              <div className="flex justify-between text-amber-800">
                <span>- Supplier Sourcing Cost</span>
                <span>-₹{order.financials.supplierCost}</span>
              </div>

              <div className="flex justify-between text-blue-800">
                <span>- Gateway / Processing Fee</span>
                <span>-₹{order.financials.gatewayFee}</span>
              </div>

              <div className="flex justify-between text-purple-800">
                <span>- Advertising Cost (CAC)</span>
                <span>-₹{order.financials.advertisingCost}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>- Packaging &amp; Operational Reserve</span>
                <span>-₹{order.financials.otherCost}</span>
              </div>

              <div className="pt-3 border-t-2 border-dashed border-gray-200 flex justify-between items-baseline text-sm font-black text-valuecart-navy">
                <span>Estimated Net Profit</span>
                <span className="text-xl text-valuecart-green">
                  ₹{order.financials.estimatedProfit}
                </span>
              </div>

              <div className="text-[11px] text-right text-valuecart-text-muted">
                Margin: <strong className="text-valuecart-navy">
                  {order.financials.sellingPrice > 0
                    ? ((order.financials.estimatedProfit / order.financials.sellingPrice) * 100).toFixed(1)
                    : 0}%
                </strong>
              </div>
            </div>
          </div>

          {/* Card 4: Payment Details */}
          <div className="bg-white rounded-3xl p-6 border border-valuecart-border/80 shadow-soft space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-valuecart-navy pb-2 border-b border-gray-100">
              Payment Information
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-valuecart-text-muted">Method:</span>
                <span className="font-bold text-valuecart-navy">
                  {order.payment.method === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment (Razorpay)'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-valuecart-text-muted">Payment Status:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  order.payment.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {order.payment.status.toUpperCase()}
                </span>
              </div>

              {order.payment.transactionId && (
                <div className="pt-1">
                  <span className="text-valuecart-text-muted block">Transaction ID:</span>
                  <span className="font-mono text-[11px] font-semibold text-valuecart-navy">
                    {order.payment.transactionId}
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
