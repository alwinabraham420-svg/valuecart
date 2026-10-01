'use client';

import React from 'react';
import Link from 'next/link';
import {
  Megaphone,
  TrendingUp,
  DollarSign,
  Sparkles,
  ExternalLink,
  Target,
  ArrowUpRight,
  Layers,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

export default function AdminMarketingPage() {
  const { getAnalytics } = useAdmin();
  const analytics = getAnalytics('all');

  // Pre-configured Meta Ads campaign data structured for future Meta Marketing API integration
  const metaCampaigns = [
    {
      id: 'camp-1',
      campaign: 'kitchen_chopper_october',
      productName: 'Vegetable Chopper',
      productSlug: 'vegetable-chopper',
      source: 'facebook',
      medium: 'paid_social',
      adSet: 'Kerala_Housewives_25-45',
      creative: 'video_01 (Quick salad demo)',
      ordersCount: 25,
      revenue: 14975,
      adSpend: 3750,
      cac: 150,
      supplierCost: 4750,
      gatewayFee: 350,
      otherCost: 500,
      estimatedProfit: 5625,
      roas: 3.99,
      status: 'ACTIVE_SCALING',
    },
    {
      id: 'camp-2',
      campaign: 'mens_fashion_kerala',
      productName: "Men's Casual Shirt",
      productSlug: 'mens-casual-shirt',
      source: 'instagram',
      medium: 'paid_social',
      adSet: 'Kerala_Men_18-35',
      creative: 'carousel_02 (3 Color variants)',
      ordersCount: 18,
      revenue: 8982,
      adSpend: 2250,
      cac: 125,
      supplierCost: 3510,
      gatewayFee: 216,
      otherCost: 450,
      estimatedProfit: 2556,
      roas: 3.99,
      status: 'ACTIVE_SCALING',
    },
    {
      id: 'camp-3',
      campaign: 'travel_backpack_diwali',
      productName: 'Travel Laptop Backpack',
      productSlug: 'travel-laptop-backpack',
      source: 'facebook',
      medium: 'paid_social',
      adSet: 'Tech_Travelers_South_India',
      creative: 'ugc_unboxing_01',
      ordersCount: 12,
      revenue: 10788,
      adSpend: 2400,
      cac: 200,
      supplierCost: 4320,
      gatewayFee: 264,
      otherCost: 480,
      estimatedProfit: 3324,
      roas: 4.49,
      status: 'ACTIVE',
    },
    {
      id: 'camp-4',
      campaign: 'tws_earbuds_scale',
      productName: 'Wireless Earbuds with ENC',
      productSlug: 'wireless-earbuds-with-enc',
      source: 'instagram',
      medium: 'paid_social',
      adSet: 'Kerala_Youth_Gamers',
      creative: 'reels_review_01',
      ordersCount: 14,
      revenue: 11186,
      adSpend: 2520,
      cac: 180,
      supplierCost: 4060,
      gatewayFee: 252,
      otherCost: 420,
      estimatedProfit: 3934,
      roas: 4.43,
      status: 'ACTIVE',
    },
  ];

  const totalCampaignOrders = metaCampaigns.reduce((acc, c) => acc + c.ordersCount, 0);
  const totalCampaignRevenue = metaCampaigns.reduce((acc, c) => acc + c.revenue, 0);
  const totalCampaignAdSpend = metaCampaigns.reduce((acc, c) => acc + c.adSpend, 0);
  const totalCampaignProfit = metaCampaigns.reduce((acc, c) => acc + c.estimatedProfit, 0);
  const overallRoas = (totalCampaignRevenue / totalCampaignAdSpend).toFixed(2);
  const overallCac = Math.round(totalCampaignAdSpend / totalCampaignOrders);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Title & Architecture Note */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-valuecart-navy tracking-tight">
            Marketing &amp; Meta Ads Performance
          </h1>
          <p className="text-xs sm:text-sm text-valuecart-text-muted mt-1">
            Track attributed revenue, Meta Ad spend, CAC and bottom-line profit per ad campaign.
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 text-purple-900 text-xs px-3.5 py-2 rounded-2xl flex items-center gap-2 self-start sm:self-auto">
          <Sparkles className="w-4 h-4 text-purple-700" />
          <span>Prepared for Meta Marketing API &amp; Conversions API</span>
        </div>
      </div>

      {/* Aggregate Marketing KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        <div className="bg-white rounded-3xl p-6 border border-valuecart-border/80 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-valuecart-text-muted block">
            Meta Attributed Orders
          </span>
          <div className="text-3xl font-black text-valuecart-navy mt-2">
            {totalCampaignOrders}
          </div>
          <span className="text-xs text-valuecart-text-muted block mt-1">
            Across 4 active ad sets
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-valuecart-border/80 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-valuecart-text-muted block">
            Total Meta Ad Spend
          </span>
          <div className="text-3xl font-black text-purple-900 mt-2">
            ₹{totalCampaignAdSpend.toLocaleString()}
          </div>
          <span className="text-xs text-valuecart-text-muted block mt-1">
            Average CAC: <strong className="text-valuecart-navy font-bold">₹{overallCac}</strong>
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-valuecart-border/80 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-valuecart-text-muted block">
            Meta Attributed Revenue
          </span>
          <div className="text-3xl font-black text-valuecart-navy mt-2">
            ₹{totalCampaignRevenue.toLocaleString()}
          </div>
          <span className="text-xs text-valuecart-green font-bold block mt-1">
            Blended ROAS: {overallRoas}x
          </span>
        </div>

        <div className="bg-gradient-to-br from-white to-valuecart-green-surface rounded-3xl p-6 border-2 border-valuecart-green/30 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-valuecart-green-dark block">
            Net Campaign Profit
          </span>
          <div className="text-3xl font-black text-valuecart-green mt-2">
            ₹{totalCampaignProfit.toLocaleString()}
          </div>
          <span className="text-xs text-valuecart-navy font-bold block mt-1">
            Net Margin: {((totalCampaignProfit / totalCampaignRevenue) * 100).toFixed(1)}%
          </span>
        </div>

      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-valuecart-border/80 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-valuecart-navy flex items-center gap-2">
              <Target className="w-4 h-4 text-valuecart-green" />
              <span>Active Meta Ads Campaigns &amp; Unit Sourcing Performance</span>
            </h2>
            <p className="text-xs text-valuecart-text-muted mt-0.5">
              Compare profit contribution after deducting wholesale supplier cost, Meta CAC, and payment fees.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-valuecart-navy font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-3.5">Campaign Name</th>
                <th className="p-3.5">Target Product</th>
                <th className="p-3.5">Platform</th>
                <th className="p-3.5">Orders</th>
                <th className="p-3.5">Revenue</th>
                <th className="p-3.5">Ad Spend</th>
                <th className="p-3.5">CAC</th>
                <th className="p-3.5">ROAS</th>
                <th className="p-3.5 text-right">Est. Profit</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {metaCampaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="p-3.5 font-bold text-valuecart-navy">
                    <span className="block font-black text-sm">{camp.campaign}</span>
                    <span className="text-[11px] text-valuecart-text-muted block mt-0.5">
                      Creative: {camp.creative}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <Link
                      href={`/product/${camp.productSlug}`}
                      target="_blank"
                      className="font-bold text-valuecart-navy hover:text-valuecart-green hover:underline"
                    >
                      {camp.productName}
                    </Link>
                  </td>

                  <td className="p-3.5">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                      {camp.source} ({camp.medium})
                    </span>
                  </td>

                  <td className="p-3.5 font-black text-sm text-valuecart-navy">
                    {camp.ordersCount}
                  </td>

                  <td className="p-3.5 font-black text-valuecart-navy">
                    ₹{camp.revenue.toLocaleString()}
                  </td>

                  <td className="p-3.5 font-bold text-purple-800">
                    ₹{camp.adSpend.toLocaleString()}
                  </td>

                  <td className="p-3.5 font-bold text-purple-900">
                    ₹{camp.cac}
                  </td>

                  <td className="p-3.5 font-black text-valuecart-green">
                    {camp.roas}x
                  </td>

                  <td className="p-3.5 text-right font-black text-sm text-valuecart-green whitespace-nowrap">
                    +₹{camp.estimatedProfit.toLocaleString()}
                  </td>

                  <td className="p-3.5 text-center whitespace-nowrap">
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {camp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Meta Ad Landing Direct URL Generator */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-valuecart-border/80 shadow-soft space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-valuecart-navy flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-valuecart-green" />
          <span>Meta Ads Campaign URL Builder &amp; Tracking Generator</span>
        </h3>
        <p className="text-xs text-valuecart-text-muted">
          Generate attribution links to paste into Meta Ads Manager (Facebook &amp; Instagram ads) to send traffic directly to winning product landing pages:
        </p>

        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 font-mono text-xs text-valuecart-navy break-all select-all">
          https://valuecart.in/product/vegetable-chopper?utm_source=facebook&amp;utm_medium=paid_social&amp;utm_campaign=kitchen_chopper_october&amp;utm_content=video_01
        </div>
      </div>

    </div>
  );
}
