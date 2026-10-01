'use client';

import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { OrderStatus } from '@/types';

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useAdmin();

  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'profit-high' | 'price-high'>('date-desc');

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
                  <th className="p-4">Order ID &amp; Date</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Ordered Products</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Attribution / Campaign</th>
                  <th className="p-4">Workflow Status</th>
                  <th className="p-4">Supplier Cost</th>
                  <th className="p-4">Selling Total</th>
                  <th className="p-4 text-right">Est. Profit</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((ord) => {
                  const isCOD = ord.payment.method === 'cod';

                  return (
                    <tr key={ord.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Order & Date */}
                      <td className="p-4 font-bold text-valuecart-navy whitespace-nowrap">
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="hover:text-valuecart-green hover:underline block font-black text-sm"
                        >
                          {ord.orderNumber}
                        </Link>
                        <span className="text-[11px] text-valuecart-text-muted font-normal block mt-0.5">
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <div className="font-bold text-valuecart-navy">{ord.customer.name}</div>
                        <div className="text-[11px] text-valuecart-text-muted">{ord.customer.mobile}</div>
                        <div className="text-[10px] text-gray-400">
                          {ord.delivery.city}, {ord.delivery.state}
                        </div>
                      </td>

                      {/* Products */}
                      <td className="p-4 max-w-[200px]">
                        <div className="font-semibold text-valuecart-navy line-clamp-1">
                          {ord.items[0]?.productName}
                        </div>
                        {ord.items[0]?.variant && (
                          <span className="text-[10px] text-gray-500 block">
                            {ord.items[0].variant}
                          </span>
                        )}
                        {ord.items.length > 1 && (
                          <span className="text-[10px] font-bold text-valuecart-green">
                            +{ord.items.length - 1} more items
                          </span>
                        )}
                      </td>

                      {/* Payment */}
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
                        <span className="block text-[10px] text-valuecart-text-muted mt-0.5">
                          {ord.payment.status === 'paid' ? 'PAID' : 'PAYMENT PENDING'}
                        </span>
                      </td>

                      {/* Marketing Attribution */}
                      <td className="p-4 max-w-[150px]">
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-50 text-purple-700">
                          {ord.marketing.utm_source || 'direct'}
                        </span>
                        <span className="block text-[11px] text-valuecart-navy font-medium truncate mt-0.5">
                          {ord.marketing.utm_campaign || 'direct'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4 whitespace-nowrap">
                        {getStatusBadge(ord.orderStatus)}
                      </td>

                      {/* Supplier Cost */}
                      <td className="p-4 font-semibold text-amber-800 whitespace-nowrap">
                        ₹{ord.financials.supplierCost}
                      </td>

                      {/* Selling Price */}
                      <td className="p-4 font-black text-valuecart-navy whitespace-nowrap">
                        ₹{ord.financials.sellingPrice}
                      </td>

                      {/* Estimated Profit */}
                      <td className="p-4 text-right font-black text-valuecart-green whitespace-nowrap">
                        +₹{ord.financials.estimatedProfit}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="inline-flex items-center gap-1.5 bg-valuecart-navy hover:bg-valuecart-navy-light text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
