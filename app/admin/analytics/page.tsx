'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  Package,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

export default function AdminAnalyticsPage() {
  const { getAnalytics } = useAdmin();
  const [timeframe, setTimeframe] = useState<'today' | 'yesterday' | '7days' | '30days' | 'this_month' | 'all'>('30days');

  const analytics = getAnalytics(timeframe);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Title & Date Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-valuecart-navy tracking-tight">
            Profit &amp; Unit Economics Analytics
          </h1>
          <p className="text-xs sm:text-sm text-valuecart-text-muted mt-1">
            Comprehensive P&amp;L breakdown across supplier sourcing, Meta ad spend, and net bottom line.
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-2xl border border-gray-200 shadow-2xs">
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: '7days', label: 'Last 7 Days' },
            { id: '30days', label: 'Last 30 Days' },
            { id: 'this_month', label: 'This Month' },
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

      {/* P&L Financial Cards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Gross Revenue */}
        <div className="bg-white rounded-3xl p-6 border border-valuecart-border/80 shadow-soft space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-valuecart-text-muted">
              Gross Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="text-3xl font-black text-valuecart-navy">
            ₹{analytics.revenue.toLocaleString()}
          </div>
          <span className="text-xs text-valuecart-text-muted block">
            Across <strong className="text-valuecart-navy font-bold">{analytics.totalOrders}</strong> completed &amp; placed customer orders
          </span>
        </div>

        {/* Card 2: Total Operating Costs */}
        <div className="bg-white rounded-3xl p-6 border border-valuecart-border/80 shadow-soft space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-valuecart-text-muted">
              Total Cost of Goods &amp; Ads
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Package className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-700">
            ₹{(analytics.supplierCost + analytics.advertisingCost + analytics.gatewayFees + analytics.otherCosts).toLocaleString()}
          </div>
          <div className="text-xs text-valuecart-text-muted space-x-2">
            <span>Supplier: ₹{analytics.supplierCost.toLocaleString()}</span>
            <span>•</span>
            <span>Ads: ₹{analytics.advertisingCost.toLocaleString()}</span>
          </div>
        </div>

        {/* Card 3: Net Estimated Profit */}
        <div className="bg-gradient-to-br from-white to-valuecart-green-surface rounded-3xl p-6 border-2 border-valuecart-green/30 shadow-soft space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-valuecart-green-dark">
              Estimated Net Profit
            </span>
            <div className="w-8 h-8 rounded-lg bg-valuecart-green text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="text-3xl font-black text-valuecart-green">
            ₹{analytics.estimatedProfit.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-valuecart-navy">
            <span>Profit Margin: <strong>{analytics.profitMargin.toFixed(1)}%</strong></span>
            <span>•</span>
            <span>ROAS: <strong className="text-valuecart-green">{analytics.roas.toFixed(2)}x</strong></span>
          </div>
        </div>

      </div>

      {/* Complete Financial Breakdown Waterfall Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-valuecart-border/80 shadow-soft space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-valuecart-navy pb-3 border-b border-gray-100 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-valuecart-green" />
          <span>Profit &amp; Loss (P&amp;L) Economics Breakdown</span>
        </h2>

        <div className="divide-y divide-gray-100 text-xs sm:text-sm">
          <div className="py-3 flex justify-between font-bold text-valuecart-navy">
            <span>Gross Customer Revenue</span>
            <span className="text-base font-black">₹{analytics.revenue.toLocaleString()}</span>
          </div>

          <div className="py-2.5 flex justify-between text-amber-800 font-medium">
            <span>- Supplier Sourcing Cost (Meesho / Wholesalers)</span>
            <span className="font-bold">-₹{analytics.supplierCost.toLocaleString()}</span>
          </div>

          <div className="py-2.5 flex justify-between text-purple-800 font-medium">
            <span>- Meta Ads Advertising Spend</span>
            <span className="font-bold">-₹{analytics.advertisingCost.toLocaleString()}</span>
          </div>

          <div className="py-2.5 flex justify-between text-blue-800 font-medium">
            <span>- Payment Gateway &amp; Processing Fees (Razorpay / COD fees)</span>
            <span className="font-bold">-₹{analytics.gatewayFees.toLocaleString()}</span>
          </div>

          <div className="py-2.5 flex justify-between text-gray-600 font-medium">
            <span>- Packaging, Returns (RTO) &amp; Operational Reserve</span>
            <span className="font-bold">-₹{analytics.otherCosts.toLocaleString()}</span>
          </div>

          <div className="py-3.5 flex justify-between items-baseline font-black text-valuecart-navy pt-4 border-t-2 border-dashed border-gray-200">
            <span className="text-sm sm:text-base">Net Realized / Estimated Profit</span>
            <span className="text-xl sm:text-2xl font-black text-valuecart-green">
              ₹{analytics.estimatedProfit.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Product-Level Unit Economics & Scaling Readiness Table (Section 14 requirement) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-valuecart-border/80 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-valuecart-navy flex items-center gap-2">
              <Package className="w-4 h-4 text-valuecart-green" />
              <span>Product Performance &amp; Meta Ads Scaling Evaluation</span>
            </h2>
            <p className="text-xs text-valuecart-text-muted mt-0.5">
              Identify winning products with positive ROAS and low CAC suitable for scaling Meta Ad budgets.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-valuecart-navy font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">Views</th>
                <th className="p-3.5">Add to Cart</th>
                <th className="p-3.5">Orders</th>
                <th className="p-3.5">Conv. Rate</th>
                <th className="p-3.5">Revenue</th>
                <th className="p-3.5">Ad Spend</th>
                <th className="p-3.5">CAC</th>
                <th className="p-3.5">Supplier Cost</th>
                <th className="p-3.5 text-right">Est. Profit</th>
                <th className="p-3.5 text-center">Scaling Suitability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {analytics.productPerformance.slice(0, 10).map((prod) => {
                const isWinner = prod.estimatedProfit > 0 && prod.ordersCount > 0;

                return (
                  <tr key={prod.productId} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-3.5 font-bold text-valuecart-navy max-w-[200px]">
                      <Link
                        href={`/product/${prod.slug}`}
                        target="_blank"
                        className="hover:text-valuecart-green hover:underline line-clamp-1"
                      >
                        {prod.name}
                      </Link>
                    </td>

                    <td className="p-3.5 text-valuecart-text-muted">{prod.views}</td>
                    <td className="p-3.5 text-valuecart-text-muted">{prod.addToCartCount}</td>
                    <td className="p-3.5 font-black text-valuecart-navy">{prod.ordersCount}</td>
                    <td className="p-3.5 font-semibold text-valuecart-navy">{prod.conversionRate}%</td>

                    <td className="p-3.5 font-bold text-valuecart-navy">₹{prod.revenue.toLocaleString()}</td>
                    <td className="p-3.5 font-bold text-purple-800">₹{prod.adSpend.toLocaleString()}</td>
                    <td className="p-3.5 font-bold text-purple-900">₹{prod.cac}</td>
                    <td className="p-3.5 font-bold text-amber-800">₹{prod.supplierCost.toLocaleString()}</td>

                    <td className="p-3.5 text-right font-black text-sm whitespace-nowrap">
                      <span className={prod.estimatedProfit >= 0 ? 'text-valuecart-green' : 'text-rose-600'}>
                        {prod.estimatedProfit >= 0 ? `+₹${prod.estimatedProfit}` : `₹${prod.estimatedProfit}`}
                      </span>
                    </td>

                    <td className="p-3.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isWinner
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {isWinner ? '🚀 READY TO SCALE' : 'TESTING PHASE'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
