'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Banknote,
  CreditCard,
  Package,
  Layers,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

export default function AdminDashboardPage() {
  const { orders, getAnalytics } = useAdmin();
  const [timeframe, setTimeframe] = useState<'today' | '7days' | '30days' | 'all'>('all');

  const analytics = getAnalytics(timeframe);

  const pendingSupplierOrders = orders.filter((o) =>
    ['new', 'payment_confirmed', 'ready_for_supplier'].includes(o.orderStatus)
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Banner & Timeframe Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-valuecart-navy tracking-tight">
            Operations &amp; Performance Overview
          </h1>
          <p className="text-xs sm:text-sm text-valuecart-text-muted mt-1">
            Real-time tracking of reselling orders, supplier costs, Meta Ad spend and net profit.
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-gray-200 shadow-2xs self-start sm:self-auto">
          {[
            { id: 'today', label: 'Today' },
            { id: '7days', label: 'Last 7 Days' },
            { id: '30days', label: 'Last 30 Days' },
            { id: 'all', label: 'All Time' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTimeframe(t.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                timeframe === t.id
                  ? 'bg-valuecart-navy text-white shadow-xs'
                  : 'text-valuecart-text-muted hover:text-valuecart-navy'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Grid: Financial Economics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Net Estimated Profit */}
        <div className="bg-white rounded-3xl p-6 border border-valuecart-border/80 shadow-soft relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-valuecart-text-muted uppercase tracking-wider">
              Estimated Net Profit
            </span>
            <div className="w-9 h-9 rounded-xl bg-valuecart-green-tint text-valuecart-green flex items-center justify-center">
              <TrendingUp className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-valuecart-green">
              ₹{analytics.estimatedProfit.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-valuecart-text-muted mt-1 font-medium">
              <span>Margin:</span>
              <strong className="text-valuecart-navy font-bold">{analytics.revenue > 0 ? `${analytics.profitMargin.toFixed(1)}%` : '—'}</strong>
              <span className="text-gray-300">•</span>
              <span>ROAS: <strong className="text-valuecart-green">{analytics.advertisingCost > 0 ? `${analytics.roas.toFixed(2)}x` : '—'}</strong></span>
            </div>
          </div>
        </div>

        {/* Card 2: Gross Revenue */}
        <div className="bg-white rounded-3xl p-6 border border-valuecart-border/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-valuecart-text-muted uppercase tracking-wider">
              Gross Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-valuecart-navy">
              ₹{analytics.revenue.toLocaleString()}
            </div>
            <p className="text-xs text-valuecart-text-muted mt-1">
              From <strong className="text-valuecart-navy font-bold">{analytics.totalOrders}</strong> total orders
            </p>
          </div>
        </div>

        {/* Card 3: Supplier Costs (Meesho / Sourcing) */}
        <div className="bg-white rounded-3xl p-6 border border-valuecart-border/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-valuecart-text-muted uppercase tracking-wider">
              Supplier Sourcing Cost
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-amber-700">
              ₹{analytics.supplierCost.toLocaleString()}
            </div>
            <p className="text-xs text-valuecart-text-muted mt-1">
              {analytics.revenue > 0 && analytics.supplierCost > 0
                ? `${Math.round((analytics.supplierCost / analytics.revenue) * 100)}% of gross revenue`
                : '—'}
            </p>
          </div>
        </div>

        {/* Card 4: Advertising Cost (Meta Ads CAC) */}
        <div className="bg-white rounded-3xl p-6 border border-valuecart-border/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-valuecart-text-muted uppercase tracking-wider">
              Meta Ads Ad Spend
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-purple-900">
              ₹{analytics.advertisingCost.toLocaleString()}
            </div>
            <p className="text-xs text-valuecart-text-muted mt-1">
              Avg CAC: <strong className="text-valuecart-navy">{analytics.advertisingCost > 0 && analytics.totalOrders > 0 ? `₹${Math.round(analytics.advertisingCost / analytics.totalOrders)}` : '—'}</strong>
            </p>
          </div>
        </div>

      </div>

      {/* Secondary KPI Grid: Order Status Pipeline */}
      <div className="bg-white rounded-3xl p-6 border border-valuecart-border/80 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h2 className="text-sm font-bold uppercase tracking-wider text-valuecart-navy flex items-center gap-2">
            <Layers className="w-4 h-4 text-valuecart-green" />
            <span>Order Fulfillment Pipeline</span>
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs text-valuecart-green font-bold hover:underline flex items-center gap-1"
          >
            <span>View All Orders ({analytics.totalOrders})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-[11px] font-bold text-valuecart-text-muted block">Total Orders</span>
            <span className="text-xl font-black text-valuecart-navy mt-1 block">{analytics.totalOrders}</span>
          </div>

          <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100">
            <span className="text-[11px] font-bold text-blue-700 block">Today&apos;s Orders</span>
            <span className="text-xl font-black text-blue-800 mt-1 block">{analytics.todayOrders}</span>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-100">
            <span className="text-[11px] font-bold text-amber-700 block">Pending Supplier</span>
            <span className="text-xl font-black text-amber-800 mt-1 block">{analytics.pendingOrders}</span>
          </div>

          <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-100">
            <span className="text-[11px] font-bold text-indigo-700 block">Supplier Ordered</span>
            <span className="text-xl font-black text-indigo-800 mt-1 block">{analytics.processingOrders}</span>
          </div>

          <div className="p-3 bg-sky-50/70 rounded-2xl border border-sky-100">
            <span className="text-[11px] font-bold text-sky-700 block">Shipped / In Transit</span>
            <span className="text-xl font-black text-sky-800 mt-1 block">{analytics.shippedOrders}</span>
          </div>

          <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100">
            <span className="text-[11px] font-bold text-emerald-700 block">Delivered</span>
            <span className="text-xl font-black text-emerald-800 mt-1 block">{analytics.deliveredOrders}</span>
          </div>

          <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-100">
            <span className="text-[11px] font-bold text-rose-700 block">Cancelled</span>
            <span className="text-xl font-black text-rose-800 mt-1 block">{analytics.cancelledOrders}</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-[11px] font-bold text-gray-500 block">Returned</span>
            <span className="text-xl font-black text-gray-700 mt-1 block">{analytics.returnedOrders}</span>
          </div>
        </div>

        {/* Payment Methods breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between p-3.5 bg-valuecart-green-surface rounded-2xl border border-valuecart-green/20">
            <div className="flex items-center gap-3">
              <Banknote className="w-5 h-5 text-valuecart-green" />
              <div>
                <span className="text-xs font-bold text-valuecart-navy block">Cash on Delivery (COD)</span>
                <span className="text-[11px] text-valuecart-text-muted">Payment collected at delivery</span>
              </div>
            </div>
            <span className="text-lg font-black text-valuecart-green">{analytics.codOrders} orders</span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200/50">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-blue-700" />
              <div>
                <span className="text-xs font-bold text-valuecart-navy block">Prepaid / Online (Razorpay)</span>
                <span className="text-[11px] text-valuecart-text-muted">Instant payment captured</span>
              </div>
            </div>
            <span className="text-lg font-black text-blue-800">{analytics.onlineOrders} orders</span>
          </div>
        </div>
      </div>

      {/* Actionable Supplier Fulfillment Section */}
      {pendingSupplierOrders.length > 0 && (
        <div className="bg-amber-50/60 rounded-3xl p-6 border border-amber-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold text-amber-900">
                Action Required: {pendingSupplierOrders.length} Order(s) Need Manual Supplier Ordering
              </h3>
            </div>
            <span className="text-xs text-amber-700 font-semibold">
              Copy customer address &amp; place on Meesho
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingSupplierOrders.slice(0, 4).map((o) => (
              <div
                key={o.id}
                className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-valuecart-navy">{o.orderNumber}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      o.payment.method === 'cod' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {o.payment.method.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-valuecart-navy font-semibold mt-1">
                    {o.items[0]?.productName} ({o.customer.name})
                  </p>
                  <p className="text-[11px] text-valuecart-text-muted">
                    {o.delivery.city}, {o.delivery.state}
                  </p>
                </div>

                <Link
                  href={`/admin/orders/${o.id}`}
                  className="bg-valuecart-navy hover:bg-valuecart-navy-light text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shrink-0 flex items-center gap-1"
                >
                  <span>Fulfill</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl p-6 border border-valuecart-border/80 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h2 className="text-sm font-bold uppercase tracking-wider text-valuecart-navy flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-valuecart-green" />
            <span>Recent Customer Orders</span>
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs text-valuecart-green font-bold hover:underline"
          >
            View All ({orders.length}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-valuecart-navy font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Product</th>
                <th className="p-3">Source / Campaign</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
                <th className="p-3">Selling</th>
                <th className="p-3 text-right">Est. Profit</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.slice(0, 6).map((ord) => (
                <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-3 font-bold text-valuecart-navy">
                    {ord.orderNumber}
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-valuecart-navy">{ord.customer.name}</div>
                    <div className="text-[11px] text-valuecart-text-muted">{ord.customer.mobile}</div>
                  </td>
                  <td className="p-3 max-w-[180px] truncate">
                    <span className="font-medium text-valuecart-navy">
                      {ord.items[0]?.productName}
                    </span>
                    {ord.items.length > 1 && (
                      <span className="text-[10px] text-gray-400 block">+{ord.items.length - 1} more</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-100 text-valuecart-navy">
                      {ord.marketing.utm_source || 'direct'}
                    </span>
                    <span className="block text-[11px] text-valuecart-text-muted truncate max-w-[120px]">
                      {ord.marketing.utm_campaign || 'direct'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                      ord.payment.method === 'cod' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {ord.payment.method.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-gray-100 text-valuecart-navy">
                      {ord.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3 font-extrabold text-valuecart-navy">
                    ₹{ord.financials.sellingPrice}
                  </td>
                  <td className="p-3 text-right font-extrabold text-valuecart-green">
                    {ord.financials.supplierCost > 0 ? `+₹${ord.financials.estimatedProfit}` : '—'}
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/admin/orders/${ord.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-valuecart-green hover:underline"
                    >
                      <span>Manage</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
