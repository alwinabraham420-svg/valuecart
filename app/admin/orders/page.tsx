'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  ArrowUpDown,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Eye,
  CheckCircle2,
  Truck,
  Package,
  AlertCircle,
  Copy,
  Clock,
  Trash2,
  Loader2,
  X,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { Order, OrderStatus } from '@/types';

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus, deleteOrder } = useAdmin();

  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'profit-high' | 'price-high'>('date-desc');

  // Deletion modal & state
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  // Auto-focus Cancel button when confirmation modal opens to prevent accidental deletion
  useEffect(() => {
    if (orderToDelete) {
      const timer = setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [orderToDelete]);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && orderToDelete && !isDeleting) {
        setOrderToDelete(null);
        setDeleteError(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [orderToDelete, isDeleting]);

  const openDeleteModal = (ord: Order) => {
    setOrderToDelete(ord);
    setDeleteError(null);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setOrderToDelete(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete || isDeleting) return;

    setIsDeleting(true);
    setDeleteError(null);

    const targetOrderId = orderToDelete.id;
    const res = await deleteOrder(targetOrderId);

    setIsDeleting(false);

    if (res.success) {
      setOrderToDelete(null);
      setFeedback({
        type: 'success',
        message: 'Order deleted successfully.',
      });

      const timer = setTimeout(() => {
        setFeedback((prev) => (prev?.message === 'Order deleted successfully.' ? null : prev));
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      const errorMsg = 'Unable to delete this order. Please try again.';
      setDeleteError(errorMsg);
      setFeedback({
        type: 'error',
        message: errorMsg,
      });
    }
  };

  const filterTabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'new', label: 'New Orders' },
    { id: 'payment_confirmed', label: 'Payment Confirmed' },
    { id: 'cod', label: 'COD Orders' },
    { id: 'ready_for_supplier', label: 'Supplier Pending' },
    { id: 'supplier_ordered', label: 'Supplier Ordered' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'out_for_delivery', label: 'Out for Delivery' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'returned', label: 'Returned' },
  ];

  const filteredOrders = useMemo(() => {
    return orders
      .filter((ord) => {
        // Status Filter
        if (selectedFilter === 'cod') {
          if (ord.payment.method !== 'cod') return false;
        } else if (selectedFilter !== 'all') {
          if (ord.orderStatus !== selectedFilter) return false;
        }

        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matches =
            ord.orderNumber.toLowerCase().includes(q) ||
            ord.customer.name.toLowerCase().includes(q) ||
            ord.customer.mobile.includes(q) ||
            ord.delivery.city.toLowerCase().includes(q) ||
            ord.delivery.state.toLowerCase().includes(q) ||
            ord.items.some((i) => i.productName.toLowerCase().includes(q)) ||
            (ord.marketing.utm_campaign && ord.marketing.utm_campaign.toLowerCase().includes(q));
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'date-asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === 'profit-high') return b.financials.estimatedProfit - a.financials.estimatedProfit;
        if (sortBy === 'price-high') return b.financials.sellingPrice - a.financials.sellingPrice;
        return 0;
      });
  }, [orders, selectedFilter, search, sortBy]);

  const getStatusBadge = (status: OrderStatus) => {
    const map: Record<OrderStatus, { bg: string; text: string; label: string }> = {
      new: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'New Order' },
      payment_confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Payment Confirmed' },
      ready_for_supplier: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Ready for Supplier' },
      supplier_ordered: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Supplier Ordered' },
      supplier_confirmed: { bg: 'bg-sky-100', text: 'text-sky-800', label: 'Supplier Confirmed' },
      shipped: { bg: 'bg-cyan-100', text: 'text-cyan-800', label: 'Shipped' },
      out_for_delivery: { bg: 'bg-teal-100', text: 'text-teal-800', label: 'Out for Delivery' },
      delivered: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Delivered' },
      cancelled: { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Cancelled' },
      returned: { bg: 'bg-gray-200', text: 'text-gray-800', label: 'Returned' },
      refunded: { bg: 'bg-pink-100', text: 'text-pink-800', label: 'Refunded' },
    };
    const s = map[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    return (
      <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-valuecart-navy tracking-tight">
            Order Fulfillment &amp; Operations
          </h1>
          <p className="text-xs sm:text-sm text-valuecart-text-muted mt-1">
            Manage customer orders, execute manual supplier ordering on Meesho, and update shipping.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-2xl border border-gray-200 shadow-2xs text-xs">
            <span className="text-valuecart-text-muted">Total: </span>
            <strong className="text-valuecart-navy font-black text-sm">{orders.length}</strong>
          </div>
          <div className="bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200 text-xs">
            <span className="text-amber-800 font-bold">Needs Supplier: </span>
            <strong className="text-amber-900 font-black text-sm">
              {orders.filter((o) => ['new', 'payment_confirmed', 'ready_for_supplier'].includes(o.orderStatus)).length}
            </strong>
          </div>
        </div>
      </div>

      {/* Action Feedback Banner (Order deleted successfully / error) */}
      {feedback && (
        <div
          role="status"
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
            aria-label="Dismiss message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Tabs Bar (Horizontally scrollable) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {filterTabs.map((tab) => {
          const isActive = selectedFilter === tab.id;
          const count =
            tab.id === 'all'
              ? orders.length
              : tab.id === 'cod'
              ? orders.filter((o) => o.payment.method === 'cod').length
              : orders.filter((o) => o.orderStatus === tab.id).length;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
                isActive
                  ? 'bg-valuecart-navy text-white shadow-xs'
                  : 'bg-white hover:bg-gray-100 text-valuecart-text-muted hover:text-valuecart-navy border border-gray-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-valuecart-green text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Sort Controls */}
      <div className="bg-white p-4 rounded-3xl border border-valuecart-border/80 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, customer, phone, city, product or campaign..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-xs sm:text-sm text-valuecart-navy focus:outline-none focus:ring-2 focus:ring-valuecart-green"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto self-end sm:self-auto">
          <span className="text-xs text-valuecart-text-muted font-bold shrink-0">Sort by:</span>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-valuecart-navy font-bold focus:outline-none cursor-pointer"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="profit-high">Highest Profit</option>
              <option value="price-high">Highest Revenue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-valuecart-border/80 shadow-soft overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-valuecart-text-muted space-y-2">
            <ShoppingBag className="w-10 h-10 mx-auto text-gray-300" />
            <h3 className="text-sm font-bold text-valuecart-navy">No orders found</h3>
            <p className="text-xs">Try selecting a different filter or clearing your search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-valuecart-navy font-bold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Date / Time</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Mobile</th>
                  <th className="p-4">Products</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4">Order Status</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((ord) => {
                  const isCOD = ord.payment.method === 'cod';

                  return (
                    <tr key={ord.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Order ID */}
                      <td className="p-4 font-bold text-valuecart-navy whitespace-nowrap">
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="hover:text-valuecart-green hover:underline block font-black text-sm"
                        >
                          {ord.orderNumber}
                        </Link>
                      </td>

                      {/* Date/Time */}
                      <td className="p-4 whitespace-nowrap text-valuecart-text-muted">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <div className="font-bold text-valuecart-navy">{ord.customer.name}</div>
                        <div className="text-[10px] text-gray-400">
                          {ord.delivery.city ? `${ord.delivery.city}, ${ord.delivery.state}` : '—'}
                        </div>
                      </td>

                      {/* Mobile */}
                      <td className="p-4 whitespace-nowrap font-medium text-valuecart-navy">
                        {ord.customer.mobile || '—'}
                      </td>

                      {/* Products */}
                      <td className="p-4 max-w-[200px]">
                        <div className="font-semibold text-valuecart-navy line-clamp-1">
                          {ord.items[0]?.productName || 'Product'}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          Qty: {ord.items[0]?.quantity || 1}
                          {ord.items.length > 1 && (
                            <span className="ml-1 font-bold text-valuecart-green">
                              (+{ord.items.length - 1} more)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                            isCOD
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isCOD ? 'COD' : 'ONLINE'}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td className="p-4 whitespace-nowrap">
                        <span className={`text-[11px] font-semibold ${
                          ord.payment.status === 'paid' ? 'text-emerald-700' : 'text-amber-700'
                        }`}>
                          {ord.payment.status === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>

                      {/* Order Status */}
                      <td className="p-4 whitespace-nowrap">
                        {getStatusBadge(ord.orderStatus)}
                      </td>

                      {/* Total */}
                      <td className="p-4 text-right font-black text-valuecart-navy whitespace-nowrap">
                        ₹{ord.financials.sellingPrice.toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/orders/${ord.id}`}
                            className="inline-flex items-center gap-1.5 bg-valuecart-navy hover:bg-valuecart-navy-light text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(ord)}
                            className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
                            title={`Delete order ${ord.orderNumber}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {orderToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-order-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) {
              closeDeleteModal();
            }
          }}
        >
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header with Danger Trash Icon */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 id="delete-order-dialog-title" className="text-lg font-black text-valuecart-navy">
                  Delete this order?
                </h3>
                <p className="text-xs text-valuecart-text-muted leading-relaxed">
                  Are you sure you want to permanently delete order{' '}
                  <strong className="text-valuecart-navy font-black">{orderToDelete.orderNumber}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Error inside modal if attempt failed */}
            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-800 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{deleteError}</span>
              </div>
            )}

            {/* Buttons: Cancel is default/focused */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                ref={cancelBtnRef}
                type="button"
                disabled={isDeleting}
                onClick={closeDeleteModal}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-valuecart-navy hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
